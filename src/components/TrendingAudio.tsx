"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useBrands } from "@/context/BrandsContext";

interface TrendingAudioItem {
  id: string;
  title: string;
  artist: string;
  playCount: number;
  videoCount: number;
  isTrendingUp: boolean;
  tiktokUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${Math.round(n / 1_000)}K`;
  return n > 0 ? String(n) : "—";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AudioSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-black/10 p-5">
          <div className="h-3.5 bg-black/8 rounded w-40 mb-2" />
          <div className="h-3 bg-black/5 rounded w-24 mb-5" />
          <div className="flex gap-4 mb-3">
            <div className="h-3 bg-black/6 rounded w-16" />
            <div className="h-3 bg-black/5 rounded w-16" />
          </div>
          <div className="h-7 bg-black/4 rounded-full w-28" />
        </div>
      ))}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function AudioCard({ track }: { track: TrendingAudioItem }) {
  return (
    <div className="border border-black/10 p-5 hover:border-black/25 transition-colors flex flex-col gap-4">
      {/* Title + trending badge */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium leading-snug flex-1 min-w-0" title={track.title}>
            {track.title}
          </p>
          <span
            className={`shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded ${
              track.isTrendingUp
                ? "text-emerald-700 bg-emerald-50"
                : "text-red-500 bg-red-50"
            }`}
          >
            {track.isTrendingUp ? "↑" : "↓"}
          </span>
        </div>
        {track.artist && (
          <p className="text-xs text-black/40 truncate" title={track.artist}>
            {track.artist}
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-5">
        {track.playCount > 0 && (
          <div>
            <p className="text-xs font-semibold tabular-nums">{fmtCount(track.playCount)}</p>
            <p className="text-[10px] text-black/35 mt-0.5">plays</p>
          </div>
        )}
        {track.videoCount > 0 && (
          <div>
            <p className="text-xs font-semibold tabular-nums">{fmtCount(track.videoCount)}</p>
            <p className="text-[10px] text-black/35 mt-0.5">videos</p>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="flex items-center gap-3 mt-auto">
        <a
          href={track.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs border border-black/15 px-3 py-1.5 rounded-full hover:bg-black hover:text-white hover:border-black transition-colors whitespace-nowrap"
        >
          Open on TikTok →
        </a>
        <a
          href={`https://www.tiktok.com/search?q=${encodeURIComponent(
            `${track.title} ${track.artist}`.trim()
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-black/35 hover:text-black transition-colors whitespace-nowrap"
        >
          Find videos
        </a>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TrendingAudio() {
  const { activeBrand } = useBrands();
  const [audio, setAudio]         = useState<TrendingAudioItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeTerm, setActiveTerm]   = useState<string | null>(null);
  const fetchedRef = useRef<boolean>(false);

  const fetchAudio = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trending-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: term }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setAudio(json.audio ?? []);
      setActiveTerm(json.niche ?? term);
      fetchedRef.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch trending audio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeBrand) return;
    setSearchInput(activeBrand.niche ?? "");
    setAudio([]);
    setError(null);
    setActiveTerm(null);
    fetchedRef.current = false;
    if (!activeBrand.niche?.trim()) return;
    fetchAudio(activeBrand.niche);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrand?.id]);

  const handleSearch = () => {
    if (!searchInput.trim() || loading) return;
    fetchedRef.current = false;
    fetchAudio(searchInput.trim());
  };

  if (!activeBrand) {
    return (
      <div className="bg-white border border-black/10 p-10 text-center">
        <p className="text-sm text-black/40">Select a brand to see trending audio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-black/10 p-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-0.5">Trending Audio</h2>
          <p className="text-xs text-black/35">
            Real trending sounds on TikTok — live play counts, video counts and direct links
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Search a niche — e.g. luxury fashion, wedding, fitness…"
            className="flex-1 border border-black/15 px-4 py-2.5 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors bg-white"
          />
          <button
            onClick={handleSearch}
            disabled={!searchInput.trim() || loading}
            className="shrink-0 text-sm bg-black text-white px-5 py-2.5 hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Loading…" : "Search"}
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
            <p className="text-sm text-black/35 mb-1">No trending audio loaded yet.</p>
            <p className="text-xs text-black/25">Enter a niche above and press Search.</p>
          </div>
        ) : (
          <>
            {activeTerm && (
              <div className="mb-5 px-4 py-3 bg-black/[0.03] border border-black/8 text-xs text-black/50">
                Showing trending TikTok sounds — globally trending, refreshed every 6 hours
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {audio.map((track) => (
                <AudioCard key={track.id} track={track} />
              ))}
            </div>

            {/* Instagram note */}
            <div className="mt-6 px-4 py-3 border border-black/8 text-xs text-black/45 bg-zinc-50">
              <span className="font-medium text-black/60">Instagram Reels audio</span> — Instagram
              trending audio isn&rsquo;t available via API. To find trending sounds for Reels,
              search the song name directly in Instagram&rsquo;s audio library or Reels tab.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
