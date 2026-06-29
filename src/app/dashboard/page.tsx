"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import ContentGenerator from "@/components/ContentGenerator";
import ContentResearch from "@/components/ContentResearch";
import TrendingAudio from "@/components/TrendingAudio";
import CaptionHistory from "@/components/CaptionHistory";
import ReelScriptGenerator from "@/components/ReelScriptGenerator";
import DesignCreator, { type DesignSeed } from "@/components/DesignCreator";
import ContentCalendar, { type CalendarIdea } from "@/components/ContentCalendar";
import ContentAnalytics from "@/components/ContentAnalytics";
import SocialConnections from "@/components/SocialConnections";
import { useBrands } from "@/context/BrandsContext";
import type { Brand } from "@/types/brand";

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

// ─── Calendar ─────────────────────────────────────────────────────────────────

interface CalendarEntry {
  posts: string[];
  done: boolean;
}
type CalendarData = Record<string, CalendarEntry>; // key = "YYYY-MM-DD"

interface WeekDay {
  dateObj: Date;
  key: string;       // "YYYY-MM-DD"
  day: string;       // "Mon"
  dateNum: string;   // "02"
}

function loadCalendar(brandId: string): CalendarData {
  try {
    const raw = localStorage.getItem(`calendar-${brandId}`);
    return raw ? (JSON.parse(raw) as CalendarData) : {};
  } catch {
    return {};
  }
}

function saveCalendar(brandId: string, data: CalendarData) {
  try {
    localStorage.setItem(`calendar-${brandId}`, JSON.stringify(data));
  } catch { /* quota */ }
}

function getWeekDays(ref: Date): WeekDay[] {
  const dayOfWeek = ref.getDay(); // 0 = Sun
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      dateObj: d,
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      day: d.toLocaleDateString("en-AU", { weekday: "short" }),
      dateNum: String(d.getDate()).padStart(2, "0"),
    };
  });
}

// ─── Content ideas ────────────────────────────────────────────────────────────

interface Idea {
  pillar: string;
  format: string;
  hook: string;
  effort: "Low" | "Medium" | "High";
}

