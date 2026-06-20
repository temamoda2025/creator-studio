"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useBrands } from "@/context/BrandsContext";

interface TrendingAudioItem {
  id: string;
  title: string;
  artist: string;
  platform: "instagram" | "tiktok" | "both";
  usageCount: number;
  exampleUrl: string;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function AudioSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-black/10 p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="h-4 bg-black/8 rounded w-32" />
            <div className="h-5 bg-black/6 rounded-full w-16 shrink-0" />
          </div>
          <div className="h-3 bg-black/6 rounded w-24 mb-4" />
          <div className="h-3 bg-black/5 rounded w-20 mb-3" />
          <div className="h-3 bg-black/4 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── Audio card ───────────────────────────────────────────────────────────────

function AudioCard({ track }: { track: TrendingAudioItem }) {
  const platformLabel =
    track.platform === "both"
      ? "TikTok + IG"
      : track.platform === "tiktok"
      ? "TikTok"
      : "Instagram";

  const platformClass =
    track.platform === "both"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : track.platform === "tiktok"
      ? "bg-zinc-100 text-black/60 border-black/15"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className="border border-black/10 p-5 hover:border-black/25 transition-colors flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-medium leading-snug flex-1 min-w-0" title={track.title}>
          {track.title}
        </p>
        <span className={`shrink-0 text-[10px] border px-2 py-0.5 rounded-full whitespace-nowrap ${platformClass}`}>
          {platformLabel}
        </span>
      </div>

      {track.artist && (
        <p className="text-xs text-black/40 mb-3 truncate" title={track.artist}>
          {track.artist}
        </p>
      )}

      <p className="text-xs text-black/50 mt-auto">
        <span className="font-semibold text-black">{track.usageCount}</span>
        {" "}{track.usageCount === 1 ? "video" : "videos"} in sample
      </p>

      {track.exampleUrl && (
        <a
          href={track.exampleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-xs text-black/30 hover:text-black transition-colors"
        >
          See example →
        </a>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TrendingAudio() {
  const { activeBrand } = useBrands();
  const [audio,         setAudio]        = useState<TrendingAudioItem[]>([]);
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState<string | null>(null);
  const [searchInput,   setSearchInput]  = useState("");
  const [activeTerm,    setActiveTerm]   = useState<string | null>(null);
  const fetchedTermRef = useRef<string | null>(null);

  const fetchAudio = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/trending-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: term }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setAudio(json.audio ?? []);
      setActiveTerm(term);
      fetchedTermRef.current = term;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch trending audio");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch with niche when brand first loads / switches
  useEffect(() => {
    if (!activeBrand) return;
    setSearchInput(activeBrand.niche);
    setAudio([]);
    setError(null);
    setActiveTerm(null);
    fetchedTermRef.current = null;
    fetchAudio(activeBrand.niche);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrand?.id]);

  const handleSearch = () => {
    if (!searchInput.trim() || loading) return;
    fetchedTermRef.current = null;
    fetchAudio(searchInput.trim());
  };

  if (!activeBrand) {
    return (
      <div className="bg-white border border-black/10 p-10 text-center">
        <p className="text-sm text-black/40">Select a brand to see trending audio for your niche.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-black/10 p-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-0.5">Trending Audio</h2>
          <p className="text-xs text-black/35">
            Top sounds used in recent content on TikTok &amp; Instagram Reels
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Search a term — e.g. wedding entrance songs 2025, luxury car reels…"
            className="flex-1 border border-black/15 px-4 py-2.5 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors bg-white"
          />
          <button
            onClick={handleSearch}
            disabled={!searchInput.trim() || loading}
            className="shrink-0 text-sm bg-black text-white px-5 py-2.5 hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 px-5 py-3 text-xs text-red-600 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <AudioSkeleton />
        ) : audio.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-black/35 mb-1">
              No trending audio found for &ldquo;{activeTerm ?? searchInput}&rdquo;.
            </p>
            <p className="text-xs text-black/25">
              This can happen if recent posts don&rsquo;t carry music metadata, or the term returned no Reels.
            </p>
            <button
              onClick={handleSearch}
              className="mt-5 text-xs border border-black/15 px-5 py-2 rounded-full hover:border-black/40 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {activeTerm && (
              <p className="text-xs uppercase tracking-[0.15em] text-black/40 mb-4">
                Results for:{" "}
                <span className="text-black font-medium normal-case tracking-normal">{activeTerm}</span>
              </p>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {audio.map((track) => (
                <AudioCard key={track.id} track={track} />
              ))}
            </div>
            <p className="text-[11px] text-black/25 mt-6">
              Usage counts reflect appearances in a ~35-post sample per platform — not total Reels/videos on the platform.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
