import { NextResponse } from "next/server";

export const maxDuration = 120;

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_BASE = "https://api.apify.com/v2";

export interface TrendingAudio {
  id: string;
  title: string;
  artist: string;
  platform: "instagram" | "tiktok" | "both";
  usageCount: number;
  exampleUrl: string;
}

type RawItem = Record<string, unknown>;

async function runActor(actorId: string, input: Record<string, unknown>): Promise<RawItem[]> {
  const url = `${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=110`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(115_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Apify ${actorId} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function slugKey(title: string, artist: string): string {
  return `${title.toLowerCase().trim()}|||${artist.toLowerCase().trim()}`;
}

async function tiktokAudio(niche: string): Promise<TrendingAudio[]> {
  const hashtag = niche.toLowerCase().replace(/[\s&/\\]+/g, "");
  const items = await runActor("clockworks~free-tiktok-scraper", {
    hashtags: [`#${hashtag}`],
    resultsPerPage: 35,
  });

  const map = new Map<string, { title: string; artist: string; count: number; url: string; original: boolean }>();

  for (const item of items) {
    const m = item.musicMeta as Record<string, unknown> | undefined;
    if (!m) continue;
    const id      = String(m.musicId ?? "");
    const title   = String(m.musicName ?? "").trim();
    const artist  = String(m.musicAuthor ?? "").trim();
    const original = Boolean(m.musicOriginal);
    const url     = String(item.webVideoUrl ?? "");
    if (!id || !title) continue;

    const existing = map.get(id);
    if (existing) {
      existing.count++;
    } else {
      map.set(id, { title, artist, count: 1, url, original });
    }
  }

  return Array.from(map.values())
    .map((d) => ({
      id: `tt-${slugKey(d.title, d.artist)}`,
      title: d.title,
      artist: d.original ? "Original sound" : d.artist,
      platform: "tiktok" as const,
      usageCount: d.count,
      exampleUrl: d.url,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 12);
}

async function instagramAudio(niche: string): Promise<TrendingAudio[]> {
  const hashtag = niche.toLowerCase().replace(/[\s&/\\]+/g, "");
  const items = await runActor("apify~instagram-hashtag-scraper", {
    hashtags: [hashtag],
    resultsLimit: 35,
  });

  const map = new Map<string, { title: string; artist: string; count: number; url: string }>();

  for (const item of items) {
    const isVideo =
      item.type === "Video" ||
      item.productType === "clips" ||
      item.mediaType === "VIDEO";
    if (!isVideo) continue;

    const music = (
      item.musicInfo ?? item.clipsMusicAttributionInfo ?? item.music
    ) as Record<string, unknown> | undefined;
    if (!music) continue;

    const id     = String(music.id ?? music.musicId ?? music.audioAssetId ?? "");
    const title  = String(music.title ?? music.songName ?? music.name ?? music.audioAssetTitle ?? "").trim();
    const artist = String(music.artist_name ?? music.artistName ?? music.author ?? music.byArtist ?? "").trim();
    const url    = String(item.url ?? `https://www.instagram.com/p/${item.shortCode}/`);
    if (!title) continue;

    const key = id || slugKey(title, artist);
    const existing = map.get(key);
    if (existing) {
      existing.count++;
    } else {
      map.set(key, { title, artist, count: 1, url });
    }
  }

  return Array.from(map.values())
    .map((d) => ({
      id: `ig-${slugKey(d.title, d.artist)}`,
      title: d.title,
      artist: d.artist,
      platform: "instagram" as const,
      usageCount: d.count,
      exampleUrl: d.url,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 12);
}

export async function POST(request: Request) {
  if (!APIFY_TOKEN) {
    return NextResponse.json(
      { error: "APIFY_API_TOKEN is not configured." },
      { status: 500 }
    );
  }

  let niche: string;
  try {
    ({ niche } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!niche?.trim()) {
    return NextResponse.json({ error: "niche is required" }, { status: 400 });
  }

  const [ttResult, igResult] = await Promise.allSettled([
    tiktokAudio(niche.trim()),
    instagramAudio(niche.trim()),
  ]);

  if (ttResult.status === "rejected") console.error("TikTok audio error:", ttResult.reason);
  if (igResult.status === "rejected") console.error("Instagram audio error:", igResult.reason);

  const tiktok    = ttResult.status === "fulfilled" ? ttResult.value : [];
  const instagram = igResult.status === "fulfilled" ? igResult.value : [];

  // Merge: same song on both platforms → "both" + combined count
  const merged = new Map<string, TrendingAudio>();
  for (const track of tiktok) {
    merged.set(slugKey(track.title, track.artist), track);
  }
  for (const track of instagram) {
    const key = slugKey(track.title, track.artist);
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, { ...existing, platform: "both", usageCount: existing.usageCount + track.usageCount });
    } else {
      merged.set(key, track);
    }
  }

  const audio = Array.from(merged.values())
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 15);

  return NextResponse.json({ audio, niche: niche.trim() });
}
