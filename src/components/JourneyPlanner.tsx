"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useBrands } from "@/context/BrandsContext";
import { supabase } from "@/lib/supabase";
import type { JourneyIdea, JourneyStage } from "@/app/api/journey/generate/route";

const PLACEHOLDER_USER_ID = "00000000-0000-0000-0000-000000000001";

// ─── Content-type styling ─────────────────────────────────────────────────────

const TYPE_STYLES: Record<
  JourneyIdea["contentType"],
  { badge: string; card: string; dot: string }
> = {
  Expertise: {
    badge: "bg-black text-white",
    card:  "bg-white border-black/15 hover:border-black/40",
    dot:   "bg-black",
  },
  Lifestyle: {
    badge: "bg-amber-100 text-amber-800",
    card:  "bg-amber-50/60 border-amber-200/80 hover:border-amber-400",
    dot:   "bg-amber-400",
  },
  Quote: {
    badge: "bg-violet-100 text-violet-800",
    card:  "bg-violet-50/60 border-violet-200/80 hover:border-violet-400",
    dot:   "bg-violet-400",
  },
  BTS: {
    badge: "bg-zinc-100 text-zinc-600",
    card:  "bg-zinc-50 border-zinc-200/80 hover:border-zinc-400",
    dot:   "bg-zinc-400",
  },
};

const STAGE_LABELS: Record<number, { color: string; label: string }> = {
  1: { color: "bg-zinc-100 text-zinc-600",    label: "Awareness"  },
  2: { color: "bg-red-50 text-red-700",        label: "Problem"    },
  3: { color: "bg-blue-50 text-blue-700",      label: "Solution"   },
  4: { color: "bg-emerald-50 text-emerald-700",label: "Proof"      },
  5: { color: "bg-amber-50 text-amber-700",    label: "Decision"   },
  6: { color: "bg-black text-white",           label: "Action"     },
};

