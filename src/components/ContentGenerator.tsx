"use client";

import { useState, useEffect } from "react";
import { useBrands } from "@/context/BrandsContext";

const FORMATS = ["Reel", "Carousel", "Static Post", "Story"] as const;
type Format = (typeof FORMATS)[number];

interface AdorarAnalysis {
  attention: string;
  desire: string;
  outcome: string;
  reasonToBelieve: string;
  authenticity: string;
  realYou: string;
}

interface ContentResult {
  adorar: AdorarAnalysis;
  coreMessage: string;
  emotionalMessage: string;
  visualDirection: string;
  caption: string;
  psychologicalExplanation: string;
  cta: string;
}

const ADORAR_LABELS: { key: keyof AdorarAnalysis; label: string; letter: string }[] = [
  { key: "attention", label: "Attention", letter: "A" },
  { key: "desire", label: "Desire", letter: "D" },
  { key: "outcome", label: "Outcome", letter: "O" },
  { key: "reasonToBelieve", label: "Reason to Believe", letter: "R" },
  { key: "authenticity", label: "Authenticity", letter: "A" },
  { key: "realYou", label: "Real You", letter: "R" },
];

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white border border-black/10 p-6 space-y-3">
        <div className="h-3 bg-black/8 rounded w-32" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-2.5 bg-black/8 rounded w-12" />
              <div className="h-2 bg-black/6 rounded w-full" />
              <div className="h-2 bg-black/6 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-black/10 p-6 space-y-2">
          <div className="h-2.5 bg-black/8 rounded w-24" />
          <div className="h-2 bg-black/6 rounded w-full" />
          <div className="h-2 bg-black/6 rounded w-4/5" />
          <div className="h-2 bg-black/6 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function ResultCard({
  label,
  children,
  variant = "default",
}: {
  label: string;
  children: React.ReactNode;
  variant?: "default" | "accent" | "caption";
}) {
  const base = "border p-6";
  const variants = {
    default: `${base} bg-white border-black/10`,
    accent: `${base} bg-black text-white border-black`,
    caption: `${base} bg-zinc-50 border-black/15`,
  };

  return (
    <div className={variants[variant]}>
      <p
        className={`text-xs uppercase tracking-[0.2em] mb-3 ${
          variant === "accent" ? "text-white/40" : "text-black/30"
        }`}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="mt-4 text-xs text-black/40 hover:text-black transition-colors border border-black/15 px-3 py-1.5 rounded-full hover:border-black/40"
    >
      {copied ? "Copied" : "Copy caption"}
    </button>
  );
}

export default function ContentGenerator({
  initialIdea,
}: {
  initialIdea?: string;
}) {
  const { activeBrand } = useBrands();
  const [brandName, setBrandName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentIdea, setContentIdea] = useState("");
  const [format, setFormat] = useState<Format>("Reel");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeBrand) {
      setBrandName(activeBrand.name);
      setTargetAudience(activeBrand.targetAudience);
    }
  }, [activeBrand]);

  useEffect(() => {
    if (initialIdea) {
      setContentIdea(initialIdea);
      setResult(null);
    }
  }, [initialIdea]);

  const generate = async () => {
    if (!brandName.trim() || !contentIdea.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          targetAudience,
          contentIdea,
          format,
          brandVoice: activeBrand?.brandVoice ?? null,
          brandPositioning: activeBrand?.positioning ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data: ContentResult = await res.json();
      setResult(data);

      const history = JSON.parse(localStorage.getItem("adorar_caption_history") ?? "[]");
      history.unshift({
        id: crypto.randomUUID(),
        caption: data.caption,
        brandName,
        topic: contentIdea,
        generatedAt: new Date().toISOString(),
      });
      localStorage.setItem("adorar_caption_history", JSON.stringify(history));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = brandName.trim() && contentIdea.trim() && !loading;

  return (
    <div className="space-y-8">

      {/* Form */}
      <div className="bg-white border border-black/10 p-8">
        <div className="max-w-2xl">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-base font-semibold">ADORAR™ Content Generator</h2>
            {activeBrand && (
              <span className="text-xs border border-black/15 px-2.5 py-1 rounded-full text-black/50 shrink-0 ml-4">
                {activeBrand.name}
              </span>
            )}
          </div>
          <p className="text-sm text-black/40 mb-8 leading-relaxed">
            Trained on Schwartz, Godin, Hormozi, Suby, and luxury brand strategy.
            People don&apos;t buy products — they buy outcomes, identity, and belonging.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Brand Name <span className="text-black/60">*</span>
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Tema Moda, Nike, Your Brand Co."
                className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Women 35–55 who value quality over quantity"
                className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Content Idea / Topic <span className="text-black/60">*</span>
              </label>
              <textarea
                value={contentIdea}
                onChange={(e) => setContentIdea(e.target.value)}
                placeholder="e.g. Why I stopped buying trend pieces and what happened to my wardrobe"
                rows={3}
                className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Format
              </label>
              <div className="flex gap-2 flex-wrap">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                      format === f
                        ? "bg-black text-white border-black"
                        : "border-black/15 text-black/60 hover:border-black/40 hover:text-black"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!canSubmit}
              className="mt-2 w-full sm:w-auto bg-black text-white text-sm px-8 py-3 rounded-full hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate with ADORAR™"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-black/40">
              Running ADORAR™ analysis — thinking deeply about your audience...
            </p>
          </div>
          <Skeleton />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">

          {/* ADORAR Analysis */}
          <div className="bg-white border border-black/10 p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-6">
              ADORAR™ Analysis
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {ADORAR_LABELS.map(({ key, label, letter }) => (
                <div key={key} className="border-l-2 border-black/10 pl-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-semibold leading-none">{letter}</span>
                    <span className="text-xs text-black/40 uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-sm text-black/70 leading-relaxed">{result.adorar[key]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Core + Emotional */}
          <div className="grid sm:grid-cols-2 gap-4">
            <ResultCard label="Core Message">
              <p className="text-sm font-medium leading-relaxed text-black/80">
                {result.coreMessage}
              </p>
            </ResultCard>
            <ResultCard label="Emotional Message" variant="accent">
              <p className="text-sm leading-relaxed text-white/80">
                {result.emotionalMessage}
              </p>
            </ResultCard>
          </div>

          {/* Visual Direction */}
          <ResultCard label="Visual Direction">
            <p className="text-sm text-black/70 leading-relaxed">
              {result.visualDirection}
            </p>
          </ResultCard>

          {/* Caption */}
          <ResultCard label={`Caption — ${format}`} variant="caption">
            <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line">
              {result.caption}
            </p>
            <CopyButton text={result.caption} />
          </ResultCard>

          {/* CTA */}
          <div className="bg-white border border-black/10 p-6 flex items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-2">Call to Action</p>
              <p className="text-sm font-medium">{result.cta}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(result.cta)}
              className="shrink-0 text-xs text-black/40 hover:text-black transition-colors border border-black/15 px-3 py-1.5 rounded-full hover:border-black/40"
            >
              Copy
            </button>
          </div>

          {/* Psychological Explanation */}
          <ResultCard label="Psychological Explanation">
            <p className="text-sm text-black/60 leading-relaxed">
              {result.psychologicalExplanation}
            </p>
          </ResultCard>

          {/* Generate again */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setResult(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-xs text-black/40 hover:text-black transition-colors"
            >
              ← Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
