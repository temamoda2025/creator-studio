import { NextResponse } from "next/server";
import type { ResearchPost } from "@/types/research";

export const maxDuration = 120;

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_BASE = "https://api.apify.com/v2";

type RawItem = Record<string, unknown>;

function normaliseHashtag(keyword: string): string {
  return keyword.trim().replace(/^#+/, "").replace(/\s+/g, "");
}

async function runActor(actorId: string, input: Record<string, unknown>): Promise<RawItem[]> {
  const url = `${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=115`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(118_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Apify ${actorId} → ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

async function searchInstagram(hashtag: string, limit: number): Promise<ResearchPost[]> {
  const items = await runActor("apify~instagram-hashtag-scraper", {
    hashtags: [hashtag],
    resultsLimit: limit,
  });

  return items.map((item): ResearchPost => {
    const likes = (item.likesCount as number) || 0;
    const comments = (item.commentsCount as number) || 0;
    const views = (item.videoViewCount as number) || 0;
    return {
      id: String(item.id || item.shortCode || crypto.randomUUID()),
      platform: "instagram",
      url:
        (item.url as string) ||
        `https://www.instagram.com/p/${item.shortCode}/`,
      caption: (item.caption as string) || "",
      username: (item.ownerUsername as string) || "",
      likes,
      comments,
      views,
      shares: 0,
      timestamp: (item.timestamp as string) || null,
      thumbnailUrl: (item.displayUrl as string) || null,
      engagementScore: likes + comments * 5 + views * 0.05,
    };
  });
}

async function searchTikTok(hashtag: string, limit: number): Promise<ResearchPost[]> {
  const items = await runActor("clockworks~free-tiktok-scraper", {
    hashtags: [`#${hashtag}`],
    resultsPerPage: limit,
  });

  return items.map((item): ResearchPost => {
    const meta = (item.authorMeta as Record<string, unknown>) || {};
    const likes = (item.diggCount as number) || 0;
    const comments = (item.commentCount as number) || 0;
    const views = (item.playCount as number) || 0;
    const shares = (item.shareCount as number) || 0;
    const covers = (item.covers as string[]) || [];
    return {
      id: String(item.id || crypto.randomUUID()),
      platform: "tiktok",
      url: (item.webVideoUrl as string) || "",
      caption: (item.text as string) || "",
      username:
        (meta.nickName as string) || (meta.name as string) || "",
      likes,
      comments,
      views,
      shares,
      timestamp: null,
      thumbnailUrl: covers[0] || null,
      engagementScore: likes + comments * 5 + views * 0.01 + shares * 10,
    };
  });
}

async function searchYouTube(keyword: string, limit: number): Promise<ResearchPost[]> {
  const items = await runActor("apify~youtube-scraper", {
    searchKeywords: keyword,
    maxResults: limit,
    type: "VIDEO",
  });

  return items.map((item): ResearchPost => {
    const views = (item.viewCount as number) || 0;
    const likes =
      (item.likes as number) || (item.likesCount as number) || 0;
    const comments =
      (item.commentsCount as number) ||
      (item.numberOfComments as number) ||
      0;
    return {
      id: String(item.id || crypto.randomUUID()),
      platform: "youtube",
      url: (item.url as string) || "",
      caption: (item.title as string) || "",
      username:
        (item.channelName as string) ||
        (item.channel as string) ||
        "",
      likes,
      comments,
      views,
      shares: 0,
      timestamp:
        (item.date as string) || (item.publishedAt as string) || null,
      thumbnailUrl: (item.thumbnailUrl as string) || null,
      engagementScore: likes + comments * 5 + views * 0.001,
    };
  });
}

async function searchLinkedIn(keyword: string, limit: number): Promise<ResearchPost[]> {
  const items = await runActor("curious_coder~linkedin-post-search-scraper", {
    keywords: keyword,
    resultsLimit: limit,
  });

  return items.map((item): ResearchPost => {
    const actor = (item.actor as Record<string, unknown>) || {};
    const likes =
      (item.likeCount as number) ||
      (item.totalReactionCount as number) ||
      0;
    const comments = (item.commentCount as number) || 0;
    const shares = (item.repostCount as number) || 0;
    return {
      id: String(item.id || item.urn || crypto.randomUUID()),
      platform: "linkedin",
      url:
        (item.postUrl as string) || (item.url as string) || "",
      caption:
        (item.text as string) || (item.commentary as string) || "",
      username:
        (actor.name as string) ||
        (item.authorName as string) ||
        "",
      likes,
      comments,
      views: 0,
      shares,
      timestamp:
        (item.publishedAt as string) ||
        (item.postedAt as string) ||
        null,
      thumbnailUrl: null,
      engagementScore: likes * 2 + comments * 8 + shares * 12,
    };
  });
}

export async function POST(request: Request) {
  if (!APIFY_TOKEN) {
    return NextResponse.json(
      { error: "APIFY_API_TOKEN is not configured. Add your token to .env.local." },
      { status: 500 }
    );
  }

  let body: { keyword?: string; platforms?: string[]; limit?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { keyword, platforms = ["instagram"], limit = 20 } = body;

  if (!keyword?.trim()) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  const hashtag = normaliseHashtag(keyword);
  const searches: Promise<ResearchPost[]>[] = [];

  if (platforms.includes("instagram")) {
    searches.push(
      searchInstagram(hashtag, limit).catch((e: Error) => {
        console.error("Instagram search error:", e.message);
        return [];
      })
    );
  }

  if (platforms.includes("tiktok")) {
    searches.push(
      searchTikTok(hashtag, limit).catch((e: Error) => {
        console.error("TikTok search error:", e.message);
        return [];
      })
    );
  }

  if (platforms.includes("youtube")) {
    searches.push(
      searchYouTube(keyword.trim(), limit).catch((e: Error) => {
        console.error("YouTube search error:", e.message);
        return [];
      })
    );
  }

  if (platforms.includes("linkedin")) {
    searches.push(
      searchLinkedIn(keyword.trim(), limit).catch((e: Error) => {
        console.error("LinkedIn search error:", e.message);
        return [];
      })
    );
  }

  const results = await Promise.all(searches);
  const posts = results
    .flat()
    .sort((a, b) => b.engagementScore - a.engagementScore);

  return NextResponse.json({ posts, keyword: hashtag, total: posts.length });
}
