"use client";

import { useState } from "react";
import Link from "next/link";

type FormData = {
  name: string;
  handle: string;
  niche: string;
  aesthetic: string;
  audience: string;
  frequency: string;
  pillars: string[];
  goal: string;
};

const NICHES = ["Luxury Fashion", "Street Style", "Sustainable Fashion", "Beauty & Skincare", "Lifestyle", "Personal Styling"];
const AESTHETICS = ["Minimal & Clean", "Bold & Editorial", "Warm & Earthy", "Dark & Moody", "Soft & Romantic", "Urban & Raw"];
const AUDIENCES = ["Under 1K", "1K – 10K", "10K – 50K", "50K – 100K", "100K+"];
const FREQUENCIES = ["1× per week", "3× per week", "Daily", "Multiple times daily"];
const PILLAR_OPTIONS = ["Outfit Inspiration", "Behind the Scenes", "Shopping Hauls", "Style Tips", "Brand Collabs", "Personal Story", "Trend Reports", "Product Reviews"];
const GOALS = ["Grow my following", "Land brand deals", "Drive website traffic", "Build community", "Sell my own products"];

const STEPS = ["Creator", "Aesthetic", "Content", "Launch"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: "",
    handle: "",
    niche: "",
    aesthetic: "",
    audience: "",
    frequency: "",
    pillars: [],
    goal: "",
  });

  const update = (key: keyof FormData, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const togglePillar = (p: string) => {
    setForm((prev) => ({
      ...prev,
      pillars: prev.pillars.includes(p)
        ? prev.pillars.filter((x) => x !== p)
        : prev.pillars.length < 4
        ? [...prev.pillars, p]
        : prev.pillars,
    }));
  };

  const canProceed = [
    form.name && form.handle && form.niche,
    form.aesthetic && form.audience,
    form.pillars.length > 0 && form.frequency && form.goal,
    true,
  ][step];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="border-b border-black/10 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-widest uppercase">
          Tema Moda
        </Link>
        <div className="flex items-center gap-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className={`text-xs font-medium transition-colors ${
                  i === step
                    ? "text-black"
                    : i < step
                    ? "text-black/40 line-through"
                    : "text-black/20"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="text-black/20 text-xs">·</span>
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-black/5">
        <div
          className="h-full bg-black transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <main className="flex-1 flex items-start justify-center px-6 py-16">
        <div className="w-full max-w-lg">

          {/* Step 0 — Creator basics */}
          {step === 0 && (
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-3">Step 1 of 4</p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Who are you?</h1>
              <p className="text-sm text-black/50 mb-10">Let&apos;s start with the basics about you and your brand.</p>

              <div className="space-y-6">
                <Field label="Your name">
                  <input
                    type="text"
                    placeholder="e.g. Sofia Romano"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </Field>
                <Field label="Instagram handle">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black/30">@</span>
                    <input
                      type="text"
                      placeholder="yourhandle"
                      value={form.handle}
                      onChange={(e) => update("handle", e.target.value)}
                      className="w-full border border-black/15 rounded-lg pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </Field>
                <Field label="Your niche">
                  <div className="grid grid-cols-2 gap-2">
                    {NICHES.map((n) => (
                      <OptionChip
                        key={n}
                        label={n}
                        selected={form.niche === n}
                        onClick={() => update("niche", n)}
                      />
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Step 1 — Aesthetic */}
          {step === 1 && (
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-3">Step 2 of 4</p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Your aesthetic.</h1>
              <p className="text-sm text-black/50 mb-10">How does your feed look and feel?</p>

              <div className="space-y-8">
                <Field label="Visual aesthetic">
                  <div className="grid grid-cols-2 gap-2">
                    {AESTHETICS.map((a) => (
                      <OptionChip
                        key={a}
                        label={a}
                        selected={form.aesthetic === a}
                        onClick={() => update("aesthetic", a)}
                      />
                    ))}
                  </div>
                </Field>
                <Field label="Current audience size">
                  <div className="grid grid-cols-3 gap-2">
                    {AUDIENCES.map((a) => (
                      <OptionChip
                        key={a}
                        label={a}
                        selected={form.audience === a}
                        onClick={() => update("audience", a)}
                      />
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Step 2 — Content */}
          {step === 2 && (
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-black/30 mb-3">Step 3 of 4</p>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Your content plan.</h1>
              <p className="text-sm text-black/50 mb-10">Choose up to 4 content pillars and set your rhythm.</p>

              <div className="space-y-8">
                <Field label={`Content pillars (${form.pillars.length}/4 selected)`}>
                  <div className="grid grid-cols-2 gap-2">
                    {PILLAR_OPTIONS.map((p) => (
                      <OptionChip
                        key={p}
                        label={p}
                        selected={form.pillars.includes(p)}
                        onClick={() => togglePillar(p)}
                        disabled={!form.pillars.includes(p) && form.pillars.length >= 4}
                      />
                    ))}
                  </div>
                </Field>
                <Field label="Posting frequency">
                  <div className="grid grid-cols-2 gap-2">
                    {FREQUENCIES.map((f) => (
                      <OptionChip
                        key={f}
                        label={f}
                        selected={form.frequency === f}
                        onClick={() => update("frequency", f)}
                      />
                    ))}
                  </div>
                </Field>
                <Field label="Primary goal">
                  <div className="grid grid-cols-1 gap-2">
                    {GOALS.map((g) => (
                      <OptionChip
                        key={g}
                        label={g}
                        selected={form.goal === g}
                        onClick={() => update("goal", g)}
                      />
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Step 3 — Launch */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight mb-3">
                Your studio is ready, {form.name.split(" ")[0] || "Creator"}.
              </h1>
              <p className="text-sm text-black/50 mb-2">
                <span className="text-black font-medium">@{form.handle || "yourhandle"}</span> · {form.niche} · {form.aesthetic}
              </p>
              <p className="text-sm text-black/40 mb-10">
                {form.pillars.length} content pillars · {form.frequency || "TBD"} · Goal: {form.goal || "TBD"}
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Link
                  href="/brand"
                  className="bg-black text-white text-sm font-medium px-6 py-3 rounded-full text-center hover:bg-black/80 transition-colors"
                >
                  View your Brand Blueprint
                </Link>
                <Link
                  href="/dashboard"
                  className="border border-black text-black text-sm font-medium px-6 py-3 rounded-full text-center hover:bg-black/5 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className={`text-sm text-black/40 hover:text-black transition-colors ${step === 0 ? "invisible" : ""}`}
              >
                ← Back
              </button>
              <button
                disabled={!canProceed}
                onClick={() => setStep((s) => s + 1)}
                className="bg-black text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-black/40 uppercase tracking-wider mb-3">
        {label}
      </label>
      {children}
    </div>
  );
}

function OptionChip({
  label,
  selected,
  onClick,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-sm px-4 py-3 rounded-lg border text-left transition-all ${
        selected
          ? "bg-black text-white border-black"
          : "bg-white text-black border-black/15 hover:border-black/40"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}
