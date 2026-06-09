export const revalidate = 60;

const IG_BASE = "https://graph.facebook.com/v20.0";

interface IgMediaItem {
  id: string;
  caption?: string;
  media_type: string;
  like_count: number;
  comments_count: number;
  timestamp: string;
  permalink: string;
}

interface IgInsightValue {
  value: number;
}

interface IgInsight {
  name: string;
  values?: IgInsightValue[];
  value?: number;
}

async function fetchInsights(
  mediaId: string,
  token: string
): Promise<{ impressions: number; reach: number; saved: number }> {
  try {
    const url = `${IG_BASE}/${mediaId}/insights?metric=impressions,reach,saved&access_token=${token}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return { impressions: 0, reach: 0, saved: 0 };

    const json = await res.json();
    const insights: IgInsight[] = json.data ?? [];

    const get = (name: string) => {
      const item = insights.find((i) => i.name === name);
      if (!item) return 0;
      if (typeof item.value === "number") return item.value;
      return item.values?.[0]?.value ?? 0;
    };

    return {
      impressions: get("impressions"),
      reach: get("reach"),
      saved: get("saved"),
    };
  } catch {
    return { impressions: 0, reach: 0, saved: 0 };
  }
}

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return Response.json(
      { error: "INSTAGRAM_ACCESS_TOKEN is not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch user info and recent media in parallel
    const [userRes, mediaRes] = await Promise.all([
      fetch(
        `${IG_BASE}/me?fields=id,username,followers_count,media_count&access_token=${token}`,
        { next: { revalidate: 60 } }
      ),
      fetch(
        `${IG_BASE}/me/media?fields=id,caption,media_type,like_count,comments_count,timestamp,permalink&limit=10&access_token=${token}`,
        { next: { revalidate: 60 } }
      ),
    ]);

    if (!userRes.ok) {
      const err = await userRes.json();
      return Response.json(
        { error: err.error?.message ?? "Failed to fetch Instagram user data" },
        { status: userRes.status }
      );
    }

    const user = await userRes.json();
    const mediaJson = mediaRes.ok ? await mediaRes.json() : { data: [] };
    const mediaItems: IgMediaItem[] = mediaJson.data ?? [];

    // Fetch insights for all posts in parallel
    const postsWithInsights = await Promise.all(
      mediaItems.map(async (item) => {
        const insights = await fetchInsights(item.id, token);
        return {
          id: item.id,
          caption: item.caption ?? "",
          mediaType: item.media_type,
          timestamp: item.timestamp,
          permalink: item.permalink,
          likeCount: item.like_count ?? 0,
          commentsCount: item.comments_count ?? 0,
          impressions: insights.impressions,
          reach: insights.reach,
          saved: insights.saved,
        };
      })
    );

    return Response.json({
      followers: user.followers_count ?? 0,
      mediaCount: user.media_count ?? 0,
      username: user.username ?? "",
      posts: postsWithInsights,
    });
  } catch (error) {
    console.error("Instagram stats error:", error);
    return Response.json(
      { error: "Failed to fetch Instagram stats" },
      { status: 500 }
    );
  }
}
