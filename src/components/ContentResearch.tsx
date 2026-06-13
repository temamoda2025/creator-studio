"use client";

import { useState } from "react";
import { useBrands } from "@/context/BrandsContext";
import type { ResearchPost } from "@/types/research";

type Platform = "instagram" | "tiktok" | "youtube" | "linkedin";

const PLATFORM_OPTIONS: { id: Platform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
];

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const BADGE_STYLES: Record<Platform, { className: string; label: string }> = {
  instagram: { className: "bg-pink-50 text-pink-600 border border-pink-200", label: "IG" },
  tiktok:    { className: "bg-black/6 text-black/50 border border-black/10", label: "TT" },
  youtube:   { className: "bg-red-50 text-red-600 border border-red-200",   label: "YT" },
  linkedin:  { className: "bg-blue-50 text-blue-600 border border-blue-200", label: "LI" },
};

function PlatformBadge({ platform }: { platform: Platform }) {
  const { className, label } = BADGE_STYLES[platform];
  return (
    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

function PostCard({
  post,
  onInspire,
}: {
  post: ResearchPost;
  onInspire: (idea: string) => void;
}) {
  const firstLine = post.caption.split(/\n/)[0].trim();
  const hook = firstLine.slice(0, 120) + (firstLine.length > 120 ? "…" : "");
  const preview = post.caption.slice(0, 220);
  const isYouTube = post.platform === "youtube";
  const isLinkedIn = post.platform === "linkedin";

  return (
    <div className="bg-white border border-black/10 hover:border-black/25 transition-colors flex flex-col group">
      {/* YouTube thumbnail */}
      {isYouTube && post.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.thumbnailUrl}
          alt={post.caption}
          className="w-full aspect-video object-cover border-b border-black/8"
        />
      )}

      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <PlatformBadge platform={post.platform} />
            <span className="text-xs font-medium text-black/60 truncate">
              {isLinkedIn ? post.username : `@${post.username || "unknown"}`}
            </span>
          </div>
          {post.timestamp && (
            <span className="text-[10px] text-black/25 shrink-0">
              {new Date(post.timestamp).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>

        {/* Title / Caption */}
        <div className="flex-1">
          {post.caption ? (
            <p className={`text-sm text-black/70 leading-relaxed line-clamp-4 ${isYouTube ? "font-medium" : ""}`}>
              {preview}
              {post.caption.length > 220 && "…"}
            </p>
          ) : (
            <p className="text-sm text-black/25 italic">No content</p>
          )}
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-xs flex-wrap">
          {post.likes > 0 && (
            <span className="text-black/40">
              {isLinkedIn ? "👍" : "♥"}{" "}
              <span className="font-medium text-black/60">{fmt(post.likes)}</span>
            </span>
          )}
          {post.comments > 0 && (
            <span className="text-black/40">
              💬 <span className="font-medium text-black/60">{fmt(post.comments)}</span>
            </span>
          )}
          {post.views > 0 && (
            <span className="text-black/40">
              ▶ <span className="font-medium text-black/60">{fmt(post.views)}</span>
            </span>
          )}
          {post.shares > 0 && (
            <span className="text-black/40">
              ↗ <span className="font-medium text-black/60">{fmt(post.shares)}</span>
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-black/8">
          {post.url ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-black/25 hover:text-black/60 transition-colors"
            >
              View ↗
            </a>
          ) : (
            <span />
          )}
          <button
            onClick={() => onInspire(hook || post.caption.slice(0, 120))}
            className="text-xs border border-black/15 text-black/50 hover:text-black hover:border-black/40 px-3 py-1.5 rounded-full transition-colors"
          >
            Generate with ADORAR™ →
          </button>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white border border-black/10 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-8 bg-black/8 rounded-full" />
            <div className="h-3 w-28 bg-black/6 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-2.5 bg-black/6 rounded w-full" />
            <div className="h-2.5 bg-black/6 rounded w-5/6" />
            <div className="h-2.5 bg-black/6 rounded w-4/6" />
            <div className="h-2.5 bg-black/6 rounded w-3/4" />
          </div>
          <div className="flex gap-4">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-2.5 w-14 bg-black/6 rounded" />
            ))}
          </div>
          <div className="border-t border-black/6 pt-3 flex justify-end">
            <div className="h-6 w-40 bg-black/6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ContentResearch({
  onInspire,
}: {
  onInspire: (idea: string) => void;
}) {
  const { activeBrand } = useBrands();

  const [keyword, setKeyword] = useState(activeBrand?.niche ?? "");
  const [platforms, setPlatforms] = useState<Platform[]>(["instagram"]);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<ResearchPost[] | null>(null);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p)
        ? prev.length > 1
          ? prev.filter((x) => x !== p)
          : prev
        : [...prev, p]
    );
  };

  const search = async () => {
    if (!keyword.trim() || loading) return;
    setLoading(true);
    setPosts(null);
    setError(null);
    setSearchedKeyword(keyword.trim());

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), platforms, limit }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setPosts(data.posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canSearch = !!keyword.trim() && !loading;

  return (
    <div className="space-y-8">
      {/* Search form */}
      <div className="bg-white border border-black/10 p-8">
        <div className="max-w-2xl">
          <h2 className="text-base font-semibold mb-1">Content Research</h2>
          <p className="text-sm text-black/40 mb-8 leading-relaxed">
            Find viral and trending posts by niche or keyword. Results are sorted by engagement
            and fetched via Apify.
          </p>

          <div className="space-y-5">
            {/* Keyword */}
            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Keyword / Hashtag <span className="text-black/60">*</span>
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSearch && search()}
                placeholder="e.g. minimalist fashion, clean eating, morning routine"
                className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white"
              />
              <p className="text-[11px] text-black/30 mt-1.5">
                Spaces and # are handled automatically.
              </p>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Platform
              </label>
              <div className="flex gap-2">
                {PLATFORM_OPTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => togglePlatform(id)}
                    className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                      platforms.includes(id)
                        ? "bg-black text-white border-black"
                        : "border-black/15 text-black/60 hover:border-black/40 hover:text-black"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-black/30 mt-1.5">
                Select both to search across platforms simultaneously.
              </p>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Results per platform
              </label>
              <div className="flex gap-2">
                {[10, 20, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => setLimit(n)}
                    className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                      limit === n
                        ? "bg-black text-white border-black"
                        : "border-black/15 text-black/60 hover:border-black/40 hover:text-black"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={search}
              disabled={!canSearch}
              className="mt-2 bg-black text-white text-sm px-8 py-3 rounded-full hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-black/40">
              Fetching trending content from{" "}
              {platforms.map((p) => PLATFORM_LABEL[p]).join(" & ")}
              …
            </p>
          </div>
          <Skeleton />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {posts && !loading && (
        <div className="space-y-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-black/30 uppercase tracking-wider mb-1">Results</p>
              <p className="text-sm">
                <span className="font-semibold">{posts.length}</span> results for{" "}
                <span className="font-semibold">"{searchedKeyword}"</span>
                {" "}· sorted by engagement
              </p>
            </div>
            <button
              onClick={search}
              className="text-xs text-black/30 hover:text-black transition-colors"
            >
              Refresh ↺
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white border border-black/10 p-12 text-center">
              <p className="text-sm text-black/40 mb-2">No results found for "{searchedKeyword}".</p>
              <p className="text-xs text-black/25">
                Try a more popular hashtag, or check your Apify API token in .env.local.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <PostCard
                  key={`${post.platform}-${post.id}`}
                  post={post}
                  onInspire={onInspire}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
