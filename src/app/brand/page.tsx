"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";

interface BlueprintData {
  creatorName: string;
  handle: string;
  niche: string;
  aesthetic: string;
  positioning: string;
  mission: string;
  vision: string;
  customerAvatar: {
    description: string;
    painPoints: string[];
    aspirations: string[];
  };
  brandVoice: {
    traits: Array<{ trait: string; opposite: string; intensity: number }>;
    captionExample: string;
  };
  contentPillars: Array<{
    id: string;
    name: string;
    description: string;
    formats: string[];
    frequency: string;
  }>;
}

const defaultPillars = [
  {
    id: "01",
    name: "Style Inspiration",
    description: "Curated outfit ideas and editorial shots that set the visual tone of your feed.",
    formats: ["Carousel", "Reel", "Static Post"],
    frequency: "3× per week",
  },
  {
    id: "02",
    name: "Behind the Brand",
    description: "Authentic glimpses into your creative process, shoots, and day-to-day.",
    formats: ["Stories", "Reel", "Vlog"],
    frequency: "2× per week",
  },
  {
    id: "03",
    name: "Style Education",
    description: "Tips, how-tos, and styling guides that position you as the expert in your niche.",
    formats: ["Carousel", "Reel"],
    frequency: "1× per week",
  },
  {
    id: "04",
    name: "Community & Collabs",
    description: "Collaborations, reposts, and audience-facing conversations that build loyalty.",
    formats: ["Stories", "Collab Post"],
    frequency: "1× per week",
  },
];

const defaultToneTraits = [
  { trait: "Confident", opposite: "Uncertain", intensity: 0.75 },
  { trait: "Warm", opposite: "Distant", intensity: 0.70 },
  { trait: "Aspirational", opposite: "Boastful", intensity: 0.65 },
  { trait: "Informative", opposite: "Preachy", intensity: 0.80 },
];

const palette = [
  { name: "Ink", hex: "#0A0A0A", text: "white" },
  { name: "Chalk", hex: "#F5F5F4", text: "black" },
  { name: "Stone", hex: "#A8A29E", text: "white" },
  { name: "Linen", hex: "#E7E5E4", text: "black" },
  { name: "Espresso", hex: "#3D2B1F", text: "white" },
];

const typographyTokens = [
  { role: "Headlines", spec: "Geist Sans · 48–72px · Semibold · Tight tracking" },
  { role: "Subheadings", spec: "Geist Sans · 20–28px · Medium · Normal tracking" },
  { role: "Body", spec: "Geist Sans · 14–16px · Regular · Relaxed leading" },
  { role: "Captions / Labels", spec: "Geist Mono · 11–12px · Regular · Wide tracking" },
];

