"use client";

import { useState, useEffect, useCallback } from "react";
import { useBrands } from "@/context/BrandsContext";
import { supabase } from "@/lib/supabase";

interface ScheduledPost {
  id: string;
  title: string;
  format: string;
  scheduled_date: string;
  status: string;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

const FORMAT_CHIP: Record<string, string> = {
  static:   "bg-zinc-100 text-zinc-600 border-zinc-200",
  carousel: "bg-blue-50 text-blue-700 border-blue-200",
  reel:     "bg-rose-50 text-rose-700 border-rose-200",
  story:    "bg-amber-50 text-amber-700 border-amber-200",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-black/10 p-6">
      <p className="text-xs text-black/40 uppercase tracking-wider mb-3">{label}</p>
      <p className="text-3xl font-semibold tracking-tight mb-1">{value}</p>
      {sub && <p className="text-xs text-black/35">{sub}</p>}
    </div>
  );
}

export default function ContentAnalytics() {
  const { activeBrand } = useBrands();
  const [posts,   setPosts]   = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!activeBrand) return;
    setLoading(true);
    // Load last 90 days + next 60 days
    const from = new Date(); from.setDate(from.getDate() - 90);
    const to   = new Date(); to.setDate(to.getDate() + 60);
    const { data } = await supabase
      .from("scheduled_posts")
      .select("id, title, format, scheduled_date, status")
      .eq("brand_id", activeBrand.id)
      .gte("scheduled_date", from.toISOString())
      .lte("scheduled_date", to.toISOString())
      .order("scheduled_date");
    setPosts((data as ScheduledPost[]) ?? []);
    setLoading(false);
  }, [activeBrand]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  if (!activeBrand) {
    return (
      <div className="bg-white border border-black/10 p-10 text-center">
        <p className="text-sm text-black/40">Select a brand to view analytics.</p>
      </div>
    );
  }

  // ── Compute stats ─────────────────────────────────────────────────────────

  const now   = new Date();
  const in7   = new Date(); in7.setDate(in7.getDate() + 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const thisMonth  = posts.filter(p => {
    const d = new Date(p.scheduled_date);
    return d >= monthStart && d <= monthEnd;
  });

  const published  = posts.filter(p => p.status === "published");
  const upcoming   = posts.filter(p => {
    const d = new Date(p.scheduled_date);
    return d >= now && d <= in7 && p.status !== "published";
  });

  // Format breakdown across all posts
  const formatCounts: Record<string, number> = {};
  for (const p of posts) {
    formatCounts[p.format] = (formatCounts[p.format] ?? 0) + 1;
  }
  const totalPosts = posts.length;
  const formats = ["static", "carousel", "reel", "story"] as const;
  const formatLabels: Record<string, string> = {
    static: "Static", carousel: "Carousel", reel: "Reel", story: "Story",
  };

  // Top topics: unique title words (strip punctuation, ignore small words)
  const STOP = new Set(["a","an","the","and","or","for","of","to","in","on","with","my","your","how","what","why","is","are","that","this","it","from","about","at","by"]);
  const wordCounts: Record<string, number> = {};
  for (const p of posts) {
    const words = p.title.toLowerCase().replace(/["""''—–]/g, " ").split(/\s+/);
    for (const w of words) {
      const clean = w.replace(/[^a-z]/g, "");
      if (clean.length >= 4 && !STOP.has(clean)) {
        wordCounts[clean] = (wordCounts[clean] ?? 0) + 1;
      }
    }
  }
  const topTopics = Object.entries(wordCounts)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="This Month"
          value={loading ? "—" : thisMonth.length}
          sub="posts scheduled"
        />
        <StatCard
          label="Published"
          value={loading ? "—" : published.length}
          sub="last 90 days"
        />
        <StatCard
          label="Upcoming"
          value={loading ? "—" : upcoming.length}
          sub="next 7 days"
        />
        <StatCard
          label="Total Planned"
          value={loading ? "—" : posts.length}
          sub="last 90 + next 60 days"
        />
      </div>

      {/* Content mix */}
      <div className="grid sm:grid-cols-2 gap-6">

        <div className="bg-white border border-black/10 p-6">
          <h2 className="text-sm font-semibold mb-5">Content Mix</h2>
          {totalPosts === 0 && !loading ? (
            <p className="text-sm text-black/35">No posts scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {formats.map(f => {
                const count = formatCounts[f] ?? 0;
                const pct   = totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0;
                return (
                  <div key={f}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-black/60">{formatLabels[f]}</span>
                      <span className="font-medium tabular-nums">
                        {count} <span className="text-black/30 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-black/6 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-black/10 p-6">
          <h2 className="text-sm font-semibold mb-5">Top Topics</h2>
          {topTopics.length === 0 && !loading ? (
            <p className="text-sm text-black/35">
              {posts.length === 0
                ? "No posts scheduled yet."
                : "Add more posts to see topic patterns."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topTopics.map(topic => (
                <span
                  key={topic}
                  className="text-xs border border-black/12 px-3 py-1.5 rounded-full text-black/60 capitalize"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming posts */}
      <div className="bg-white border border-black/10 p-6">
        <h2 className="text-sm font-semibold mb-5">Upcoming — Next 7 Days</h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-3 bg-black/8 rounded w-20 shrink-0" />
                <div className="h-3 bg-black/6 rounded flex-1" />
                <div className="h-5 bg-black/5 rounded-full w-16 shrink-0" />
              </div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-black/35">No posts scheduled in the next 7 days.</p>
        ) : (
          <div className="divide-y divide-black/6">
            {upcoming.map(p => (
              <div key={p.id} className="py-3 flex items-center gap-4">
                <span className="text-xs text-black/40 shrink-0 w-24 tabular-nums">
                  {fmtDate(p.scheduled_date)}
                </span>
                <p className="text-sm text-black/80 flex-1 min-w-0 truncate" title={p.title}>
                  {p.title}
                </p>
                <span className={`text-[10px] border px-2 py-0.5 rounded-full shrink-0 ${FORMAT_CHIP[p.format] ?? FORMAT_CHIP.static}`}>
                  {formatLabels[p.format] ?? p.format}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* This month breakdown */}
      {thisMonth.length > 0 && (
        <div className="bg-white border border-black/10 p-6">
          <h2 className="text-sm font-semibold mb-5">
            This Month — {new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
          </h2>
          <div className="divide-y divide-black/6">
            {thisMonth.map(p => (
              <div key={p.id} className="py-3 flex items-center gap-4">
                <span className="text-xs text-black/40 shrink-0 w-24 tabular-nums">
                  {fmtDate(p.scheduled_date)}
                </span>
                <p className="text-sm flex-1 min-w-0 truncate text-black/80" title={p.title}>
                  {p.title}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] border px-2 py-0.5 rounded-full ${FORMAT_CHIP[p.format] ?? FORMAT_CHIP.static}`}>
                    {formatLabels[p.format] ?? p.format}
                  </span>
                  {p.status === "published" && (
                    <span className="text-[10px] text-emerald-600 font-medium">✓ Published</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
