import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const client = new Anthropic();

export interface TrendingAudio {
  id: string;
  title: string;
  artist: string;
  genre: string;
  whyItWorks: string;
  contentStyle: string;
  platform: "tiktok" | "instagram";
  exampleUrl: string;
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

  const prompt = `You are a social media music curator. Generate 8 currently trending songs perfect for "${term}" content — 4 for TikTok and 4 for Instagram Reels.

Return ONLY a raw JSON array — no markdown fences, no explanation, no text before or after. Each item must have exactly these fields:
[
  {
    "title": "Song title",
    "artist": "Artist name",
    "genre": "Genre (2-3 words, e.g. Ambient Pop, Phonk, Lo-fi Hip Hop)",
    "whyItWorks": "One sentence explaining why this song resonates with ${term} content specifically",
    "contentStyle": "Suggested reel style (2-5 words, e.g. slow motion entrance, transformation reel, behind the scenes)",
    "platform": "tiktok or instagram"
  }
]

Rules:
- Return exactly 8 songs: the first 4 must have "platform": "tiktok", the last 4 must have "platform": "instagram"
- Different songs for each platform — no repeats
- Focus on songs that have been used in viral content for this category
- Mix of genres and energy levels across the 8 songs
- whyItWorks must reference "${term}" specifically — no generic phrases
- contentStyle must be a specific, actionable format
- Raw JSON only — no markdown, no code fences, no explanation`;

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Extract the JSON array even if Claude wraps it in prose or fences
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    console.error("[trending-audio] No JSON array found in response:", raw);
    return NextResponse.json(
      { error: "Failed to parse audio suggestions" },
      { status: 500 },
    );
  }

  let songs: TrendingAudio[];
  try {
    const parsed = JSON.parse(match[0]);
    songs = (Array.isArray(parsed) ? parsed : []).map(
      (s: Record<string, string>, i: number) => {
        const title = String(s.title ?? "");
        const artist = String(s.artist ?? "");
        const platform = s.platform === "instagram" ? "instagram" : "tiktok";
        const exampleUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(`${title} ${artist}`)}`;
        return {
          id: `audio-${i}-${Date.now()}`,
          title,
          artist,
          genre: String(s.genre ?? ""),
          whyItWorks: String(s.whyItWorks ?? ""),
          contentStyle: String(s.contentStyle ?? ""),
          platform,
          exampleUrl,
        };
      },
    );
  } catch (e) {
    console.error("[trending-audio] JSON.parse failed:", e, "\nExtracted:", match[0]);
    return NextResponse.json(
      { error: "Failed to parse audio suggestions" },
      { status: 500 },
    );
  }

  return NextResponse.json({ audio: songs, niche: term });
}