export default function BrandPage() {
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("creator_brand_blueprint");
    if (stored) {
      try {
        setBlueprint(JSON.parse(stored));
      } catch {
        // Ignore malformed data
      }
    }
  }, []);

  const pillars = blueprint?.contentPillars ?? defaultPillars;
  const toneTraits = blueprint?.brandVoice?.traits ?? defaultToneTraits;
  const captionExample = blueprint?.brandVoice?.captionExample ??
    "This silk slip has been in heavy rotation since March — and honestly, I've stopped apologising for rewearing. Your wardrobe should work for you. Here's exactly how I'm styling it three different ways this week.";

  const headerTags = blueprint
    ? [blueprint.niche, blueprint.aesthetic, "info@temamoda.com.au"]
    : ["Luxury Fashion", "Minimal & Clean", "Sydney, AU", "info@temamoda.com.au"];

  const totalPostsPerWeek = pillars.reduce((sum, p) => {
    const match = p.frequency.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <>
      <Nav />
      <div className="pt-14">

        {/* Header */}
        <section className="bg-black text-white px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">
              Brand Blueprint
            </p>
            <h1 className="text-5xl font-semibold tracking-tight mb-4">
              {blueprint?.creatorName
                ? `${blueprint.creatorName} · Creator Studio`
                : "Tema Moda Creator Studio"}
            </h1>
            <p className="text-white/50 text-lg max-w-xl">
              {blueprint?.positioning ??
                "Your strategic brand identity document. Use this as your north star for every caption, visual, and collaboration."}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {headerTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs border border-white/20 text-white/60 px-3 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Statement */}
        <section className="px-6 py-20 border-b border-black/10">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-12">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-2">Mission</p>
              <p className="text-sm text-black/70 leading-relaxed">
                {blueprint?.mission ??
                  "Empower fashion-conscious women to dress with intention, not impulse — building a wardrobe that is both beautiful and sustainable."}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-2">Vision</p>
              <p className="text-sm text-black/70 leading-relaxed">
                {blueprint?.vision ??
                  "To be the most trusted fashion voice for Australian women who want effortless style without compromise."}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-2">Positioning</p>
              <p className="text-sm text-black/70 leading-relaxed">
                {blueprint?.positioning ??
                  "Elevated everyday style for the modern Australian woman — where luxury meets accessibility."}
              </p>
            </div>
          </div>
        </section>

        {/* Ideal Customer — only shown when blueprint is available */}
        {blueprint?.customerAvatar && (
          <section className="px-6 py-20 bg-black/[0.02] border-b border-black/10">
            <div className="max-w-6xl mx-auto">
              <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-2">
                Ideal customer
              </p>
              <h2 className="text-3xl font-semibold tracking-tight mb-8">Who you&apos;re speaking to.</h2>
              <div className="grid sm:grid-cols-3 gap-8">
                <div className="sm:col-span-1">
                  <p className="text-sm text-black/70 leading-relaxed">
                    {blueprint.customerAvatar.description}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-black/40 uppercase tracking-wider mb-3">Pain Points</p>
                  <ul className="space-y-2">
                    {blueprint.customerAvatar.painPoints.map((point, i) => (
                      <li key={i} className="text-sm text-black/60 flex gap-2">
                        <span className="text-black/20 mt-0.5">·</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-black/40 uppercase tracking-wider mb-3">Aspirations</p>
                  <ul className="space-y-2">
                    {blueprint.customerAvatar.aspirations.map((aspiration, i) => (
                      <li key={i} className="text-sm text-black/60 flex gap-2">
                        <span className="text-black/20 mt-0.5">·</span>
                        {aspiration}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Content Pillars */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-2">
                  Content pillars
                </p>
                <h2 className="text-3xl font-semibold tracking-tight">What you post.</h2>
              </div>
              <p className="text-sm text-black/40">{totalPostsPerWeek} posts per week</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {pillars.map(({ id, name, description, formats, frequency }) => (
                <div key={id} className="border border-black/10 p-8 hover:border-black/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-xs font-mono text-black/30">{id}</p>
                    <span className="text-xs text-black/40 bg-black/5 px-2.5 py-1 rounded-full">
                      {frequency}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{name}</h3>
                  <p className="text-sm text-black/50 leading-relaxed mb-5">{description}</p>
                  <div className="flex flex-wrap gap-2">
                    {formats.map((f) => (
                      <span key={f} className="text-xs border border-black/15 px-2.5 py-1 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tone of Voice */}
        <section className="px-6 py-20 bg-black text-white">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.25em] uppercase text-white/30 mb-2">
              Tone of voice
            </p>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">How you sound.</h2>
            <p className="text-sm text-white/50 mb-14 max-w-lg">
              Your voice is the thread that ties every caption, Story, and Reel together.
              Stay in this range — always.
            </p>
            <div className="space-y-0 border border-white/10">
              {toneTraits.map(({ trait, opposite, intensity }, i) => (
                <div
                  key={trait}
                  className={`flex items-center justify-between px-8 py-5 ${
                    i < toneTraits.length - 1 ? "border-b border-white/10" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-white">{trait}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${intensity * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white/30 w-20 text-right">not {opposite}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 p-8 border border-white/10">
              <p className="text-xs tracking-[0.25em] uppercase text-white/30 mb-4">Caption example</p>
              <p className="text-sm text-white/70 leading-relaxed italic">
                &ldquo;{captionExample}&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-2">
              Colour palette
            </p>
            <h2 className="text-3xl font-semibold tracking-tight mb-12">How you look.</h2>
            <div className="grid grid-cols-5 gap-4">
              {palette.map(({ name, hex, text }) => (
                <div key={name}>
                  <div
                    className="h-32 rounded-lg mb-3 flex items-end p-3"
                    style={{ backgroundColor: hex }}
                  >
                    <span
                      className="text-xs font-mono"
                      style={{ color: text === "white" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)" }}
                    >
                      {hex}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="px-6 py-20 border-t border-black/10">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-2">
              Typography
            </p>
            <h2 className="text-3xl font-semibold tracking-tight mb-12">Your typeface system.</h2>
            <div className="space-y-0 border border-black/10">
              {typographyTokens.map(({ role, spec }, i) => (
                <div
                  key={role}
                  className={`flex items-center justify-between px-8 py-5 ${
                    i < typographyTokens.length - 1 ? "border-b border-black/10" : ""
                  }`}
                >
                  <span className="text-sm font-medium w-40">{role}</span>
                  <span className="text-sm text-black/50 font-mono">{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
