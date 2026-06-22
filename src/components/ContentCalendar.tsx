"use client";

import { useState, useEffect, useCallback } from "react";
import { useBrands } from "@/context/BrandsContext";
import { supabase } from "@/lib/supabase";

const PLACEHOLDER_USER_ID = "00000000-0000-0000-0000-000000000001";

const FORMATS = ["static", "carousel", "reel", "story"] as const;
type Format = (typeof FORMATS)[number];

const STATUSES = ["draft", "scheduled", "published"] as const;
type Status = (typeof STATUSES)[number];

interface ScheduledPost {
  id: string;
  brand_id: string;
  title: string;
  caption: string | null;
  format: Format;
  scheduled_date: string;
  image_url: string | null;
  status: Status;
  created_at: string;
}

export interface CalendarIdea {
  title: string;
  format: string;
  _key?: number;
}

const FORMAT_CHIP: Record<Format, string> = {
  static:   "bg-zinc-100 text-zinc-600 border-zinc-200",
  carousel: "bg-blue-50 text-blue-700 border-blue-200",
  reel:     "bg-rose-50 text-rose-700 border-rose-200",
  story:    "bg-amber-50 text-amber-700 border-amber-200",
};

const FORMAT_LABEL: Record<Format, string> = {
  static: "Static", carousel: "Carousel", reel: "Reel", story: "Story",
};

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const startDow = (first.getDay() + 6) % 7; // 0 = Mon
  const days: (Date | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

// ─── Side panel state ─────────────────────────────────────────────────────────

interface SidePanel {
  mode: "create" | "edit";
  date: string;
  post?: ScheduledPost;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContentCalendar({
  initialIdea,
}: {
  initialIdea?: CalendarIdea | null;
}) {
  const { activeBrand } = useBrands();
  const today   = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);

  // Panel
  const [panel,      setPanel]      = useState<SidePanel | null>(null);
  const [formTitle,  setFormTitle]  = useState("");
  const [formFormat, setFormFormat] = useState<Format>("static");
  const [formDate,   setFormDate]   = useState("");
  const [formCaption,setFormCaption]= useState("");
  const [formStatus, setFormStatus] = useState<Status>("draft");
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState<string | null>(null);

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadPosts = useCallback(async () => {
    if (!activeBrand) return;
    setLoading(true);
    const from = new Date(year, month, 1).toISOString();
    const to   = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    const { data } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("brand_id", activeBrand.id)
      .gte("scheduled_date", from)
      .lte("scheduled_date", to)
      .order("scheduled_date");
    setPosts((data as ScheduledPost[]) ?? []);
    setLoading(false);
  }, [activeBrand, year, month]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // ── Handle "Add to calendar →" from Ideas ──────────────────────────────────

  useEffect(() => {
    if (!initialIdea) return;
    const fmt: Format = FORMATS.includes(initialIdea.format.toLowerCase() as Format)
      ? (initialIdea.format.toLowerCase() as Format)
      : "static";
    openCreate(todayKey, initialIdea.title, fmt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIdea]);

  // ── Panel helpers ───────────────────────────────────────────────────────────

  function openCreate(date: string, title = "", format: Format = "static") {
    setFormTitle(title);
    setFormFormat(format);
    setFormDate(date);
    setFormCaption("");
    setFormStatus("draft");
    setFormError(null);
    setPanel({ mode: "create", date });
  }

  function openEdit(post: ScheduledPost) {
    setFormTitle(post.title);
    setFormFormat(post.format);
    setFormDate(post.scheduled_date.slice(0, 10));
    setFormCaption(post.caption ?? "");
    setFormStatus(post.status);
    setFormError(null);
    setPanel({ mode: "edit", date: post.scheduled_date.slice(0, 10), post });
  }

  function closePanel() { setPanel(null); }

  // ── CRUD ────────────────────────────────────────────────────────────────────

  async function savePost() {
    if (!activeBrand || !formTitle.trim() || !formDate) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        brand_id:       activeBrand.id,
        user_id:        PLACEHOLDER_USER_ID,
        title:          formTitle.trim(),
        caption:        formCaption.trim() || null,
        format:         formFormat,
        scheduled_date: `${formDate}T09:00:00+00:00`,
        status:         formStatus,
      };
      if (panel?.mode === "create") {
        const { error } = await supabase.from("scheduled_posts").insert(payload);
        if (error) throw error;
      } else if (panel?.post) {
        const { error } = await supabase
          .from("scheduled_posts")
          .update({ ...payload, brand_id: undefined, user_id: undefined })
          .eq("id", panel.post.id);
        if (error) throw error;
      }
      closePanel();
      await loadPosts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function deletePost() {
    if (!panel?.post) return;
    setSaving(true);
    await supabase.from("scheduled_posts").delete().eq("id", panel.post.id);
    closePanel();
    await loadPosts();
    setSaving(false);
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const grid = getMonthGrid(year, month);

  const postsByDate = posts.reduce<Record<string, ScheduledPost[]>>((acc, p) => {
    const key = p.scheduled_date.slice(0, 10);
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-AU", {
    month: "long", year: "numeric",
  });

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // ── Guard ───────────────────────────────────────────────────────────────────

  if (!activeBrand) {
    return (
      <div className="bg-white border border-black/10 p-10 text-center">
        <p className="text-sm text-black/40">Select a brand to view your content calendar.</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white border border-black/10 p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold">Content Calendar</h2>
              <p className="text-xs text-black/35 mt-0.5">{activeBrand.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="text-sm text-black/40 hover:text-black px-3 py-1.5 border border-black/15 hover:border-black/40 transition-colors"
              >
                ←
              </button>
              <span className="text-sm font-medium min-w-[150px] text-center">{monthLabel}</span>
              <button
                onClick={nextMonth}
                className="text-sm text-black/40 hover:text-black px-3 py-1.5 border border-black/15 hover:border-black/40 transition-colors"
              >
                →
              </button>
              <button
                onClick={() => openCreate(todayKey)}
                className="ml-2 text-xs bg-black text-white px-4 py-2 hover:bg-black/80 transition-colors whitespace-nowrap"
              >
                + New Post
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-black/8 mb-px">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} className="text-[10px] uppercase tracking-wider text-black/30 text-center py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-px bg-black/5">
            {grid.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} className="bg-zinc-50 min-h-[90px]" />;
              }
              const key      = toDateKey(date);
              const dayPosts = postsByDate[key] ?? [];
              const isToday  = key === todayKey;
              const isPast   = date < today;

              return (
                <div
                  key={key}
                  onClick={() => openCreate(key)}
                  className={`bg-white min-h-[90px] p-2 cursor-pointer hover:bg-zinc-50/80 transition-colors group ${
                    isPast ? "opacity-55" : ""
                  } ${isToday ? "ring-1 ring-inset ring-black" : ""}`}
                >
                  <span className={`text-[11px] font-medium inline-flex items-center justify-center w-5 h-5 rounded-full mb-1 ${
                    isToday ? "bg-black text-white" : "text-black/40 group-hover:text-black/70"
                  }`}>
                    {date.getDate()}
                  </span>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map(p => (
                      <button
                        key={p.id}
                        onClick={e => { e.stopPropagation(); openEdit(p); }}
                        title={p.title}
                        className={`w-full text-left text-[10px] leading-tight px-1.5 py-0.5 rounded border truncate ${
                          FORMAT_CHIP[p.format]
                        } ${p.status === "published" ? "opacity-50 line-through" : ""}`}
                      >
                        {p.title}
                      </button>
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="text-[10px] text-black/30 pl-1.5">
                        +{dayPosts.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {loading && (
            <p className="text-xs text-black/30 text-center mt-4">Loading…</p>
          )}

          {/* Legend */}
          <div className="flex gap-3 mt-5 flex-wrap">
            {FORMATS.map(f => (
              <span key={f} className={`text-[10px] border px-2 py-0.5 rounded-full ${FORMAT_CHIP[f]}`}>
                {FORMAT_LABEL[f]}
              </span>
            ))}
            <span className="text-[10px] text-black/30 ml-auto">Click any date to schedule</span>
          </div>
        </div>
      </div>

      {/* ── Side panel ── */}
      {panel && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={closePanel}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div
            className="relative z-50 w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 space-y-6">

              {/* Panel header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  {panel.mode === "create" ? "Schedule a Post" : "Edit Post"}
                </h3>
                <button
                  onClick={closePanel}
                  className="text-black/30 hover:text-black transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                  Title <span className="text-black/60">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="What's this post about?"
                  className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors bg-white"
                  autoFocus
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                  Date <span className="text-black/60">*</span>
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black/40 transition-colors bg-white"
                />
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">Format</label>
                <div className="flex gap-2 flex-wrap">
                  {FORMATS.map(f => (
                    <button
                      key={f}
                      onClick={() => setFormFormat(f)}
                      className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                        formFormat === f
                          ? "bg-black text-white border-black"
                          : "border-black/15 text-black/60 hover:border-black/40"
                      }`}
                    >
                      {FORMAT_LABEL[f]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => setFormStatus(s)}
                      className={`text-sm px-4 py-2 rounded-full border transition-colors capitalize ${
                        formStatus === s
                          ? "bg-black text-white border-black"
                          : "border-black/15 text-black/60 hover:border-black/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                  Caption / Notes
                </label>
                <textarea
                  value={formCaption}
                  onChange={e => setFormCaption(e.target.value)}
                  rows={5}
                  placeholder="Optional caption, hook, or production notes…"
                  className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors bg-white resize-none leading-relaxed"
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600">
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={savePost}
                  disabled={!formTitle.trim() || !formDate || saving}
                  className="flex-1 bg-black text-white text-sm py-3 hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? "Saving…" : panel.mode === "create" ? "Schedule Post" : "Save Changes"}
                </button>
                {panel.mode === "edit" && (
                  <button
                    onClick={deletePost}
                    disabled={saving}
                    className="text-sm border border-red-200 text-red-600 px-5 py-3 hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    Delete
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
