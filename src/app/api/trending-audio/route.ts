// TikTok Trending Audio — real data via Apify's TikTok Creative Center Scraper
//
// Required Vercel env vars:
//   APIFY_API_TOKEN  — Personal API token from apify.com/account/integrations
//   APIFY_ACTOR_ID   — Actor ID from Apify marketplace (optional; defaults below)
//                      Search apify.com/store for "TikTok Creative Center" to find
//                      the actor that matches your subscription plan.
//                      Common options:
//                        clockworks~free-tiktok-scraper
//                        lexis-solutions~tiktok-creative-center-scraper
//
// The actor should accept input: { period, country, limit }
// and return an array of music objects with title/name, artist/author,
// play_count, video_count, and a TikTok music URL or music_id.

import { NextResponse } from "next/server";

export const maxDuration = 30;

export interface TrendingAudio {
  id: string;
  title: string;
  artist: string;
  playCount: number;
  videoCount: number;
  isTrendingUp: boolean;
  tiktokUrl: string;
}

// Module-level 6-hour cache (persists across warm serverless invocations)
const cache = new Map<string, { data: TrendingAudio[]; expires: number }>();

const SIX_HOURS = 6 * 60 * 60 * 1000;
const DEFAULT_ACTOR = "automation-lab~tiktok-trends-scraper";

function normalise(item: Record<string, unknown>, i: number): TrendingAudio {
  const rawId =
    String(item.music_id ?? item.musicId ?? item.id ?? i);
  const title = String(
    item.music_name ?? item.musicName ?? item.title ?? item.name ?? "Unknown"
  );
  const artist = String(
    item.author ?? item.artist ?? item.authorName ?? ""
  );
  const playCount = Number(
    item.play_count ?? item.playCount ?? item.plays ?? 0
  );
  const videoCount = Number(
    item.video_count ?? item.videoCount ?? item.videos ?? 0
  );
  const isTrendingUp =
    item.is_trending_up === true ||
    item.trendingUp === true ||
    item.trend === "up" ||
    item.trending === true ||
    true; // default optimistic

  // Build TikTok music page URL
  const tiktokUrl =
    String(item.url ?? item.musicUrl ?? item.music_url ?? item.tiktok_url ?? "") ||
    `https://www.tiktok.com/music/${encodeURIComponent(
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    )}-${rawId}`;

  return {
    id: `tt-${rawId}`,
    title,
    artist,
    playCount,
    videoCount,
    isTrendingUp,
    tiktokUrl,
  };
}

async function fetchFromApify(term: string, limit = 12): Promise<TrendingAudio[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error(
      "APIFY_API_TOKEN is not set. Add it in Vercel → Project Settings → Environment Variables."
    );
  }

  const actorId = process.env.APIFY_ACTOR_ID ?? DEFAULT_ACTOR;

  // run-sync-get-dataset-items: runs the actor synchronously and returns
  // dataset items as a JSON array. timeout=120 gives the TikTok scraper
  // enough runway; memory=1024 MB is typical for browser-based actors.
  const url =
    `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items` +
    `?token=${token}&format=json&timeout=120&memory=1024`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // automation-lab~tiktok-trends-scraper input schema:
      // https://apify.com/automation-lab/tiktok-trends-scraper
      keyword: term,
      period: 7,       // integer: 7 | 30 | 120 days
      country: "AU",
      limit,
    }),
  });

  // Always read as text first — Apify can return plain-text or HTML errors
  // even on 2xx status codes (e.g. actor runtime errors, gateway timeouts).
  const rawBody = await res.text().catch(() => "");
  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok || !isJson) {
    console.error(
      `[trending-audio] Apify error — status: ${res.status}, ` +
      `content-type: ${contentType}, body: ${rawBody.slice(0, 500)}`
    );
    throw new Error(
      `Trending audio source temporarily unavailable (${res.status}). ` +
      `Actor said: ${rawBody.slice(0, 150)}`
    );
  }

  let items: unknown;
  try {
    items = JSON.parse(rawBody);
  } catch (parseErr) {
    console.error(
      `[trending-audio] JSON parse failed — body was: ${rawBody.slice(0, 500)}`
    );
    throw new Error("Trending audio source returned unexpected data. Please try again.");
  }

  if (!Array.isArray(items)) {
    console.error("[trending-audio] Apify response not an array:", rawBody.slice(0, 300));
    throw new Error("Trending audio source returned unexpected data. Please try again.");
  }

  return items
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map(normalise)
    .filter((t) => t.title !== "Unknown");
}

export async function POST(request: Request) {
  let niche: string;
  try {
    ({ niche } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!niche?.trim()) {
    return NextResponse.json({ error: "niche is required" }, { status: 400 });
  }

  const CACHE_KEY = `tiktok-au-${niche.trim().toLowerCase()}`;

  const cached = cache.get(CACHE_KEY);
  if (cached && Date.now() < cached.expires) {
    return NextResponse.json(
      { audio: cached.data, niche: niche.trim(), cached: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const audio = await fetchFromApify(niche.trim(), 12);

    if (audio.length === 0) {
      return NextResponse.json(
        { error: "No trending audio returned. Check your APIFY_ACTOR_ID actor input schema." },
        { status: 502 }
      );
    }

    cache.set(CACHE_KEY, { data: audio, expires: Date.now() + SIX_HOURS });

    return NextResponse.json(
      { audio, niche: niche.trim(), cached: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[trending-audio]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch trending audio" },
      { status: 500 }
    );
  }
}