const NICHE_IDEAS: Record<string, Idea[]> = {
  "Luxury Fashion": [
    { pillar: "Style Inspiration",  format: "Reel",       hook: "\"5 ways to style a white shirt that aren't boring\"",               effort: "Medium" },
    { pillar: "Style Education",    format: "Carousel",   hook: "\"The capsule wardrobe formula that works for every body\"",          effort: "Low"    },
    { pillar: "Behind the Brand",   format: "Vlog Reel",  hook: "\"Come shopping with me — my honest thoughts\"",                      effort: "High"   },
    { pillar: "Community",          format: "Story Poll", hook: "\"Which heel height actually works for everyday? 👇\"",               effort: "Low"    },
  ],
  "Street Style": [
    { pillar: "Outfit Breakdown",   format: "Reel",       hook: "\"How I put this look together for under $100\"",                    effort: "Medium" },
    { pillar: "Trend Report",       format: "Carousel",   hook: "\"The 5 street style trends dominating this season\"",               effort: "Low"    },
    { pillar: "Thrift Haul",        format: "Vlog Reel",  hook: "\"I spent 3 hours thrifting — here's everything I found\"",          effort: "High"   },
    { pillar: "Community",          format: "Story Poll", hook: "\"Bold print or clean neutral — what's your vibe? 👇\"",             effort: "Low"    },
  ],
  "Sustainable Fashion": [
    { pillar: "Brand Spotlight",    format: "Carousel",   hook: "\"5 sustainable brands actually worth the price\"",                  effort: "Low"    },
    { pillar: "Styling Tips",       format: "Reel",       hook: "\"10 outfits from 5 pieces — the sustainable capsule edit\"",        effort: "Medium" },
    { pillar: "Education",          format: "Carousel",   hook: "\"What 'sustainable fashion' actually means (it's complicated)\"",   effort: "Low"    },
    { pillar: "Community",          format: "Story Poll", hook: "\"Rent, thrift or buy new — what do you do most? 👇\"",              effort: "Low"    },
  ],
  "Beauty & Skincare": [
    { pillar: "Tutorials",          format: "Reel",       hook: "\"5-minute morning skincare routine that actually works\"",          effort: "Medium" },
    { pillar: "Product Reviews",    format: "Carousel",   hook: "\"I tested 10 moisturisers — here's what's worth it\"",              effort: "Low"    },
    { pillar: "Behind the Scenes",  format: "Vlog Reel",  hook: "\"What I actually use vs what I recommend\"",                       effort: "High"   },
    { pillar: "Community",          format: "Story Poll", hook: "\"SPF every day — yes or no? 👇\"",                                  effort: "Low"    },
  ],
  "Fitness & Wellness": [
    { pillar: "Workouts",           format: "Reel",       hook: "\"15-minute full body workout — no equipment needed\"",              effort: "High"   },
    { pillar: "Nutrition",          format: "Carousel",   hook: "\"What I eat in a day as a personal trainer\"",                     effort: "Medium" },
    { pillar: "Mindset",            format: "Static Post",hook: "\"The one mindset shift that changed my training\"",                 effort: "Low"    },
    { pillar: "Community",          format: "Story Poll", hook: "\"Morning workouts or evening sessions? 👇\"",                      effort: "Low"    },
  ],
  "Food & Hospitality": [
    { pillar: "Recipes",            format: "Reel",       hook: "\"The easiest weeknight pasta that tastes like a restaurant\"",     effort: "Medium" },
    { pillar: "Tips & Tricks",      format: "Carousel",   hook: "\"5 pantry staples that make every meal better\"",                  effort: "Low"    },
    { pillar: "Behind the Scenes",  format: "Vlog Reel",  hook: "\"A day in my kitchen — what really happens\"",                    effort: "High"   },
    { pillar: "Community",          format: "Story Poll", hook: "\"Homemade or takeaway tonight? 👇\"",                              effort: "Low"    },
  ],
  "Travel": [
    { pillar: "Destination Guides", format: "Carousel",   hook: "\"Everything you need to know before you go\"",                    effort: "Medium" },
    { pillar: "Tips",               format: "Reel",       hook: "\"Travel hacks I wish I knew before my first solo trip\"",         effort: "Low"    },
    { pillar: "Vlogs",              format: "Vlog Reel",  hook: "\"24 hours in [City] — is it actually worth it?\"",                effort: "High"   },
    { pillar: "Community",          format: "Story Poll", hook: "\"Beach or mountains for your next trip? 👇\"",                    effort: "Low"    },
  ],
  "Interior Design": [
    { pillar: "Room Reveals",       format: "Carousel",   hook: "\"We transformed this living room for under $500\"",               effort: "High"   },
    { pillar: "Tips",               format: "Reel",       hook: "\"3 mistakes that make your home look smaller\"",                  effort: "Low"    },
    { pillar: "Behind the Scenes",  format: "Vlog Reel",  hook: "\"The chaos before the reveal — real renovation footage\"",       effort: "Medium" },
    { pillar: "Community",          format: "Story Poll", hook: "\"Minimalist or maximalist — which are you? 👇\"",                 effort: "Low"    },
  ],
  "Business & Entrepreneurship": [
    { pillar: "Tips & Advice",      format: "Carousel",   hook: "\"5 things I wish I knew before starting my business\"",          effort: "Low"    },
    { pillar: "Day in the Life",    format: "Vlog Reel",  hook: "\"My morning routine as a founder\"",                             effort: "Medium" },
    { pillar: "Lessons",            format: "Static Post",hook: "\"The mistake that nearly cost me everything\"",                   effort: "Low"    },
    { pillar: "Community",          format: "Story Poll", hook: "\"Side hustle or full-time — what's your plan? 👇\"",              effort: "Low"    },
  ],
  "Personal Styling": [
    { pillar: "Client Reveals",     format: "Carousel",   hook: "\"Before & after: how we updated her entire wardrobe\"",          effort: "High"   },
    { pillar: "Style Tips",         format: "Reel",       hook: "\"The styling rule that flatters every body type\"",              effort: "Medium" },
    { pillar: "Education",          format: "Carousel",   hook: "\"How to build a wardrobe you actually wear\"",                   effort: "Low"    },
    { pillar: "Community",          format: "Story Poll", hook: "\"Do you have a signature style? 👇\"",                           effort: "Low"    },
  ],
  "Lifestyle": [
    { pillar: "Day in the Life",    format: "Vlog Reel",  hook: "\"An honest day in my life — nothing curated\"",                  effort: "High"   },
    { pillar: "Recommendations",    format: "Carousel",   hook: "\"The 5 things that completely changed my routine\"",             effort: "Low"    },
    { pillar: "Reflection",         format: "Static Post",hook: "\"One year ago vs today — what actually changed\"",               effort: "Low"    },
    { pillar: "Community",          format: "Story Poll", hook: "\"Early bird or night owl? 👇\"",                                 effort: "Low"    },
  ],
};

