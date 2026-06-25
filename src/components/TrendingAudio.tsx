"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useBrands } from "@/context/BrandsContext";

interface TrendingAudioItem {
  id: string;
  title: string;
  artist: string;
  platform: "TikTok" | "Instagram" | "Both";
  exampleUrl: string;
  whyItWorks: string;
  contentStyle: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AudioSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-black/10 p-5">
          <div className="h-3 bg-black/8 rounded w-16 mb-3" />
          <div className="h-3.5 bg-black/8 rounded w-40 mb-2" />
          <div className="h-3 bg-black/5 rounded w-24 mb-5" />
          <div className="h-8 bg-black/4 rounded w-full mb-3" />
          <div className="h-3 bg-black/5 rounded w-32 mb-4" />
          <div className="h-7 bg-black/4 rounded-full w-28" />
        </div>
      ))}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

const PLATFORM_STYLES: Record<
  TrendingAudioItem["platform"],
  { label: string; className: string }
> = {
  TikTok: {
    label: "TikTok",
    className: "text-black bg-black/8",
  },
  Instagram: {
    label: "Instagram",
    className: "text-purple-700 bg-purple-50",
  },
  Both: {
    label: "TikTok + Instagram",
    className: "text-emerald-700 bg-emerald-50",
  },
};

function AudioCard({ track }: { track: TrendingAudioItem }) {
  const badge = PLATFORM_STYLES[track.platform];

  return (
    <div className="border border-black/10 p-5 hover:border-black/25 transition-colors flex flex-col gap-3">
      {/* Platform badge */}
      <span
        className={`self-start text-[11px] font-medium px-2 py-0.5 rounded ${badge.className}`}
      >
        {badge.label}
      </span>

      {/* Title + artist */}
      <div>
        <p className="text-sm font-medium leading-snug" title={track.title}>
          {track.title}
        </p>
        {track.artist && (
          <p className="text-xs text-black/40 mt-0.5 truncate" title={track.artist}>
            {track.artist}
          </p>
        )}
      </div>

      {/* Why it works */}
      {track.whyItWorks && (
        <p className="text-xs text-black/55 leading-relaxed">{track.whyItWorks}</p>
      )}

      {/* Content style */}
      {track.contentStyle && (
        <p className="text-xs text-black/35 italic">{track.contentStyle}</p>
      )}

      {/* Link */}
      {track.exampleUrl && (
        <a
          href={track.exampleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto self-start text-xs border border-black/15 px-3 py-1.5 rounded-full hover:bg-black hover:text-white hover:border-black transition-colors whitespace-nowrap"
        >
          Search this sound →
        </a>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TrendingAudio() {
  const { activeBrand } = useBrands();
  const [audio, setAudio] = useState<TrendingAudioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
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
            Real trending sounds — researched live from TikTok and Instagram
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Search a niche — e.g. luxury fashion, wedding, fitness…"
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
            <p className="text-sm text-black/35 mb-1">No trending audio loaded yet.</p>
            <p className="text-xs text-black/25">Enter a niche above and press Search.</p>
          </div>
        ) : (
          <>
            {activeTerm && (
              <div className="mb-5 px-4 py-3 bg-black/[0.03] border border-black/8 text-xs text-black/50">
                Live web search results for{" "}
                <span className="font-medium text-black/70">{activeTerm}</span> — cached
                for 12 hours
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {audio.map((track) => (
                <AudioCard key={track.id} track={track} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
