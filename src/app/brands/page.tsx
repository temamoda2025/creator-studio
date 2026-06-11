"use client";

import { useState } from "react";
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
}

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
};

function brandToForm(b: Brand): FormState {
  const knownNiche = NICHES.includes(b.niche);
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
  };
}

function formToBrand(f: FormState): Omit<Brand, "id" | "createdAt" | "updatedAt"> {
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
  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

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
