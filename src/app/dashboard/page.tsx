"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import ContentGenerator from "@/components/ContentGenerator";

// ─── Types ───────────────────────────────────────────────────────────────────

interface IgPost {
  id: string;
  caption: string;
  mediaType: string;
  timestamp: string;
  permalink: string;
  likeCount: number;
  commentsCount: number;
  reach: number;
  saved: number;
}

interface IgStats {
  followers: number;
  mediaCount: number;
  username: string;
  posts: IgPost[];
}

// ─── Static data (calendar + content ideas stay hardcoded) ───────────────────

const calendar = [
  { day: "Mon", date: "02", posts: ["Outfit Reel"], done: true },
  { day: "Tue", date: "03", posts: ["Style Tip Carousel"], done: true },
  { day: "Wed", date: "04", posts: ["BTS Story"], done: true },
  { day: "Thu", date: "05", posts: [], done: false },
  { day: "Fri", date: "06", posts: ["OOTD Static"], done: false },
  { day: "Sat", date: "07", posts: ["Collab Post"], done: false },
  { day: "Sun", date: "08", posts: [], done: false },
];

const ideas = [
  {
    pillar: "Style Inspiration",
    format: "Reel",
    hook: '"5 ways to style a white shirt that aren\'t boring"',
    effort: "Medium",
  },
  {
    pillar: "Style Education",
    format: "Carousel",
    hook: '"The capsule wardrobe formula that works for every body"',
    effort: "Low",
  },
  {
    pillar: "Behind the Brand",
    format: "Vlog Reel",
    hook: '"Come shopping with me at [Brand] — my honest thoughts"',
    effort: "High",
  },
  {
    pillar: "Community",
    format: "Story Poll",
    hook: '"Which heel height actually works for everyday? 👇"',
    effort: "Low",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

function mediaTypeLabel(type: string): string {
  if (type === "VIDEO") return "Reel";
  if (type === "CAROUSEL_ALBUM") return "Carousel";
  return "Static";
}

function computeStats(data: IgStats) {
  const { followers, mediaCount, posts } = data;

  const avgEngagement =
    posts.length > 0 && followers > 0
      ? posts.reduce((sum, p) => sum + p.likeCount + p.commentsCount, 0) /
        posts.length /
        followers *
        100
      : 0;

  const avgReach =
    posts.length > 0
      ? Math.round(posts.reduce((sum, p) => sum + p.reach, 0) / posts.length)
      : 0;

  return [
    {
      label: "Followers",
      value: fmt(followers),
      delta: `@${data.username}`,
      positive: null as boolean | null,
    },
    {
      label: "Avg. Engagement",
      value: `${avgEngagement.toFixed(1)}%`,
      delta: "last 10 posts",
      positive: null as boolean | null,
    },
    {
      label: "Total Posts",
      value: fmt(mediaCount),
      delta: "on this account",
      positive: null as boolean | null,
    },
    {
      label: "Avg. Reach",
      value: fmt(avgReach),
      delta: "last 10 posts",
      positive: null as boolean | null,
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-black/10 p-6">
          <div className="h-2 bg-black/8 rounded w-20 mb-4" />
          <div className="h-8 bg-black/8 rounded w-24 mb-2" />
          <div className="h-2 bg-black/6 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

function RecentPostsSkeleton() {
  return (
    <div className="divide-y divide-black/8 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-6 w-14 bg-black/8 rounded-full" />
            <div className="h-3 bg-black/6 rounded w-64" />
          </div>
          <div className="flex gap-6">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-2 w-10 bg-black/6 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 px-5 py-3 text-xs text-red-600 rounded">
      Instagram API: {message}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "content-generator";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "content-generator", label: "Content Generator" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [igData, setIgData] = useState<IgStats | null>(null);
  const [igLoading, setIgLoading] = useState(true);
  const [igError, setIgError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instagram/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setIgData(json as IgStats);
      })
      .catch((e: Error) => setIgError(e.message))
      .finally(() => setIgLoading(false));
  }, []);

  const stats = igData ? computeStats(igData) : null;

  return (
    <>
      <Nav />
      <div className="pt-14 bg-zinc-50 min-h-screen">

        {/* Header */}
        <div className="bg-white border-b border-black/10 px-6 pt-8 pb-0">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-1">
                  Creator Studio
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/brand"
                  className="text-sm border border-black/15 px-4 py-2 rounded-full hover:border-black/40 transition-colors"
                >
                  Brand Blueprint
                </Link>
                <button className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-black/80 transition-colors">
                  + New Post
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`text-sm px-5 py-3 border-b-2 transition-colors ${
                    tab === id
                      ? "border-black text-black font-medium"
                      : "border-transparent text-black/40 hover:text-black/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

          {/* ── Overview ── */}
          {tab === "overview" && (
            <>
              {igError && <ErrorBanner message={igError} />}

              {/* Stats */}
              {igLoading ? (
                <StatsSkeleton />
              ) : stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stats.map(({ label, value, delta, positive }) => (
                    <div key={label} className="bg-white border border-black/10 p-6">
                      <p className="text-xs text-black/40 uppercase tracking-wider mb-3">{label}</p>
                      <p className="text-3xl font-semibold tracking-tight mb-1">{value}</p>
                      <p
                        className={`text-xs ${
                          positive === true
                            ? "text-emerald-600"
                            : positive === false
                            ? "text-red-500"
                            : "text-black/40"
                        }`}
                      >
                        {delta}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid sm:grid-cols-3 gap-6">

                {/* Weekly Calendar */}
                <div className="sm:col-span-2 bg-white border border-black/10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-semibold">Content Calendar</h2>
                    <span className="text-xs text-black/40">Week of Jun 2 – 8, 2026</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendar.map(({ day, date, posts, done }) => (
                      <div key={day} className="flex flex-col items-center">
                        <p className="text-xs text-black/30 uppercase mb-2">{day}</p>
                        <div
                          className={`w-full min-h-20 rounded-lg p-2 border flex flex-col gap-1.5 ${
                            date === "02"
                              ? "border-black bg-black text-white"
                              : "border-black/10 bg-zinc-50"
                          }`}
                        >
                          <p className={`text-xs font-medium ${date === "02" ? "text-white/80" : "text-black/50"}`}>
                            {date}
                          </p>
                          {posts.map((p) => (
                            <span
                              key={p}
                              className={`text-[10px] leading-tight px-1.5 py-0.5 rounded ${
                                date === "02"
                                  ? "bg-white/20 text-white"
                                  : done
                                  ? "bg-black text-white"
                                  : "bg-black/8 text-black/60"
                              }`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Format performance sidebar */}
                <div className="space-y-4">
                  <div className="bg-white border border-black/10 p-6">
                    <h2 className="text-sm font-semibold mb-4">Top performing format</h2>
                    <div className="space-y-3">
                      {[
                        { format: "Reels", pct: 78 },
                        { format: "Carousels", pct: 54 },
                        { format: "Static", pct: 32 },
                        { format: "Stories", pct: 21 },
                      ].map(({ format, pct }) => (
                        <div key={format}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-black/60">{format}</span>
                            <span className="font-medium">{pct}%</span>
                          </div>
                          <div className="h-1 bg-black/8 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-black text-white p-6">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Weekly tip</p>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Your save rate on carousels is 3× higher than your average. Prioritise
                      educational carousels this week.
                    </p>
                  </div>
                </div>
              </div>

              {/* Content ideas */}
              <div className="bg-white border border-black/10 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-semibold">Content Ideas</h2>
                  <button
                    onClick={() => setTab("content-generator")}
                    className="text-xs text-black/40 hover:text-black transition-colors"
                  >
                    Generate with ADORAR™ →
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {ideas.map(({ pillar, format, hook, effort }) => (
                    <div key={hook} className="border border-black/10 p-5 hover:border-black/30 transition-colors group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-black/40">{pillar}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs border border-black/15 px-2 py-0.5 rounded-full">
                            {format}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              effort === "Low"
                                ? "bg-emerald-50 text-emerald-700"
                                : effort === "Medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {effort}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium leading-snug">{hook}</p>
                      <button className="mt-3 text-xs text-black/30 group-hover:text-black transition-colors">
                        Add to calendar →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Posts — live from Instagram */}
              <div className="bg-white border border-black/10 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-semibold">Recent Posts</h2>
                  {igData && (
                    <span className="text-xs text-black/30">Live from Instagram</span>
                  )}
                </div>

                {igLoading ? (
                  <RecentPostsSkeleton />
                ) : igData && igData.posts.length > 0 ? (
                  <div className="divide-y divide-black/8">
                    {igData.posts.map((post) => (
                      <div key={post.id} className="py-4 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="shrink-0 text-xs border border-black/15 px-2.5 py-1 rounded-full">
                            {mediaTypeLabel(post.mediaType)}
                          </span>
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-black/70 truncate hover:text-black transition-colors"
                            title={post.caption}
                          >
                            {post.caption
                              ? post.caption.slice(0, 80) + (post.caption.length > 80 ? "…" : "")
                              : "(no caption)"}
                          </a>
                        </div>
                        <div className="shrink-0 flex items-center gap-5 text-xs text-black/40">
                          <span>{fmtDate(post.timestamp)}</span>
                          <span>♥ {fmt(post.likeCount)}</span>
                          <span>💬 {fmt(post.commentsCount)}</span>
                          <span>🔖 {fmt(post.saved)}</span>
                          <span title="Reach" className="hidden sm:inline">
                            👁 {fmt(post.reach)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : igError ? (
                  <p className="text-sm text-black/40">
                    Could not load posts. Check your Instagram token permissions.
                  </p>
                ) : (
                  <p className="text-sm text-black/40">No posts found.</p>
                )}
              </div>
            </>
          )}

          {/* ── Content Generator ── */}
          {tab === "content-generator" && <ContentGenerator />}

        </div>
      </div>
    </>
  );
}
