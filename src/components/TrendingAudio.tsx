"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useBrands } from "@/context/BrandsContext";

interface TrendingAudioItem {
  id: string;
  title: string;
  artist: string;
  genre: string;
  whyItWorks: string;
  contentStyle: string;
  platform: "tiktok" | "instagram";
  exampleUrl: string;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function AudioSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-black/10 p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="h-4 bg-black/8 rounded w-36" />
            <div className="h-5 bg-black/6 rounded-full w-20 shrink-0" />
          </div>
          <div className="h-3 bg-black/6 rounded w-24 mb-4" />
          <div className="h-3 bg-black/5 rounded w-full mb-1.5" />
          <div className="h-3 bg-black/5 rounded w-4/5 mb-4" />
          <div className="h-5 bg-black/4 rounded w-36" />
        </div>
      ))}
    </div>
  );
}

// ─── Audio card ───────────────────────────────────────────────────────────────

function AudioCard({ track }: { track: TrendingAudioItem }) {
  const isTikTok = track.platform === "tiktok";
  const platformLabel = isTikTok ? "TikTok" : "Instagram";
  const platformClass = isTikTok
    ? "bg-zinc-100 text-black/60 border-black/15"
    : "bg-rose-50 text-rose-600 border-rose-200";

  return (
    <div className="border border-black/10 p-5 hover:border-black/25 transition-colors flex flex-col gap-3">
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium leading-snug flex-1 min-w-0" title={track.title}>
            {track.title}
          </p>
          <span className={`shrink-0 text-[10px] border px-2 py-0.5 rounded-full whitespace-nowrap ${platformClass}`}>
            {platformLabel}
          </span>
        </div>
        {track.artist && (
          <p className="text-xs text-black/40 truncate" title={track.artist}>
            {track.artist}
          </p>
        )}
        {track.genre && (
          <p className="text-[11px] text-black/30 mt-0.5">{track.genre}</p>
        )}
      </div>

      {track.whyItWorks && (
        <p className="text-xs text-black/55 leading-relaxed">
          {track.whyItWorks}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto">
        {track.contentStyle && (
          <p className="text-xs text-black font-medium">→ {track.contentStyle}</p>
        )}
        {track.exampleUrl && (
          <a
            href={track.exampleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-black/35 hover:text-black transition-colors whitespace-nowrap ml-auto"
          >
            View examples →
          </a>
        )}
      </div>
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
  const fetchedTermRef = useRef<string | null>(null);

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
      fetchedTermRef.current = term;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch audio suggestions");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when brand switches, only when niche is available
  useEffect(() => {
    if (!activeBrand) return;
    setSearchInput(activeBrand.niche ?? "");
    setAudio([]);
    setError(null);
    setActiveTerm(null);
    fetchedTermRef.current = null;
    if (!activeBrand.niche?.trim()) return;
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
            AI-curated songs trending in your niche on TikTok &amp; Instagram Reels
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Search a term — e.g. luxury fashion, wedding entrance, fitness motivation…"
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
              No suggestions yet for &ldquo;{activeTerm ?? searchInput}&rdquo;.
            </p>
            <p className="text-xs text-black/25">Try a more specific term or search again.</p>
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
              <div className="mb-5 px-4 py-3 bg-black/[0.03] border border-black/8 text-xs text-black/50">
                Suggested trending audio for{" "}
                <span className="font-semibold text-black">{activeTerm}</span>{" "}
                — search these on{" "}
                <span className="font-medium text-black">TikTok Sounds</span> or{" "}
                <span className="font-medium text-black">Instagram Audio</span>
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
