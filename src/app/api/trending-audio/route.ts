// Trending Audio — real data via Claude Sonnet 4.6 + web_search_20260209
//
// Required env vars:
//   ANTHROPIC_API_KEY  — already set for other features in this project
//
// Claude searches TikTok Creative Center, Tokboard, ChartMetric, and music
// industry blogs for currently trending songs, then returns structured JSON.
// Results are cached per search term for 12 hours in module-level memory
// (persists across warm serverless invocations).

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const client = new Anthropic();

export interface TrendingAudio {
  id: string;
  title: string;
  artist: string;
  platform: "TikTok" | "Instagram" | "Both";
  exampleUrl: string;
  whyItWorks: string;
  contentStyle: string;
}

// 12-hour module-level cache (persists across warm serverless invocations)
const cache = new Map<string, { data: TrendingAudio[]; expires: number }>();
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

function buildPrompt(term: string): string {
  return `Search the web for ACTUAL currently trending songs being used on TikTok and Instagram Reels right now for "${term}" content creators.

Search recent sources from the last 7-14 days including:
- TikTok Creative Center trending sounds (tiktok.com/business)
- Tokboard.com TikTok music charts
- ChartMetric trending audio reports (chartmetric.com)
- Music industry blogs, social media marketing newsletters, creator economy news

Return EXACTLY 8 real, currently trending songs as a raw JSON array — no markdown fences, no preamble, no explanation — ONLY the JSON:
[
  {
    "title": "Exact song title",
    "artist": "Artist name",
    "platform": "TikTok" | "Instagram" | "Both",
    "exampleUrl": "https://www.tiktok.com/search?q=Song+Title+Artist or real Instagram audio URL",
    "whyItWorks": "One sentence explaining why this works for ${term} content specifically",
    "contentStyle": "Suggested reel format e.g. slow motion entrance, transformation cut, behind the scenes"
  }
]

Requirements:
- Songs must be genuinely trending RIGHT NOW, not historically popular
- Mix: aim for 4 songs leaning TikTok-viral and 4 that work on Instagram Reels
- exampleUrl must be a real working URL — use TikTok search URLs if no direct music link
- whyItWorks must specifically mention "${term}"
- Return ONLY the raw JSON array, nothing else`;
}

async function fetchViaClaude(term: string): Promise<TrendingAudio[]> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildPrompt(term) },
  ];

  let raw = "";
  const MAX_ITERS = 5;

  for (let iter = 0; iter < MAX_ITERS; iter++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      // web_search_20260209 is server-executed — don't annotate as Tool[]
      tools: [{ type: "web_search_20260209", name: "web_search" }],
      messages,
    });

    if (response.stop_reason === "end_turn") {
      raw = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      break;
    }

    // pause_turn: server tool hit iteration limit — append and re-send
    // tool_use: tool executing server-side — append and re-send (no client tool_result needed)
    messages.push({ role: "assistant", content: response.content });
  }

  if (!raw.trim()) {
    throw new Error("No text response from Claude web search");
  }

  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    console.error("[trending-audio] No JSON array in Claude response:", raw.slice(0, 300));
    throw new Error("Could not extract song list from search results");
  }

  const parsed: unknown = JSON.parse(match[0]);
  const songs: TrendingAudio[] = (Array.isArray(parsed) ? parsed : []).map(
    (s: Record<string, unknown>, i: number) => ({
      id: `audio-${i}-${Date.now()}`,
      title: String(s.title ?? ""),
      artist: String(s.artist ?? ""),
      platform: (["TikTok", "Instagram", "Both"].includes(String(s.platform ?? ""))
        ? String(s.platform)
        : "Both") as TrendingAudio["platform"],
      exampleUrl: String(s.exampleUrl ?? ""),
      whyItWorks: String(s.whyItWorks ?? ""),
      contentStyle: String(s.contentStyle ?? ""),
    })
  );

  if (songs.length === 0) {
    throw new Error("No songs returned from search. Please try again.");
  }

  return songs;
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

  const term = niche.trim();
  const cacheKey = term.toLowerCase();

  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return NextResponse.json(
      { audio: cached.data, niche: term, cached: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const audio = await fetchViaClaude(term);

    cache.set(cacheKey, { data: audio, expires: Date.now() + TWELVE_HOURS });

    return NextResponse.json(
      { audio, niche: term, cached: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[trending-audio]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch trending audio",
      },
      { status: 500 }
    );
  }
}
