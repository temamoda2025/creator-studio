"use client";

import { useState, useEffect } from "react";
import { useBrands } from "@/context/BrandsContext";

const DURATIONS = ["15s", "30s", "60s", "90s"] as const;
type Duration = (typeof DURATIONS)[number];

interface ScriptHook {
  timeRange: string;
  visual: string;
  voiceover: string;
  onScreenText: string;
}

interface ScriptScene {
  sceneNumber: number;
  timeRange: string;
  heading: string;
  visual: string;
  voiceover: string;
  onScreenText: string;
}

interface ScriptCta {
  timeRange: string;
  visual: string;
  voiceover: string;
  onScreenText: string;
}

interface ReelScript {
  hook: ScriptHook;
  scenes: ScriptScene[];
  cta: ScriptCta;
  caption: string;
  productionNotes: string;
}

function ScriptSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border border-black/10 p-6 space-y-3">
          <div className="h-2.5 bg-black/8 rounded w-28" />
          <div className="h-2 bg-black/6 rounded w-full" />
          <div className="h-2 bg-black/6 rounded w-5/6" />
          <div className="h-2 bg-black/6 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

function SceneCard({
  label,
  timeRange,
  visual,
  voiceover,
  onScreenText,
  variant = "default",
}: {
  label: string;
  timeRange: string;
  visual: string;
  voiceover: string;
  onScreenText: string;
  variant?: "default" | "hook" | "cta";
}) {
  const wrapperClass =
    variant === "hook"
      ? "bg-black text-white border border-black p-6"
      : variant === "cta"
      ? "bg-zinc-900 text-white border border-zinc-800 p-6"
      : "bg-white border border-black/10 p-6";

  const labelClass =
    variant !== "default" ? "text-white/40" : "text-black/30";
  const headingClass = variant !== "default" ? "text-white" : "text-black";
  const timeClass = variant !== "default" ? "text-white/30" : "text-black/25";
  const fieldLabelClass = variant !== "default" ? "text-white/40" : "text-black/35";
  const bodyClass = variant !== "default" ? "text-white/80" : "text-black/70";
  const overlayClass =
    variant !== "default"
      ? "bg-white/10 text-white/70 border-white/10"
      : "bg-zinc-50 text-black/60 border-black/8";

  return (
    <div className={wrapperClass}>
      <div className="flex items-baseline justify-between mb-4">
        <p className={`text-xs uppercase tracking-[0.2em] ${labelClass}`}>{label}</p>
        <span className={`text-xs font-mono ${timeClass}`}>{timeRange}</span>
      </div>

      <h3 className={`text-sm font-semibold mb-4 ${headingClass}`}>{label}</h3>

      <div className="space-y-3">
        <div>
          <p className={`text-[10px] uppercase tracking-wider mb-1 ${fieldLabelClass}`}>
            Visual
          </p>
          <p className={`text-sm leading-relaxed ${bodyClass}`}>{visual}</p>
        </div>

        <div>
          <p className={`text-[10px] uppercase tracking-wider mb-1 ${fieldLabelClass}`}>
            Voiceover
          </p>
          <p className={`text-sm leading-relaxed font-medium ${headingClass}`}>
            "{voiceover}"
          </p>
        </div>

        {onScreenText && (
          <div>
            <p className={`text-[10px] uppercase tracking-wider mb-1 ${fieldLabelClass}`}>
              On-Screen Text
            </p>
            <span
              className={`inline-block text-xs border px-2.5 py-1 rounded ${overlayClass}`}
            >
              {onScreenText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs text-black/40 hover:text-black transition-colors border border-black/15 px-3 py-1.5 rounded-full hover:border-black/40"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function buildFullScript(script: ReelScript): string {
  const lines: string[] = [];
  lines.push(`HOOK — ${script.hook.timeRange}`);
  lines.push(`Visual: ${script.hook.visual}`);
  lines.push(`Voiceover: "${script.hook.voiceover}"`);
  if (script.hook.onScreenText) lines.push(`On-Screen: ${script.hook.onScreenText}`);
  lines.push("");

  for (const s of script.scenes) {
    lines.push(`SCENE ${s.sceneNumber}: ${s.heading} — ${s.timeRange}`);
    lines.push(`Visual: ${s.visual}`);
    lines.push(`Voiceover: "${s.voiceover}"`);
    if (s.onScreenText) lines.push(`On-Screen: ${s.onScreenText}`);
    lines.push("");
  }

  lines.push(`CTA — ${script.cta.timeRange}`);
  lines.push(`Visual: ${script.cta.visual}`);
  lines.push(`Voiceover: "${script.cta.voiceover}"`);
  if (script.cta.onScreenText) lines.push(`On-Screen: ${script.cta.onScreenText}`);
  lines.push("");
  lines.push("CAPTION");
  lines.push(script.caption);
  lines.push("");
  lines.push("PRODUCTION NOTES");
  lines.push(script.productionNotes);

  return lines.join("\n");
}

export default function ReelScriptGenerator() {
  const { brands, activeBrand, setActiveBrandId } = useBrands();
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState<Duration>("30s");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReelScript | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeBrand && !selectedBrandId) {
      setSelectedBrandId(activeBrand.id);
    }
  }, [activeBrand, selectedBrandId]);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) ?? null;

  const generate = async () => {
    if (!topic.trim() || !selectedBrandId) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/reel-script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          duration,
          brandName: selectedBrand?.name ?? "",
          targetAudience: selectedBrand?.targetAudience ?? "",
          brandVoice: selectedBrand?.brandVoice ?? null,
          brandPositioning: selectedBrand?.positioning ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data: ReelScript = await res.json();
      setResult(data);

      const history = JSON.parse(
        localStorage.getItem("adorar_reel_script_history") ?? "[]"
      );
      history.unshift({
        id: crypto.randomUUID(),
        topic,
        brandName: selectedBrand?.name ?? "",
        duration,
        script: data,
        generatedAt: new Date().toISOString(),
      });
      localStorage.setItem("adorar_reel_script_history", JSON.stringify(history));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = topic.trim() && selectedBrandId && !loading;

  return (
    <div className="space-y-8">

      {/* Form */}
      <div className="bg-white border border-black/10 p-8">
        <div className="max-w-2xl">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-base font-semibold">Reel Script Generator</h2>
            {selectedBrand && (
              <span className="text-xs border border-black/15 px-2.5 py-1 rounded-full text-black/50 shrink-0 ml-4">
                {selectedBrand.name}
              </span>
            )}
          </div>
          <p className="text-sm text-black/40 mb-8 leading-relaxed">
            Scene-by-scene scripts with visual direction, voiceover, and on-screen text — ready to film.
          </p>

          <div className="space-y-5">

            {/* Brand selector */}
            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Brand <span className="text-black/60">*</span>
              </label>
              {brands.length === 0 ? (
                <p className="text-sm text-black/40 border border-black/10 px-4 py-3">
                  No brands saved yet — create one via Brand Blueprint first.
                </p>
              ) : (
                <select
                  value={selectedBrandId}
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    setActiveBrandId(e.target.value);
                  }}
                  className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white appearance-none"
                >
                  <option value="" disabled>
                    Select a brand…
                  </option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Topic / Idea <span className="text-black/60">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why I stopped buying trend pieces and what happened to my wardrobe"
                rows={3}
                className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white resize-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Video Length
              </label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                      duration === d
                        ? "bg-black text-white border-black"
                        : "border-black/15 text-black/60 hover:border-black/40 hover:text-black"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!canSubmit}
              className="mt-2 w-full sm:w-auto bg-black text-white text-sm px-8 py-3 rounded-full hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Writing script…" : "Generate Script"}
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
              Directing your {duration} Reel — writing scene by scene…
            </p>
          </div>
          <ScriptSkeleton />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-black/30">
              {duration} Reel Script — {selectedBrand?.name}
            </p>
            <CopyButton text={buildFullScript(result)} label="Copy full script" />
          </div>

          {/* Hook */}
          <SceneCard
            label="Hook"
            timeRange={result.hook.timeRange}
            visual={result.hook.visual}
            voiceover={result.hook.voiceover}
            onScreenText={result.hook.onScreenText}
            variant="hook"
          />

          {/* Scenes */}
          {result.scenes.map((scene) => (
            <SceneCard
              key={scene.sceneNumber}
              label={`Scene ${scene.sceneNumber} — ${scene.heading}`}
              timeRange={scene.timeRange}
              visual={scene.visual}
              voiceover={scene.voiceover}
              onScreenText={scene.onScreenText}
            />
          ))}

          {/* CTA */}
          <SceneCard
            label="CTA"
            timeRange={result.cta.timeRange}
            visual={result.cta.visual}
            voiceover={result.cta.voiceover}
            onScreenText={result.cta.onScreenText}
            variant="cta"
          />

          {/* Caption */}
          <div className="bg-zinc-50 border border-black/15 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-3">
              Caption
            </p>
            <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line">
              {result.caption}
            </p>
            <div className="mt-4">
              <CopyButton text={result.caption} label="Copy caption" />
            </div>
          </div>

          {/* Production Notes */}
          <div className="bg-white border border-black/10 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-3">
              Production Notes
            </p>
            <p className="text-sm text-black/60 leading-relaxed">
              {result.productionNotes}
            </p>
          </div>

          {/* Start over */}
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