const FORMAT_LABEL: Record<string, string> = {
  "Reel":        "Reel",
  "Carousel":    "Carousel",
  "Static Post": "Static",
  "Story":       "Story",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNextMonday(): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  const day = d.getDay(); // 0=Sun,1=Mon...
  const diff = day === 1 ? 7 : (8 - day) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function normaliseFormat(f: string): string {
  if (f === "Reel")        return "reel";
  if (f === "Carousel")    return "carousel";
  if (f === "Story")       return "story";
  return "static";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function JourneySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(3)].map((_, s) => (
        <div key={s} className="bg-white border border-black/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-6 rounded-full bg-black/8" />
            <div className="h-4 bg-black/8 rounded w-32" />
            <div className="h-5 bg-black/5 rounded-full w-16 ml-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-black/8 p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 bg-black/8 rounded-full w-20" />
                  <div className="h-5 bg-black/5 rounded-full w-14" />
                </div>
                <div className="h-3.5 bg-black/8 rounded w-3/4" />
                <div className="h-3 bg-black/5 rounded w-full" />
                <div className="h-3 bg-black/5 rounded w-5/6" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Idea Card ────────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  brandId,
  week,
}: {
  idea: JourneyIdea;
  brandId: string;
  week: number;
}) {
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const styles = TYPE_STYLES[idea.contentType] ?? TYPE_STYLES.Expertise;

  const addToCalendar = async () => {
    setAdding(true);
    try {
      const base = getNextMonday();
      const scheduled = new Date(base);
      scheduled.setDate(base.getDate() + (week - 1) * 7);

      await supabase.from("scheduled_posts").insert({
        brand_id: brandId,
        user_id: PLACEHOLDER_USER_ID,
        title: idea.title,
        caption: idea.hook,
        format: normaliseFormat(idea.format),
        scheduled_date: scheduled.toISOString(),
        status: "draft",
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch {
      // silently ignore — calendar is a convenience feature
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`border p-5 transition-colors flex flex-col gap-3 ${styles.card}`}>
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
          {idea.contentType}
        </span>
        <span className="text-[10px] border border-black/12 text-black/45 px-2 py-0.5 rounded-full">
          {FORMAT_LABEL[idea.format] ?? idea.format}
        </span>
        {idea.captionMode && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            idea.captionMode === "Storytelling"
              ? "bg-amber-100 text-amber-700"
              : "bg-black/8 text-black/50"
          }`}>
            {idea.captionMode === "Storytelling" ? "💛 Story" : "📢 Mktg"}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-medium leading-snug text-black/85">{idea.title}</p>

      {/* Hook */}
      <p className="text-xs text-black/55 leading-relaxed flex-1">&ldquo;{idea.hook}&rdquo;</p>

      {/* Add to Calendar */}
      <button
        onClick={addToCalendar}
        disabled={adding || added}
        className={`mt-auto self-start text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
          added
            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
            : "border-black/15 text-black/45 hover:bg-black hover:text-white hover:border-black disabled:opacity-40"
        }`}
      >
        {added ? "Added to Calendar ✓" : adding ? "Adding…" : "Add to Calendar"}
      </button>
    </div>
  );
}

// ─── Stage Card ───────────────────────────────────────────────────────────────

function StageCard({ stage, brandId }: { stage: JourneyStage; brandId: string }) {
  const stageStyle = STAGE_LABELS[stage.stage] ?? STAGE_LABELS[1];

  return (
    <div className="bg-white border border-black/10 p-8">
      {/* Stage header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${stageStyle.color}`}>
            {stage.stage}
          </span>
          <div>
            <h3 className="text-sm font-semibold">Stage {stage.stage} — {stage.name}</h3>
            <p className="text-xs text-black/40 mt-0.5">{stage.description}</p>
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-black/35 border border-black/12 px-2.5 py-1 rounded-full whitespace-nowrap">
          Week {stage.stage}
        </span>
      </div>

      {/* Mix legend */}
      <div className="flex items-center gap-3 mb-6 mt-4 flex-wrap">
        {(["Expertise", "Lifestyle", "Quote", "BTS"] as JourneyIdea["contentType"][]).map((ct) => {
          const count = stage.ideas.filter((i) => i.contentType === ct).length;
          if (count === 0) return null;
          const s = TYPE_STYLES[ct];
          return (
            <span key={ct} className="flex items-center gap-1.5 text-[10px] text-black/40">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              {ct} × {count}
            </span>
          );
        })}
      </div>

      {/* Idea cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stage.ideas.map((idea, i) => (
          <IdeaCard key={i} idea={idea} brandId={brandId} week={stage.stage} />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function JourneyPlanner() {
  const { activeBrand } = useBrands();
  const [stages, setStages] = useState<JourneyStage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segmentLabel, setSegmentLabel] = useState<string>(""); // "" = all segments

  const hasStrategy = !!(
    activeBrand?.strategy?.heroDescription ||
    activeBrand?.strategy?.contentPillars?.length ||
    activeBrand?.strategy?.externalProblem ||
    activeBrand?.strategy?.transformation
  );

  const generate = useCallback(async () => {
    if (!activeBrand) return;
    setLoading(true);
    setError(null);
    try {
      const selectedSegment = activeBrand.audienceSegments?.find((s) => s.label === segmentLabel) ?? null;
      const res = await fetch("/api/journey/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: activeBrand.name,
          niche: activeBrand.niche,
          targetAudience: activeBrand.targetAudience,
          targetSegment: selectedSegment,
          strategy: activeBrand.strategy ?? {},
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setStages(json.stages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [activeBrand, segmentLabel]);

  // No brand selected
  if (!activeBrand) {
    return (
      <div className="bg-white border border-black/10 p-10 text-center">
        <p className="text-sm text-black/40">Select a brand to plan your journey.</p>
      </div>
    );
  }

  // No strategy
  if (!hasStrategy) {
    return (
      <div className="bg-white border border-black/10 p-10 text-center">
        <p className="text-sm font-medium mb-2">No strategy filled in yet</p>
        <p className="text-xs text-black/45 mb-6 max-w-sm mx-auto">
          The Journey planner uses your StoryBrand strategy to generate a 6-week content roadmap.
          Fill in at least your Hero, Problems, and Transformation to get started.
        </p>
        <Link
          href="/brands"
          className="text-sm bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/80 transition-colors"
        >
          Fill in Brand Strategy →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-black/10 p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-1">6-Week Roadmap</p>
            <h2 className="text-xl font-semibold tracking-tight">Brand Journey</h2>
            <p className="text-xs text-black/40 mt-1.5 max-w-lg">
              Expertise + Lifestyle + Quotes + BTS — mixed across 6 StoryBrand stages so{" "}
              {activeBrand.name} feels human, not just educational.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!!activeBrand.audienceSegments?.length && (
              <select
                value={segmentLabel}
                onChange={(e) => setSegmentLabel(e.target.value)}
                className="text-xs border border-black/15 px-3 py-2 focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white appearance-none text-black/60"
              >
                <option value="">All segments</option>
                {activeBrand.audienceSegments.map((s) => (
                  <option key={s.label} value={s.label}>{s.label}</option>
                ))}
              </select>
            )}
            {stages && (
              <button
                onClick={generate}
                disabled={loading}
                className="text-xs text-black/40 border border-black/15 px-4 py-2 rounded-full hover:border-black/40 hover:text-black transition-colors disabled:opacity-40"
              >
                ↻ Regenerate
              </button>
            )}
            <button
              onClick={generate}
              disabled={loading}
              className="text-sm bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating…" : stages ? "Generate New Journey" : "Generate Journey"}
            </button>
          </div>
        </div>

        {/* Content mix legend */}
        <div className="mt-6 flex flex-wrap gap-4 border-t border-black/8 pt-5">
          {(
            [
              ["Expertise", "50%", "Brand knowledge"],
              ["Lifestyle", "25%", "Personal moments"],
              ["Quote",     "15%", "Beliefs & mottos"],
              ["BTS",       "10%", "Behind the scenes"],
            ] as const
          ).map(([type, pct, desc]) => {
            const s = TYPE_STYLES[type as JourneyIdea["contentType"]];
            return (
              <div key={type} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                <span className="text-xs font-medium">{type}</span>
                <span className="text-xs text-black/35">{pct}</span>
                <span className="text-xs text-black/25 hidden sm:inline">— {desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 px-5 py-3 text-xs text-red-600 rounded">
          {error}
        </div>
      )}

      {loading && <JourneySkeleton />}

      {!loading && stages && (
        <div className="space-y-4">
          {stages.map((stage) => (
            <StageCard key={stage.stage} stage={stage} brandId={activeBrand.id} />
          ))}
        </div>
      )}

      {!loading && !stages && !error && (
        <div className="bg-white border border-black/10 p-16 text-center">
          <p className="text-sm text-black/35 mb-1">Your 6-week roadmap is ready to generate.</p>
          <p className="text-xs text-black/25">
            Claude will build a personalised mix of Expertise, Lifestyle, Quote and BTS ideas — one
            stage per week of the StoryBrand journey.
          </p>
        </div>
      )}
    </div>
  );
}
