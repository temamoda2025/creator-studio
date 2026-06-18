"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import { useBrands } from "@/context/BrandsContext";
import { getBrandKit, saveBrandKit, type BrandKit } from "@/lib/brandKit";
import { FONT_CATEGORIES, GOOGLE_FONTS_HREF } from "@/lib/fonts";
import { generateBrandGuidePDF } from "@/lib/generateBrandGuidePDF";

// ── Colour swatch field ───────────────────────────────────────────────────────

function ColourField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        className="relative block h-28 cursor-pointer group overflow-hidden border border-black/10 hover:border-black/30 transition-colors"
        style={{ background: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-black/25 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
            Click to edit
          </span>
        </div>
      </label>
      <div className="mt-2.5 space-y-0.5">
        <p className="text-xs font-semibold text-black">{label}</p>
        <p className="text-[11px] text-black/40">{description}</p>
        <p className="text-[11px] font-mono text-black/30">{value.toUpperCase()}</p>
      </div>
    </div>
  );
}

// ── Font select ───────────────────────────────────────────────────────────────

function FontSelect({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-black mb-0.5">{label}</label>
      <p className="text-[11px] text-black/40 mb-2.5">{description}</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black/40 transition-colors bg-white appearance-none pr-10"
        >
          {FONT_CATEGORIES.map((cat) => (
            <optgroup key={cat.label} label={cat.label}>
              {cat.fonts.map((f) => (
                <option key={f.family} value={f.family}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p
        className="text-sm mt-3 text-black/55 leading-relaxed"
        style={{ fontFamily: `"${value}", serif` }}
      >
        The quick brown fox jumps over the lazy dog.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BrandKitPage() {
  const { activeBrand } = useBrands();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Google Fonts for previews
  useEffect(() => {
    if (document.getElementById("gf-brand-kit")) return;
    const link = document.createElement("link");
    link.id = "gf-brand-kit";
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  // Load kit when active brand changes
  useEffect(() => {
    if (!activeBrand) { setKit(null); return; }
    getBrandKit(activeBrand.id).then(setKit);
  }, [activeBrand]);

  const persist = useCallback(
    (next: BrandKit) => {
      if (!activeBrand) return;
      saveBrandKit(activeBrand.id, next);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      setSaved(true);
      savedTimer.current = setTimeout(() => setSaved(false), 2000);
    },
    [activeBrand]
  );

  const update = useCallback(
    (patch: Partial<BrandKit>) => {
      setKit((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      update({ logo: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeLogo = () => update({ logo: null });

  const [pdfGenerating, setPdfGenerating] = useState(false);

  const downloadPDF = useCallback(async () => {
    if (!activeBrand || !kit || pdfGenerating) return;
    setPdfGenerating(true);
    try {
      const blueprintRaw = localStorage.getItem("creator_brand_blueprint");
      const blueprint = blueprintRaw ? JSON.parse(blueprintRaw) : null;
      generateBrandGuidePDF(activeBrand, kit, blueprint);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfGenerating(false);
    }
  }, [activeBrand, kit, pdfGenerating]);

  return (
    <>
      <Nav />
      <div className="pt-14">

        {/* Header */}
        <section className="bg-black text-white px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">
              Brand Kit
            </p>
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight mb-3">
                  {activeBrand ? activeBrand.name : "No brand selected"}
                </h1>
                <p className="text-white/50 text-sm max-w-lg leading-relaxed">
                  Set your brand colours, fonts, logo, and handle. Design Creator
                  will use these automatically as your starting defaults.
                </p>
              </div>
              {activeBrand && kit && (
                <button
                  onClick={downloadPDF}
                  disabled={pdfGenerating}
                  className="shrink-0 flex items-center gap-2 text-sm border border-white/20 text-white/70 px-5 py-2.5 rounded-full hover:border-white/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M8 2v8m0 0l-3-3m3 3l3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {pdfGenerating ? "Generating…" : "Download Brand Guide"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* No brand */}
        {!activeBrand && (
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <p className="text-black/40 text-sm mb-4">
              Select or create a brand to set up your Brand Kit.
            </p>
            <Link
              href="/brands"
              className="inline-block text-sm bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/80 transition-colors"
            >
              Go to Brands →
            </Link>
          </div>
        )}

        {/* Kit editor */}
        {activeBrand && kit && (
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-14">

            {/* Save indicator */}
            <div
              className={`fixed bottom-6 right-6 text-xs bg-black text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
                saved ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              Saved ✓
            </div>

            {/* ── Colours ── */}
            <section>
              <div className="mb-6">
                <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-1">01</p>
                <h2 className="text-xl font-semibold tracking-tight">Colours</h2>
                <p className="text-sm text-black/40 mt-1">
                  Click any swatch to open the colour picker.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <ColourField
                  label="Primary"
                  description="Main background & dominant colour"
                  value={kit.primaryColour}
                  onChange={(v) => update({ primaryColour: v })}
                />
                <ColourField
                  label="Secondary"
                  description="Text & foreground elements"
                  value={kit.secondaryColour}
                  onChange={(v) => update({ secondaryColour: v })}
                />
                <ColourField
                  label="Accent"
                  description="Highlights & calls to action"
                  value={kit.accentColour}
                  onChange={(v) => update({ accentColour: v })}
                />
              </div>

              {/* Palette preview */}
              <div className="mt-5 border border-black/10 p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/30 mb-3">
                  Palette preview
                </p>
                <div className="flex gap-3 items-center flex-wrap">
                  {[kit.primaryColour, kit.secondaryColour, kit.accentColour].map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-black/10" style={{ background: c }} />
                      <span className="text-[11px] font-mono text-black/40">{c.toUpperCase()}</span>
                    </div>
                  ))}
                  {/* Combination sample */}
                  <div
                    className="ml-auto flex items-center justify-center px-5 py-2 text-xs font-medium rounded-full"
                    style={{ background: kit.primaryColour, color: kit.secondaryColour }}
                  >
                    Sample button
                  </div>
                  <div
                    className="flex items-center justify-center px-5 py-2 text-xs font-medium rounded-full"
                    style={{ background: kit.accentColour, color: kit.primaryColour }}
                  >
                    Accent button
                  </div>
                </div>
              </div>
            </section>

            {/* ── Typography ── */}
            <section>
              <div className="mb-6">
                <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-1">02</p>
                <h2 className="text-xl font-semibold tracking-tight">Typography</h2>
                <p className="text-sm text-black/40 mt-1">
                  Choose fonts from the same Google Fonts collection used in Design Creator.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="border border-black/10 p-6">
                  <FontSelect
                    label="Heading Font"
                    description="Used for titles, templates, and brand name overlays"
                    value={kit.headingFont}
                    onChange={(v) => update({ headingFont: v })}
                  />
                </div>
                <div className="border border-black/10 p-6">
                  <FontSelect
                    label="Body Font"
                    description="Used for captions, handles, and supporting text"
                    value={kit.bodyFont}
                    onChange={(v) => update({ bodyFont: v })}
                  />
                </div>
              </div>

              {/* Combined type preview */}
              <div
                className="mt-5 border border-black/10 p-6"
                style={{ background: kit.primaryColour }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.2em] mb-4"
                  style={{ color: `${kit.secondaryColour}60` }}
                >
                  Typography preview
                </p>
                <p
                  className="text-2xl font-bold leading-tight mb-2"
                  style={{
                    fontFamily: `"${kit.headingFont}", serif`,
                    color: kit.secondaryColour,
                  }}
                >
                  {activeBrand.name}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: `"${kit.bodyFont}", sans-serif`,
                    color: `${kit.secondaryColour}80`,
                  }}
                >
                  Elevate your everyday style with intentional, effortless fashion.
                </p>
              </div>
            </section>

            {/* ── Identity ── */}
            <section>
              <div className="mb-6">
                <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-1">03</p>
                <h2 className="text-xl font-semibold tracking-tight">Identity</h2>
                <p className="text-sm text-black/40 mt-1">
                  Your social handle and logo appear automatically on every design.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">

                {/* Handle */}
                <div className="border border-black/10 p-6">
                  <label className="block text-xs font-semibold text-black mb-0.5">
                    Social Handle
                  </label>
                  <p className="text-[11px] text-black/40 mb-3">
                    Displayed on designs — include or omit the @ symbol
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black/30">
                      @
                    </span>
                    <input
                      type="text"
                      value={kit.handle.replace(/^@+/, "")}
                      onChange={(e) =>
                        update({ handle: e.target.value.replace(/^@+/, "") })
                      }
                      placeholder={activeBrand.name.toLowerCase().replace(/\s+/g, "")}
                      className="w-full border border-black/15 pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-black/40 transition-colors bg-white"
                    />
                  </div>
                  {kit.handle && (
                    <p className="text-[11px] text-black/30 mt-2 font-mono">
                      @{kit.handle.replace(/^@+/, "")}
                    </p>
                  )}
                </div>

                {/* Logo */}
                <div className="border border-black/10 p-6">
                  <label className="block text-xs font-semibold text-black mb-0.5">
                    Logo
                  </label>
                  <p className="text-[11px] text-black/40 mb-3">
                    PNG or SVG — saved per brand in your browser
                  </p>

                  {kit.logo ? (
                    <div className="space-y-3">
                      <div
                        className="h-20 border border-black/10 flex items-center justify-center p-3"
                        style={{ background: kit.primaryColour }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={kit.logo}
                          alt="Brand logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs border border-black/15 px-4 py-2 hover:border-black/40 transition-colors text-black/60"
                        >
                          Replace
                        </button>
                        <button
                          onClick={removeLogo}
                          className="text-xs text-black/35 hover:text-black/70 transition-colors"
                        >
                          Remove ×
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-20 border border-dashed border-black/20 flex items-center justify-center hover:border-black/40 transition-colors text-black/35 text-xs"
                    >
                      Upload PNG or SVG ↑
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.svg,image/png,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </section>

            {/* Design Creator link */}
            <div className="border-t border-black/10 pt-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Ready to create?</p>
                <p className="text-xs text-black/40 mt-0.5">
                  Design Creator will load your brand kit automatically.
                </p>
              </div>
              <Link
                href="/dashboard?tab=design"
                className="text-sm bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/80 transition-colors"
              >
                Open Design Creator →
              </Link>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