const EFFORT_SEQ: Array<"Low" | "Medium" | "High"> = ["Medium", "Low", "High", "Low"];

function getIdeasForBrand(brand: Brand): Idea[] {
  // Try brand blueprint from localStorage — only use if pillars reference this brand's niche area
  try {
    const raw = localStorage.getItem("creator_brand_blueprint");
    if (raw) {
      const bp = JSON.parse(raw) as {
        creatorName?: string;
        contentPillars?: Array<{ name: string; formats: string[]; description: string }>;
      };
      const nameMatch =
        bp.creatorName &&
        (brand.name.toLowerCase().includes(bp.creatorName.toLowerCase()) ||
          bp.creatorName.toLowerCase().includes(brand.name.toLowerCase()));
      if (nameMatch && bp.contentPillars && bp.contentPillars.length >= 2) {
        return bp.contentPillars.slice(0, 4).map((p, i) => ({
          pillar: p.name,
          format: p.formats?.[0] ?? "Reel",
          hook: `"${p.description.split(".")[0].trim()}"`,
          effort: EFFORT_SEQ[i] ?? "Medium",
        }));
      }
    }
  } catch { /* ignore */ }

  return NICHE_IDEAS[brand.niche] ?? NICHE_IDEAS["Lifestyle"];
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
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
      ? (posts.reduce((s, p) => s + p.likeCount + p.commentsCount, 0) / posts.length / followers) * 100
      : 0;
  const avgReach =
    posts.length > 0
      ? Math.round(posts.reduce((s, p) => s + p.reach, 0) / posts.length)
      : 0;
  return [
    { label: "Followers",        value: fmtNum(followers),              delta: `@${data.username}`,   positive: null as boolean | null },
    { label: "Avg. Engagement",  value: `${avgEngagement.toFixed(1)}%`, delta: "last 10 posts",       positive: null as boolean | null },
    { label: "Total Posts",      value: fmtNum(mediaCount),             delta: "on this account",     positive: null as boolean | null },
    { label: "Avg. Reach",       value: fmtNum(avgReach),               delta: "last 10 posts",       positive: null as boolean | null },
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

function IdeasSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border border-black/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-2 bg-black/8 rounded w-20" />
            <div className="flex gap-2">
              <div className="h-5 bg-black/6 rounded-full w-16" />
              <div className="h-5 bg-black/6 rounded-full w-10" />
            </div>
          </div>
          <div className="h-3 bg-black/8 rounded w-3/4 mb-1.5" />
          <div className="h-3 bg-black/6 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

function IdeaGrid({
  ideas, onAddToCalendar,
}: {
  ideas: Idea[];
  onAddToCalendar: (idea: { title: string; format: string }) => void;
}) {
  if (ideas.length === 0) return null;
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {ideas.map(({ pillar, format, hook, effort }) => (
        <div key={hook} className="border border-black/10 p-5 hover:border-black/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-black/40">{pillar}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs border border-black/15 px-2 py-0.5 rounded-full">{format}</span>
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
          <button
            onClick={() => onAddToCalendar({ title: hook.replace(/^"|"$/g, ""), format })}
            className="mt-3 text-xs text-black/30 hover:text-black transition-colors"
          >
            Add to calendar →
          </button>
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

// ─── Strategy field ───────────────────────────────────────────────────────────

function StrategyField({
  label,
  sublabel,
  value,
}: {
  label: string;
  sublabel?: string;
  value: string | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-black/40 mb-1">
        {label}
        {sublabel && <span className="text-black/25"> — {sublabel}</span>}
      </p>
      {value ? (
        <p className="text-sm text-black/80 leading-relaxed">{value}</p>
      ) : (
        <p className="text-sm text-black/25 italic">
          Not set yet —{" "}
          <Link href="/brands" className="underline underline-offset-2 hover:text-black/50 transition-colors">
            edit on Brands page
          </Link>
        </p>
      )}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "strategy" | "research" | "trending-audio" | "content-generator" | "reel-scripts" | "design-creator" | "history" | "calendar" | "analytics";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",          label: "Overview"           },
  { id: "strategy",          label: "Strategy"           },
  { id: "research",          label: "Content Research"   },
  { id: "trending-audio",    label: "Trending Audio"     },
  { id: "content-generator", label: "Content Generator"  },
  { id: "reel-scripts",      label: "Reel Scripts"       },
  { id: "design-creator",    label: "Design Creator"     },
  { id: "history",           label: "History"            },
  { id: "calendar",          label: "Calendar"           },
  { id: "analytics",         label: "Analytics"          },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { activeBrand } = useBrands();

  const [tab,                 setTab]                 = useState<Tab>("overview");
  const [inspireIdea,         setInspireIdea]         = useState("");
  const [designSeed,          setDesignSeed]          = useState<DesignSeed | null>(null);
  const [pendingCalendarIdea, setPendingCalendarIdea] = useState<CalendarIdea | null>(null);

  // Instagram
  const [igData,    setIgData]    = useState<IgStats | null>(null);
  const [igLoading, setIgLoading] = useState(true);
  const [igError,   setIgError]   = useState<string | null>(null);

  // Ideas
  const [ideas,        setIdeas]        = useState<Idea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const ideasCacheRef = useRef<Map<string, Idea[]>>(new Map());

  // Topic search
  const [topicInput,   setTopicInput]   = useState("");
  const [topicIdeas,   setTopicIdeas]   = useState<Idea[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  // Calendar
  const [today,        setToday]       = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData>({});

  // Hydrate today client-side to avoid mismatch
  useEffect(() => { setToday(new Date()); }, []);

  // Fetch Instagram stats once (server-cached, fast)
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

  // Load per-brand calendar from localStorage
  useEffect(() => {
    if (!activeBrand) { setCalendarData({}); return; }
    setCalendarData(loadCalendar(activeBrand.id));
  }, [activeBrand]);

  // Clear topic search on brand switch
  useEffect(() => {
    setTopicIdeas([]);
    setCurrentTopic(null);
    setTopicInput("");
  }, [activeBrand]);

  // Fetch brand-specific content ideas (Claude Haiku, cached per brand)
  const fetchIdeas = useCallback((brand: Brand) => {
    const cached = ideasCacheRef.current.get(brand.id);
    if (cached) { setIdeas(cached); return; }
    setIdeasLoading(true);
    let cancelled = false;
    fetch("/api/ideas/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName: brand.name,
        niche: brand.niche,
        targetAudience: brand.targetAudience,
        positioning: brand.positioning ?? null,
        mission: brand.mission ?? null,
        vision: brand.vision ?? null,
        brandVoice: brand.brandVoice ?? null,
        strategy: brand.strategy ?? null,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          ideasCacheRef.current.set(brand.id, data);
          setIdeas(data);
        } else {
          setIdeas(getIdeasForBrand(brand));
        }
      })
      .catch(() => { if (!cancelled) setIdeas(getIdeasForBrand(brand)); })
      .finally(() => { if (!cancelled) setIdeasLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!activeBrand) { setIdeas([]); return; }
    return fetchIdeas(activeBrand);
  }, [activeBrand, fetchIdeas]);

  const fetchTopicIdeas = useCallback((topic: string) => {
    if (!activeBrand || !topic.trim()) return;
    setTopicLoading(true);
    fetch("/api/ideas/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName: activeBrand.name,
        niche: activeBrand.niche,
        targetAudience: activeBrand.targetAudience,
        positioning: activeBrand.positioning ?? null,
        mission: activeBrand.mission ?? null,
        vision: activeBrand.vision ?? null,
        brandVoice: activeBrand.brandVoice ?? null,
        strategy: activeBrand.strategy ?? null,
        topic: topic.trim(),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTopicIdeas(data);
          setCurrentTopic(topic.trim());
        }
      })
      .catch(() => {})
      .finally(() => setTopicLoading(false));
  }, [activeBrand]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const weekDays  = today ? getWeekDays(today) : [];
  const todayKey  = today
    ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    : "";

  const brandHandle   = activeBrand?.handle?.replace(/^@+/, "") ?? "";
  const isIgConnected = !!(igData && brandHandle && igData.username.toLowerCase() === brandHandle.toLowerCase());
  const stats         = isIgConnected ? computeStats(igData!) : null;

  // Week label
  const weekLabel = weekDays.length === 7
    ? `Week of ${weekDays[0].dateObj.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} – ${weekDays[6].dateObj.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`
    : "";

  // ── Calendar mutations ─────────────────────────────────────────────────────

  const addToCalendar = useCallback((dateKey: string, post: string) => {
    if (!activeBrand) return;
    setCalendarData((prev) => {
      const entry = prev[dateKey] ?? { posts: [], done: false };
      const next  = { ...prev, [dateKey]: { ...entry, posts: [...entry.posts, post] } };
      saveCalendar(activeBrand.id, next);
      return next;
    });
  }, [activeBrand]);

  const toggleDone = useCallback((dateKey: string) => {
    if (!activeBrand) return;
    setCalendarData((prev) => {
      const entry = prev[dateKey] ?? { posts: [], done: false };
      const next  = { ...prev, [dateKey]: { ...entry, done: !entry.done } };
      saveCalendar(activeBrand.id, next);
      return next;
    });
  }, [activeBrand]);

  const removePost = useCallback((dateKey: string, postIdx: number) => {
    if (!activeBrand) return;
    setCalendarData((prev) => {
      const entry = prev[dateKey];
      if (!entry) return prev;
      const next = { ...prev, [dateKey]: { ...entry, posts: entry.posts.filter((_, i) => i !== postIdx) } };
      saveCalendar(activeBrand.id, next);
      return next;
    });
  }, [activeBrand]);

  // ── Render ─────────────────────────────────────────────────────────────────

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
                  {activeBrand ? activeBrand.name : "Creator Studio"}
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
            <div className="flex overflow-x-auto">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`shrink-0 text-sm px-5 py-3 border-b-2 transition-colors ${
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

              {/* No brand selected */}
              {!activeBrand && (
                <div className="bg-white border border-black/10 p-10 text-center">
                  <p className="text-sm text-black/40 mb-4">Select a brand to view your overview.</p>
                  <Link
                    href="/brands"
                    className="text-sm bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/80 transition-colors"
                  >
                    Go to Brands →
                  </Link>
                </div>
              )}

              {/* Stats */}
              {activeBrand && (
                <>
                  {igLoading ? (
                    <StatsSkeleton />
                  ) : stats ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {stats.map(({ label, value, delta }) => (
                        <div key={label} className="bg-white border border-black/10 p-6">
                          <p className="text-xs text-black/40 uppercase tracking-wider mb-3">{label}</p>
                          <p className="text-3xl font-semibold tracking-tight mb-1">{value}</p>
                          <p className="text-xs text-black/40">{delta}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Placeholder stats — Instagram not connected for this brand */
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {["Followers", "Avg. Engagement", "Total Posts", "Avg. Reach"].map((label) => (
                          <div key={label} className="bg-white border border-black/10 p-6">
                            <p className="text-xs text-black/40 uppercase tracking-wider mb-3">{label}</p>
                            <p className="text-3xl font-semibold tracking-tight mb-1 text-black/20">—</p>
                            <p className="text-xs text-black/25">Not connected</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <SocialConnections brandId={activeBrand.id} />

                  <div className="grid sm:grid-cols-3 gap-6">

                    {/* Weekly Calendar */}
                    <div className="sm:col-span-2 bg-white border border-black/10 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold">Content Calendar</h2>
                        <span className="text-xs text-black/40">{weekLabel}</span>
                      </div>
                      {weekDays.length > 0 ? (
                        <div className="grid grid-cols-7 gap-2">
                          {weekDays.map(({ key, day, dateNum }) => {
                            const entry  = calendarData[key] ?? { posts: [], done: false };
                            const isToday = key === todayKey;
                            return (
                              <div key={key} className="flex flex-col items-center">
                                <p className="text-xs text-black/30 uppercase mb-2">{day}</p>
                                <div
                                  className={`w-full min-h-20 rounded-lg p-2 border flex flex-col gap-1.5 ${
                                    isToday
                                      ? "border-black bg-black text-white"
                                      : "border-black/10 bg-zinc-50"
                                  }`}
                                >
                                  <button
                                    onClick={() => toggleDone(key)}
                                    title={entry.done ? "Mark undone" : "Mark done"}
                                    className={`text-xs font-medium text-left ${
                                      isToday ? "text-white/80" : entry.done ? "text-black/25 line-through" : "text-black/50"
                                    }`}
                                  >
                                    {dateNum}
                                  </button>
                                  {entry.posts.map((p, pi) => (
                                    <div key={pi} className="group relative">
                                      <span
                                        className={`text-[10px] leading-tight px-1.5 py-0.5 rounded block truncate ${
                                          isToday
                                            ? "bg-white/20 text-white"
                                            : entry.done
                                            ? "bg-black text-white"
                                            : "bg-black/8 text-black/60"
                                        }`}
                                        title={p}
                                      >
                                        {p}
                                      </span>
                                      <button
                                        onClick={() => removePost(key, pi)}
                                        className="absolute -top-1 -right-1 hidden group-hover:flex w-3.5 h-3.5 rounded-full bg-black text-white items-center justify-center text-[8px] leading-none"
                                        title="Remove"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-20 animate-pulse bg-black/5 rounded" />
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                      <div className="bg-white border border-black/10 p-6">
                        <h2 className="text-sm font-semibold mb-4">Top performing format</h2>
                        <div className="space-y-3">
                          {[
                            { format: "Reels",     pct: 78 },
                            { format: "Carousels", pct: 54 },
                            { format: "Static",    pct: 32 },
                            { format: "Stories",   pct: 21 },
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
                          {activeBrand.niche.includes("Fashion") || activeBrand.niche.includes("Style") || activeBrand.niche.includes("Beauty")
                            ? "Your save rate on carousels is 3× higher than your average. Prioritise educational carousels this week."
                            : "Consistency beats perfection. Post 3× this week and watch your reach climb."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content Ideas */}
                  <div className="bg-white border border-black/10 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-sm font-semibold">Content Ideas</h2>
                        <p className="text-xs text-black/35 mt-0.5">{activeBrand.niche}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (!activeBrand || ideasLoading) return;
                            ideasCacheRef.current.delete(activeBrand.id);
                            fetchIdeas(activeBrand);
                          }}
                          disabled={ideasLoading}
                          className="text-xs text-black/25 hover:text-black transition-colors disabled:opacity-30"
                          title="Refresh ideas"
                        >
                          ↻
                        </button>
                        <button
                          onClick={() => setTab("content-generator")}
                          className="text-xs text-black/40 hover:text-black transition-colors"
                        >
                          Generate with ADORAR™ →
                        </button>
                      </div>
                    </div>

                    {/* Topic search */}
                    <div className="flex gap-2 mb-8">
                      <input
                        type="text"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !topicLoading) fetchTopicIdeas(topicInput); }}
                        placeholder="Search a topic — e.g. prenup, wedding transport, luxury wardrobe…"
                        className="flex-1 border border-black/15 px-4 py-2.5 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors bg-white"
                      />
                      <button
                        onClick={() => fetchTopicIdeas(topicInput)}
                        disabled={!topicInput.trim() || topicLoading}
                        className="shrink-0 text-sm bg-black text-white px-5 py-2.5 hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {topicLoading ? "Generating…" : "Generate Ideas"}
                      </button>
                    </div>

                    {/* Topic results */}
                    {topicIdeas.length > 0 && currentTopic && (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                            Ideas for:{" "}
                            <span className="text-black font-medium normal-case tracking-normal">{currentTopic}</span>
                          </p>
                          <button
                            onClick={() => { setTopicIdeas([]); setCurrentTopic(null); setTopicInput(""); }}
                            className="text-xs text-black/25 hover:text-black transition-colors"
                          >
                            Clear ×
                          </button>
                        </div>
                        <IdeaGrid ideas={topicIdeas} onAddToCalendar={(idea) => { setPendingCalendarIdea({ ...idea, _key: Date.now() }); setTab("calendar"); }} />
                        <div className="border-t border-black/8 my-8" />
                      </>
                    )}

                    {/* Suggested ideas */}
                    {topicIdeas.length > 0 && (
                      <p className="text-xs uppercase tracking-[0.15em] text-black/40 mb-4">Suggested Ideas</p>
                    )}
                    {ideasLoading ? <IdeasSkeleton /> : (
                      <IdeaGrid ideas={ideas} onAddToCalendar={(idea) => { setPendingCalendarIdea({ ...idea, _key: Date.now() }); setTab("calendar"); }} />
                    )}
                  </div>

                  {/* Recent Posts */}
                  <div className="bg-white border border-black/10 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-sm font-semibold">Recent Posts</h2>
                      {isIgConnected && (
                        <span className="text-xs text-black/30">Live from Instagram · @{igData!.username}</span>
                      )}
                    </div>

                    {!isIgConnected ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-black/35 mb-1">Connect your Instagram to see recent posts.</p>
                        <p className="text-xs text-black/25">
                          {brandHandle
                            ? `Looking for @${brandHandle} — not yet connected.`
                            : "Add an Instagram handle to this brand to enable post tracking."}
                        </p>
                      </div>
                    ) : igLoading ? (
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
                              <span>♥ {fmtNum(post.likeCount)}</span>
                              <span>💬 {fmtNum(post.commentsCount)}</span>
                              <span>🔖 {fmtNum(post.saved)}</span>
                              <span title="Reach" className="hidden sm:inline">
                                👁 {fmtNum(post.reach)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-black/40">No posts found.</p>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Strategy ── */}
          {tab === "strategy" && (
            <div className="space-y-6">
              {!activeBrand ? (
                <div className="bg-white border border-black/10 p-10 text-center">
                  <p className="text-sm text-black/40 mb-4">Select a brand to view its strategy.</p>
                  <Link href="/brands" className="text-sm bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/80 transition-colors">
                    Go to Brands →
                  </Link>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="bg-white border border-black/10 p-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-1">StoryBrand Framework</p>
                        <h2 className="text-xl font-semibold tracking-tight">{activeBrand.name} — Brand Strategy</h2>
                      </div>
                      <Link
                        href="/brands"
                        className="shrink-0 text-xs border border-black/15 px-4 py-2 rounded-full hover:border-black/40 hover:text-black transition-colors text-black/50"
                      >
                        Edit Strategy →
                      </Link>
                    </div>
                  </div>

                  {/* The Hero + Problems */}
                  <div className="bg-white border border-black/10 p-8">
                    <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-6">The Hero & The Problems</p>
                    <div className="space-y-5">
                      <StrategyField label="Who is the hero?" value={activeBrand.strategy?.heroDescription} />
                      <StrategyField label="External Problem" sublabel="the surface issue" value={activeBrand.strategy?.externalProblem} />
                      <StrategyField label="Internal Problem" sublabel="the emotional weight" value={activeBrand.strategy?.internalProblem} />
                      <StrategyField label="Philosophical Problem" sublabel="the injustice" value={activeBrand.strategy?.philosophicalProblem} />
                    </div>
                  </div>

                  {/* Guide + Plan */}
                  <div className="bg-white border border-black/10 p-8">
                    <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-6">The Guide & The Plan</p>
                    <div className="space-y-5">
                      <StrategyField label="Guide Role" sublabel="empathy + authority positioning" value={activeBrand.strategy?.guideRole} />
                      {activeBrand.strategy?.threeStepPlan?.some(Boolean) ? (
                        <div>
                          <p className="text-xs text-black/40 mb-2">3-Step Plan</p>
                          <div className="flex items-start gap-3">
                            {activeBrand.strategy.threeStepPlan.map((step, i) => (
                              <div key={i} className="flex-1 border border-black/8 p-3">
                                <p className="text-[10px] text-black/30 uppercase tracking-wider mb-1">Step {i + 1}</p>
                                <p className="text-sm text-black/75 leading-snug">{step || <span className="text-black/25 italic">Not set</span>}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <StrategyField label="3-Step Plan" value={undefined} />
                      )}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="bg-white border border-black/10 p-8">
                    <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-6">Calls to Action</p>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <StrategyField label="Direct CTA" sublabel="primary action" value={activeBrand.strategy?.directCta} />
                      <StrategyField label="Transitional CTA" sublabel="softer engagement" value={activeBrand.strategy?.transitionalCta} />
                    </div>
                  </div>

                  {/* Stakes + Transformation */}
                  <div className="bg-white border border-black/10 p-8">
                    <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-6">Stakes & Transformation</p>
                    <div className="space-y-5">
                      <StrategyField label="Stakes" sublabel="the failure scenario" value={activeBrand.strategy?.stakes} />
                      <StrategyField label="Transformation" sublabel="the success picture" value={activeBrand.strategy?.transformation} />
                    </div>
                  </div>

                  {/* Content Strategy */}
                  <div className="bg-white border border-black/10 p-8">
                    <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-6">Content Strategy</p>
                    <div className="space-y-5">
                      {activeBrand.strategy?.contentPillars?.length ? (
                        <div>
                          <p className="text-xs text-black/40 mb-3">Content Pillars</p>
                          <div className="flex flex-wrap gap-2">
                            {activeBrand.strategy.contentPillars.map((p) => (
                              <span key={p} className="text-xs bg-black text-white px-3 py-1.5 rounded-full">{p}</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <StrategyField label="Content Pillars" value={undefined} />
                      )}
                      <StrategyField label="Storytelling Angle" value={activeBrand.strategy?.storytellingAngle} />
                      <StrategyField label="Posting Cadence" value={activeBrand.strategy?.postingCadence} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Content Research ── */}
          {tab === "research" && (
            <ContentResearch
              onInspire={(idea) => {
                setInspireIdea(idea);
                setTab("content-generator");
              }}
            />
          )}

          {/* ── Trending Audio ── */}
          {tab === "trending-audio" && <TrendingAudio />}

          {/* ── Content Generator ── */}
          {tab === "content-generator" && (
            <ContentGenerator
              initialIdea={inspireIdea}
              onOpenInDesigner={(data) => {
                setDesignSeed(data);
                setTab("design-creator");
              }}
            />
          )}

          {/* ── Reel Scripts ── */}
          {tab === "reel-scripts" && <ReelScriptGenerator />}

          {/* ── Design Creator ── */}
          {tab === "design-creator" && <DesignCreator seed={designSeed} />}

          {/* ── History ── */}
          {tab === "history" && <CaptionHistory />}

          {/* ── Calendar ── */}
          {tab === "calendar" && (
            <ContentCalendar initialIdea={pendingCalendarIdea} />
          )}

          {/* ── Analytics ── */}
          {tab === "analytics" && <ContentAnalytics />}

        </div>
      </div>
    </>
  );
}
