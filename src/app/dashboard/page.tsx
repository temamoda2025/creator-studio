"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import ContentGenerator from "@/components/ContentGenerator";

const stats = [
  { label: "Followers", value: "14,280", delta: "+312 this week", positive: true },
  { label: "Avg. Engagement", value: "4.7%", delta: "+0.8% vs last month", positive: true },
  { label: "Posts This Month", value: "18", delta: "6 remaining", positive: null },
  { label: "Story Views", value: "2,940", delta: "-180 vs last week", positive: false },
];

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

const recentPosts = [
  {
    type: "Reel",
    caption: "The silk slip era is not over. Here's how I'm wearing mine...",
    date: "3 Jun",
    likes: "1.2K",
    comments: "48",
    saves: "319",
  },
  {
    type: "Carousel",
    caption: "3 outfits from 6 pieces — the wardrobe math that changed...",
    date: "1 Jun",
    likes: "876",
    comments: "31",
    saves: "502",
  },
  {
    type: "Static",
    caption: "Monday in Milan (sort of). Channelling that editorial energy...",
    date: "30 May",
    likes: "1.05K",
    comments: "22",
    saves: "187",
  },
];

type Tab = "overview" | "content-generator";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "content-generator", label: "Content Generator" },
];

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <>
      <Nav />
      <div className="pt-14 bg-zinc-50 min-h-screen">

        {/* Dashboard header */}
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
            <div className="flex gap-0 border-b-0">
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

          {/* Overview tab */}
          {tab === "overview" && (
            <>
              {/* Stats */}
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

                {/* Quick stats sidebar */}
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

              {/* Recent posts */}
              <div className="bg-white border border-black/10 p-8">
                <h2 className="text-sm font-semibold mb-6">Recent Posts</h2>
                <div className="divide-y divide-black/8">
                  {recentPosts.map(({ type, caption, date, likes, comments, saves }) => (
                    <div key={date} className="py-4 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="shrink-0 text-xs border border-black/15 px-2.5 py-1 rounded-full">
                          {type}
                        </span>
                        <p className="text-sm text-black/70 truncate">{caption}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-6 text-xs text-black/40">
                        <span>{date}</span>
                        <span>♥ {likes}</span>
                        <span>💬 {comments}</span>
                        <span>🔖 {saves}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Content Generator tab */}
          {tab === "content-generator" && <ContentGenerator />}

        </div>
      </div>
    </>
  );
}
