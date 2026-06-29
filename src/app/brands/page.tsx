"use client";

import React, { useState } from "react";
import Nav from "@/components/Nav";
import { useBrands } from "@/context/BrandsContext";
import type { Brand, Platform } from "@/types/brand";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "pinterest", label: "Pinterest" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
];

const NICHES = [
  "Luxury Fashion",
  "Street Style",
  "Sustainable Fashion",
  "Beauty & Skincare",
  "Lifestyle",
  "Personal Styling",
  "Fitness & Wellness",
  "Food & Hospitality",
  "Travel",
  "Interior Design",
  "Business & Entrepreneurship",
  "Other",
];

// ─── Form state ───────────────────────────────────────────────────────────────

interface StrategyFormState {
  heroDescription: string;
  externalProblem: string;
  internalProblem: string;
  philosophicalProblem: string;
  guideRole: string;
  threeStepPlan: [string, string, string];
  directCta: string;
  transitionalCta: string;
  stakes: string;
  transformation: string;
  contentPillars: string; // comma-separated in UI, array when saved
  storytellingAngle: string;
  postingCadence: string;
}

interface FormState {
  name: string;
  handle: string;
  niche: string;
  customNiche: string;
  platforms: Platform[];
  targetAudience: string;
  positioning: string;
  toneDescription: string;
  captionExample: string;
  strategy: StrategyFormState;
}

const emptyStrategy: StrategyFormState = {
  heroDescription: "",
  externalProblem: "",
  internalProblem: "",
  philosophicalProblem: "",
  guideRole: "",
  threeStepPlan: ["", "", ""],
  directCta: "",
  transitionalCta: "",
  stakes: "",
  transformation: "",
  contentPillars: "",
  storytellingAngle: "",
  postingCadence: "",
};

const emptyForm: FormState = {
  name: "",
  handle: "",
  niche: "",
  customNiche: "",
  platforms: [],
  targetAudience: "",
  positioning: "",
  toneDescription: "",
  captionExample: "",
  strategy: emptyStrategy,
};

function brandToForm(b: Brand): FormState {
  const knownNiche = NICHES.includes(b.niche);
  const s = b.strategy;
  return {
    name: b.name,
    handle: b.handle ?? "",
    niche: knownNiche ? b.niche : "Other",
    customNiche: knownNiche ? "" : b.niche,
    platforms: b.platforms,
    targetAudience: b.targetAudience,
    positioning: b.positioning ?? "",
    toneDescription: b.brandVoice.toneDescription ?? "",
    captionExample: b.brandVoice.captionExample ?? "",
    strategy: {
      heroDescription:      s?.heroDescription      ?? "",
      externalProblem:      s?.externalProblem      ?? "",
      internalProblem:      s?.internalProblem      ?? "",
      philosophicalProblem: s?.philosophicalProblem ?? "",
      guideRole:            s?.guideRole            ?? "",
      threeStepPlan:        s?.threeStepPlan        ?? ["", "", ""],
      directCta:            s?.directCta            ?? "",
      transitionalCta:      s?.transitionalCta      ?? "",
      stakes:               s?.stakes               ?? "",
      transformation:       s?.transformation       ?? "",
      contentPillars:       s?.contentPillars?.join(", ") ?? "",
      storytellingAngle:    s?.storytellingAngle    ?? "",
      postingCadence:       s?.postingCadence       ?? "",
    },
  };
}

function formToBrand(f: FormState): Omit<Brand, "id" | "createdAt" | "updatedAt"> {
  const s = f.strategy;
  const contentPillars = s.contentPillars
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const threeStepPlan = s.threeStepPlan.map((p) => p.trim()) as [string, string, string];
  const hasStrategy =
    s.heroDescription || s.externalProblem || s.internalProblem ||
    s.philosophicalProblem || s.guideRole || threeStepPlan.some(Boolean) ||
    s.directCta || s.transitionalCta || s.stakes || s.transformation ||
    contentPillars.length > 0 || s.storytellingAngle || s.postingCadence;

  return {
    name: f.name.trim(),
    handle: f.handle.trim() || undefined,
    niche: f.niche === "Other" ? f.customNiche.trim() : f.niche,
    platforms: f.platforms,
    targetAudience: f.targetAudience.trim(),
    positioning: f.positioning.trim() || undefined,
    brandVoice: {
      traits: [],
      toneDescription: f.toneDescription.trim() || undefined,
      captionExample: f.captionExample.trim() || undefined,
    },
    strategy: hasStrategy ? {
      heroDescription:      s.heroDescription.trim()      || undefined,
      externalProblem:      s.externalProblem.trim()      || undefined,
      internalProblem:      s.internalProblem.trim()      || undefined,
      philosophicalProblem: s.philosophicalProblem.trim() || undefined,
      guideRole:            s.guideRole.trim()            || undefined,
      threeStepPlan:        threeStepPlan.some(Boolean) ? threeStepPlan : undefined,
      directCta:            s.directCta.trim()            || undefined,
      transitionalCta:      s.transitionalCta.trim()      || undefined,
      stakes:               s.stakes.trim()               || undefined,
      transformation:       s.transformation.trim()       || undefined,
      contentPillars:       contentPillars.length > 0 ? contentPillars : undefined,
      storytellingAngle:    s.storytellingAngle.trim()    || undefined,
      postingCadence:       s.postingCadence.trim()       || undefined,
    } : undefined,
  };
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-black/15 px-4 py-2.5 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors bg-white rounded-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-black/60">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Brand Form ───────────────────────────────────────────────────────────────

function BrandForm({
  form,
  setForm,
  onSave,
  onCancel,
  title,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSave: () => void;
  onCancel: () => void;
  title: string;
}) {
  const [showStrategy, setShowStrategy] = React.useState(true);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const setStrategy = <K extends keyof StrategyFormState>(key: K, val: StrategyFormState[K]) =>
    setForm((prev) => ({ ...prev, strategy: { ...prev.strategy, [key]: val } }));

  const setStrategyStep = (index: 0 | 1 | 2, val: string) =>
    setForm((prev) => {
      const next: [string, string, string] = [...prev.strategy.threeStepPlan] as [string, string, string];
      next[index] = val;
      return { ...prev, strategy: { ...prev.strategy, threeStepPlan: next } };
    });

  const togglePlatform = (p: Platform) =>
    set(
      "platforms",
      form.platforms.includes(p)
        ? form.platforms.filter((x) => x !== p)
        : [...form.platforms, p]
    );

  const canSave =
    form.name.trim() &&
    (form.niche !== "Other" ? form.niche : form.customNiche.trim());

  return (
    <div className="bg-white border border-black/15 p-8 sm:col-span-2">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-base font-semibold">{title}</h2>
        <button
          onClick={onCancel}
          className="text-xs text-black/40 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-8">
        {/* Identity */}
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-4">Identity</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Brand Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Tema Moda"
                className={inputCls}
              />
            </Field>
            <Field label="Handle">
              <input
                type="text"
                value={form.handle}
                onChange={(e) => set("handle", e.target.value)}
                placeholder="@handle"
                className={inputCls}
              />
            </Field>
            <Field label="Niche" required>
              <select
                value={form.niche}
                onChange={(e) => set("niche", e.target.value)}
                className={inputCls}
              >
                <option value="">Select niche…</option>
                {NICHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            {form.niche === "Other" && (
              <Field label="Custom Niche" required>
                <input
                  type="text"
                  value={form.customNiche}
                  onChange={(e) => set("customNiche", e.target.value)}
                  placeholder="Describe the niche"
                  className={inputCls}
                />
              </Field>
            )}
          </div>
        </div>

        {/* Platforms */}
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-4">Platforms</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => togglePlatform(id)}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  form.platforms.includes(id)
                    ? "bg-black text-white border-black"
                    : "border-black/15 text-black/60 hover:border-black/40 hover:text-black"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-4">
            Audience & Positioning
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Target Audience">
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) => set("targetAudience", e.target.value)}
                placeholder="e.g. Women 30–50 who value quality over quantity"
                className={inputCls}
              />
            </Field>
            <Field label="Brand Positioning">
              <input
                type="text"
                value={form.positioning}
                onChange={(e) => set("positioning", e.target.value)}
                placeholder="e.g. Elevated everyday style for the modern woman"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Brand Voice */}
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-black/30 mb-4">Brand Voice</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Tone Description">
              <textarea
                value={form.toneDescription}
                onChange={(e) => set("toneDescription", e.target.value)}
                placeholder="e.g. Warm, confident, aspirational. Uses Australian vernacular. Direct but never pushy. Educates without lecturing."
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </Field>
            <Field label="Caption Example">
              <textarea
                value={form.captionExample}
                onChange={(e) => set("captionExample", e.target.value)}
                placeholder="Paste an existing caption that captures this brand's voice perfectly — the AI will match it."
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>
        </div>

        {/* Brand Strategy — StoryBrand SB7 */}
        <div className="border-t border-black/8 pt-8">
          <button
            type="button"
            onClick={() => setShowStrategy((v) => !v)}
            className="flex items-center justify-between w-full group mb-1"
          >
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-black/30 group-hover:text-black/50 transition-colors text-left">
                Brand Strategy
              </p>
              <p className="text-[11px] text-black/25 mt-0.5 text-left">
                StoryBrand (SB7) framework — informs every AI-generated post
              </p>
            </div>
            <span className="text-black/30 group-hover:text-black/60 transition-colors text-sm">
              {showStrategy ? "▴" : "▾"}
            </span>
          </button>

          {showStrategy && (
            <div className="mt-6 space-y-8">

              {/* The Hero */}
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/20 mb-3">The Hero (your customer)</p>
                <Field label="Who is the hero and what do they want?">
                  <textarea
                    value={form.strategy.heroDescription}
                    onChange={(e) => setStrategy("heroDescription", e.target.value)}
                    placeholder="e.g. Women 40–60 who want to feel confident and put-together without spending hours getting dressed or overhauling their wardrobe."
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>

              {/* The Problems */}
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/20 mb-3">The Problems</p>
                <div className="space-y-4">
                  <Field label="External Problem — the surface/physical issue">
                    <input
                      type="text"
                      value={form.strategy.externalProblem}
                      onChange={(e) => setStrategy("externalProblem", e.target.value)}
                      placeholder="e.g. They don't know how to build a wardrobe that actually works for their life."
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Internal Problem — how it makes them feel">
                    <input
                      type="text"
                      value={form.strategy.internalProblem}
                      onChange={(e) => setStrategy("internalProblem", e.target.value)}
                      placeholder="e.g. They feel invisible, out of touch, and like their outer appearance doesn't match who they are inside."
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Philosophical Problem — why this injustice shouldn't exist">
                    <input
                      type="text"
                      value={form.strategy.philosophicalProblem}
                      onChange={(e) => setStrategy("philosophicalProblem", e.target.value)}
                      placeholder="e.g. Women shouldn't have to spend a fortune or have a stylist's eye to look and feel extraordinary every day."
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              {/* The Guide */}
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/20 mb-3">The Guide (the brand's role)</p>
                <Field label="How does this brand position itself as the empathetic, authoritative guide?">
                  <textarea
                    value={form.strategy.guideRole}
                    onChange={(e) => setStrategy("guideRole", e.target.value)}
                    placeholder="e.g. We've helped hundreds of women rebuild their wardrobes around who they actually are — not who they used to be. We understand because we've been there too."
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>

              {/* The Plan */}
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/20 mb-3">The 3-Step Plan</p>
                <div className="space-y-3">
                  {(["Step 1", "Step 2", "Step 3"] as const).map((label, i) => (
                    <Field key={label} label={label}>
                      <input
                        type="text"
                        value={form.strategy.threeStepPlan[i as 0 | 1 | 2]}
                        onChange={(e) => setStrategyStep(i as 0 | 1 | 2, e.target.value)}
                        placeholder={
                          i === 0 ? "e.g. Book a free wardrobe audit"
                          : i === 1 ? "e.g. We build your personalised style plan"
                          : "e.g. Step out with confidence every day"
                        }
                        className={inputCls}
                      />
                    </Field>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/20 mb-3">Calls to Action</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Direct CTA — primary action">
                    <input
                      type="text"
                      value={form.strategy.directCta}
                      onChange={(e) => setStrategy("directCta", e.target.value)}
                      placeholder="e.g. Book a styling session"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Transitional CTA — softer engagement">
                    <input
                      type="text"
                      value={form.strategy.transitionalCta}
                      onChange={(e) => setStrategy("transitionalCta", e.target.value)}
                      placeholder="e.g. Download our free capsule wardrobe guide"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              {/* Stakes & Transformation */}
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/20 mb-3">Stakes & Transformation</p>
                <div className="space-y-4">
                  <Field label="Stakes — what tragic outcome do they avoid by working with you?">
                    <input
                      type="text"
                      value={form.strategy.stakes}
                      onChange={(e) => setStrategy("stakes", e.target.value)}
                      placeholder="e.g. Another decade of wasted money on clothes they never wear, and never feeling truly themselves."
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Transformation — who do they become after? Paint the success picture.">
                    <textarea
                      value={form.strategy.transformation}
                      onChange={(e) => setStrategy("transformation", e.target.value)}
                      placeholder="e.g. A woman who gets dressed in minutes, turns heads without trying, and finally feels like her outside matches her inside."
                      rows={2}
                      className={`${inputCls} resize-none`}
                    />
                  </Field>
                </div>
              </div>

              {/* Content Strategy */}
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/20 mb-3">Content Strategy</p>
                <div className="space-y-4">
                  <Field label="Content Pillars — 4–6 themes this brand always returns to (comma-separated)">
                    <input
                      type="text"
                      value={form.strategy.contentPillars}
                      onChange={(e) => setStrategy("contentPillars", e.target.value)}
                      placeholder="e.g. Wardrobe Transformation, Styling Tips, Investment Pieces, Client Stories, Behind the Session"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Storytelling Angle — the brand's unique narrative lens">
                    <input
                      type="text"
                      value={form.strategy.storytellingAngle}
                      onChange={(e) => setStrategy("storytellingAngle", e.target.value)}
                      placeholder="e.g. Every woman has a signature style waiting to be uncovered — not invented."
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Posting Cadence — recommended rhythm">
                    <input
                      type="text"
                      value={form.strategy.postingCadence}
                      onChange={(e) => setStrategy("postingCadence", e.target.value)}
                      placeholder="e.g. 4× per week — 2 Reels, 1 Carousel, 1 Story. Post Tue/Thu/Sat + one mid-week Story."
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={onSave}
          disabled={!canSave}
          className="text-sm bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Save Brand
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-black/40 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Brand Card ───────────────────────────────────────────────────────────────

function BrandCard({
  brand,
  isActive,
  onSetActive,
  onEdit,
  onDelete,
}: {
  brand: Brand;
  isActive: boolean;
  onSetActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={`bg-white border p-6 transition-colors ${
        isActive
          ? "border-black"
          : "border-black/10 hover:border-black/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {isActive && (
            <span className="text-[10px] font-mono text-white bg-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
              Active
            </span>
          )}
          <h3 className="text-lg font-semibold leading-tight">{brand.name}</h3>
          {brand.handle && (
            <p className="text-xs text-black/40 mt-0.5">{brand.handle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {!isActive && (
            <button
              onClick={onSetActive}
              className="text-xs text-black/50 hover:text-black transition-colors border border-black/15 px-3 py-1 rounded-full hover:border-black/40"
            >
              Set active
            </button>
          )}
          <button
            onClick={onEdit}
            className="text-xs text-black/40 hover:text-black transition-colors border border-black/15 px-3 py-1 rounded-full hover:border-black/40"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="text-xs bg-black/5 text-black/60 px-2.5 py-1 rounded-full">
          {brand.niche}
        </span>
        {brand.platforms.map((p) => (
          <span
            key={p}
            className="text-xs border border-black/10 text-black/40 px-2.5 py-1 rounded-full capitalize"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Audience */}
      {brand.targetAudience && (
        <p className="text-xs text-black/50 leading-relaxed mb-3 line-clamp-2">
          {brand.targetAudience}
        </p>
      )}

      {/* Tone snippet */}
      {brand.brandVoice.toneDescription && (
        <p className="text-xs text-black/30 leading-relaxed italic line-clamp-2">
          &ldquo;{brand.brandVoice.toneDescription}&rdquo;
        </p>
      )}

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-black/8 flex items-center justify-between">
        <p className="text-[10px] text-black/25">
          Added{" "}
          {new Date(brand.createdAt).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        {confirming ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-red-500">Delete?</span>
            <button
              onClick={() => { onDelete(); setConfirming(false); }}
              className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-black/40 hover:text-black transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-black/20 hover:text-red-500 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandsPage() {
  const { brands, activeBrand, setActiveBrandId, addBrand, updateBrand, deleteBrand } =
    useBrands();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const openAdd = () => {
    setForm(emptyForm);
    setEditing("new");
  };

  const openEdit = (brand: Brand) => {
    setForm(brandToForm(brand));
    setEditing(brand.id);
  };

  const close = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const save = () => {
    const data = formToBrand(form);
    if (!data.name || !data.niche) return;
    if (editing === "new") {
      addBrand(data);
    } else if (editing) {
      updateBrand(editing, data);
    }
    close();
  };

  return (
    <>
      <Nav />
      <div className="pt-14 bg-zinc-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-black/10 px-6 py-8">
          <div className="max-w-6xl mx-auto flex items-end justify-between">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-1">Agency</p>
              <h1 className="text-3xl font-semibold tracking-tight">Client Brands</h1>
            </div>
            {editing !== "new" && (
              <button
                onClick={openAdd}
                className="text-sm bg-black text-white px-5 py-2 rounded-full hover:bg-black/80 transition-colors"
              >
                + Add Brand
              </button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Add form */}
            {editing === "new" && (
              <BrandForm
                form={form}
                setForm={setForm}
                onSave={save}
                onCancel={close}
                title="New Brand"
              />
            )}

            {/* Empty state */}
            {brands.length === 0 && editing !== "new" && (
              <div className="sm:col-span-2 text-center py-24 bg-white border border-black/10">
                <p className="text-sm text-black/30 mb-6">No client brands yet.</p>
                <button
                  onClick={openAdd}
                  className="text-sm border border-black/20 px-6 py-2.5 rounded-full hover:border-black/50 transition-colors"
                >
                  Add your first brand
                </button>
              </div>
            )}

            {/* Brand cards */}
            {brands.map((brand) =>
              editing === brand.id ? (
                <BrandForm
                  key={brand.id}
                  form={form}
                  setForm={setForm}
                  onSave={save}
                  onCancel={close}
                  title="Edit Brand"
                />
              ) : (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  isActive={activeBrand?.id === brand.id}
                  onSetActive={() => setActiveBrandId(brand.id)}
                  onEdit={() => openEdit(brand)}
                  onDelete={() => deleteBrand(brand.id)}
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
