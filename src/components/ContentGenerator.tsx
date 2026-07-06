"use client";

import { useState, useEffect, useRef } from "react";
import { useBrands } from "@/context/BrandsContext";
import { supabase } from "@/lib/supabase";

const FORMATS = ["Single Post", "Carousel", "Reel", "Story"] as const;
type Format = (typeof FORMATS)[number];

const TONES = [
  "Inspirational",
  "Educational",
  "Promotional",
  "Behind the Scenes",
  "Personal",
] as const;
type Tone = (typeof TONES)[number];

interface SlideItem {
  slideNumber: number;
  heading: string;
  body: string;
}

interface ContentResult {
  adorar: {
    attention: string;
    desire: string;
    outcome: string;
    reasonToBelieve: string;
    authenticity: string;
    realYou: string;
  };
  coreMessage: string;
  emotionalMessage: string;
  visualDirection: string;
  caption: string;
  psychologicalExplanation: string;
  cta: string;
  slides?: SlideItem[];
}

const FORMAT_TO_IMAGE_ID: Record<Format, string> = {
  "Single Post": "ig-post",
  Carousel: "ig-carousel",
  Reel: "ig-story",
  Story: "ig-story",
};

const ADORAR_LABELS: {
  key: keyof ContentResult["adorar"];
  letter: string;
  label: string;
}[] = [
  { key: "attention", letter: "A", label: "Attention" },
  { key: "desire", letter: "D", label: "Desire" },
  { key: "outcome", letter: "O", label: "Outcome" },
  { key: "reasonToBelieve", letter: "R", label: "Reason to Believe" },
  { key: "authenticity", letter: "A", label: "Authenticity" },
  { key: "realYou", letter: "R", label: "Real You" },
];

const STORY_LABELS: {
  key: keyof ContentResult["adorar"];
  label: string;
}[] = [
  { key: "attention",       label: "Opening Scene" },
  { key: "desire",          label: "Emotional Thread" },
  { key: "outcome",         label: "Story Tension" },
  { key: "reasonToBelieve", label: "Universal Truth" },
  { key: "authenticity",    label: "Vulnerable Detail" },
  { key: "realYou",         label: "Quiet Insight" },
];

type CaptionMode = "marketing" | "storytelling";

const FALLBACK_FONT =
  'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

async function compressImage(dataUrl: string, maxPx = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxPx || h > maxPx) {
        const scale = Math.min(maxPx / w, maxPx / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

function drawDesignPreview(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  captionText: string,
  brandName: string,
  fontFamily: string
) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const fontStack = `"${fontFamily}", ${FALLBACK_FONT}`;

  // Cover-fill the image
  ctx.clearRect(0, 0, W, H);
  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);

  // Gradient overlay from bottom 55%
  const grad = ctx.createLinearGradient(0, H * 0.38, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.84)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Extract first paragraph / hook (up to 3 lines)
  const firstPara = captionText.split("\n")[0] || captionText;
  const PAD = Math.round(W * 0.07);
  const maxW = W - PAD * 2;
  const fontSize = Math.round(W * 0.048);
  ctx.font = `600 ${fontSize}px ${fontStack}`;

  const words = firstPara.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (cur && ctx.measureText(test).width > maxW) {
      lines.push(cur);
      cur = word;
      if (lines.length >= 3) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < 3) lines.push(cur);

  const lineH = fontSize * 1.38;
  const brandFontSize = Math.round(W * 0.028);
  const bottomReserve = PAD + brandFontSize + Math.round(W * 0.025);
  let y = H - bottomReserve - lines.length * lineH;

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  for (const line of lines) {
    ctx.fillText(line, PAD, y + fontSize);
    y += lineH;
  }

  // Brand name
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.font = `400 ${brandFontSize}px ${fontStack}`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(brandName, PAD, H - PAD);
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-xs text-black/40 hover:text-black transition-colors border border-black/15 px-3 py-1.5 rounded-full hover:border-black/40"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export default function ContentGenerator({
  initialIdea,
  onOpenInDesigner,
}: {
  initialIdea?: string;
  onOpenInDesigner?: (data: { imageDataUrl: string; caption: string; slides?: SlideItem[] }) => void;
}) {
  const { activeBrand } = useBrands();

  // Visual input
  const [photoMode, setPhotoMode] = useState<"upload" | "ai">("upload");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Instructions
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<Format>("Single Post");
  const [tone, setTone] = useState<Tone>("Inspirational");
  const [captionMode, setCaptionMode] = useState<CaptionMode>("marketing");

  // Generation
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Design preview
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewImg, setPreviewImg] = useState<HTMLImageElement | null>(null);
  const [fontFamily, setFontFamily] = useState("Inter");

  useEffect(() => {
    if (initialIdea) {
      setTopic(initialIdea);
      setResult(null);
    }
  }, [initialIdea]);

  useEffect(() => {
    if (!activeBrand) return;
    const saved = localStorage.getItem(`font-${activeBrand.id}`);
    if (saved) setFontFamily(saved);
  }, [activeBrand]);

  useEffect(() => {
    if (!imageDataUrl) { setPreviewImg(null); return; }
    const img = new Image();
    img.onload = () => setPreviewImg(img);
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  useEffect(() => {
    if (!result || !previewImg || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    canvas.width = 1080;
    canvas.height = 1080;
    document.fonts.load(`600 1em "${fontFamily}"`).then(() => {
      drawDesignPreview(
        canvas,
        previewImg,
        result.caption,
        activeBrand?.name ?? "Your Brand",
        fontFamily
      );
    });
  }, [result, previewImg, fontFamily, activeBrand]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      setImageError(null);
      try {
        const compressed = await compressImage(raw);
        // base64 length * 0.75 ≈ byte size; Vercel limit is 4.5 MB
        const approxBytes = compressed.length * 0.75;
        if (approxBytes > 4 * 1024 * 1024) {
          setImageError("Image is too large even after compression. Please try a smaller photo.");
          return;
        }
        setImageDataUrl(compressed);
      } catch {
        setImageDataUrl(raw); // fallback: use original if compression fails
      }
    };
    reader.readAsDataURL(file);
  };

  const generateImage = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingImage(true);
    setImageError(null);
    try {
      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          formatId: FORMAT_TO_IMAGE_ID[format],
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Image generation failed");
      setImageDataUrl(data.dataUrl);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  };

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;
      if (imageDataUrl) {
        const [meta, data] = imageDataUrl.split(",");
        imageBase64 = data;
        imageMimeType = meta.split(":")[1]?.split(";")[0];
      }

      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: activeBrand?.name ?? "Unknown Brand",
          targetAudience: activeBrand?.targetAudience ?? "",
          contentIdea: topic,
          format,
          tone,
          captionMode,
          brandVoice: activeBrand?.brandVoice ?? null,
          brandPositioning: activeBrand?.positioning ?? null,
          brandStrategy: activeBrand?.strategy ?? null,
          imageBase64,
          imageMimeType,
        }),
      });

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error("Image is too large. Please use a smaller image (under 4MB).");
        }
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Generation failed");
      }

      const data: ContentResult = await res.json();
      setResult(data);

      if (activeBrand?.id) {
        supabase.from("caption_history").insert({
          brand_id: activeBrand.id,
          caption: data.caption,
          topic,
          format,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const downloadDesign = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `design-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const resetAll = () => {
    setResult(null);
    setImageDataUrl(null);
    setAiPrompt("");
    setTopic("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">

      {/* ── Step 1: Visual Input ── */}
      <div className="bg-white border border-black/10 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-5">
          01 — Visual
        </p>

        {/* Mode toggle */}
        <div className="flex gap-px mb-6 border border-black/10 w-fit">
          {(["upload", "ai"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setPhotoMode(m);
                setImageDataUrl(null);
                setImageError(null);
              }}
              className={`text-sm px-5 py-2.5 transition-colors ${
                photoMode === m
                  ? "bg-black text-white"
                  : "text-black/50 hover:text-black bg-white"
              }`}
            >
              {m === "upload" ? "Upload Photo" : "AI Generate"}
            </button>
          ))}
        </div>

        {photoMode === "upload" ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            {imageDataUrl ? (
              <div className="flex items-start gap-6">
                <img
                  src={imageDataUrl}
                  alt="Selected"
                  className="w-40 h-40 object-cover border border-black/10 shrink-0"
                />
                <div className="flex flex-col gap-3 pt-1">
                  <p className="text-sm text-black/60">Photo selected</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-black/40 hover:text-black transition-colors border border-black/15 px-3 py-1.5 rounded-full hover:border-black/40 w-fit"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => setImageDataUrl(null)}
                    className="text-xs text-black/30 hover:text-black transition-colors w-fit"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-sm border-2 border-dashed border-black/15 hover:border-black/40 transition-colors py-10 flex flex-col items-center gap-3 text-black/35 hover:text-black"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-sm font-medium">Choose a photo</span>
                <span className="text-xs">JPG, PNG, WEBP</span>
              </button>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3 max-w-xl">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !generatingImage && generateImage()}
                placeholder="Describe the image — e.g. elegant linen dress on marble background, natural light"
                className="flex-1 border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors bg-white"
              />
              <button
                onClick={generateImage}
                disabled={!aiPrompt.trim() || generatingImage}
                className="shrink-0 bg-black text-white text-sm px-6 py-3 hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {generatingImage ? "Generating..." : "Generate"}
              </button>
            </div>

            {imageError && (
              <p className="text-xs text-red-500">{imageError}</p>
            )}

            {imageDataUrl && (
              <div className="flex items-start gap-6">
                <img
                  src={imageDataUrl}
                  alt="AI Generated"
                  className="w-40 h-40 object-cover border border-black/10 shrink-0"
                />
                <div className="flex flex-col gap-3 pt-1">
                  <p className="text-sm text-black/60">AI generated</p>
                  <button
                    onClick={generateImage}
                    disabled={generatingImage}
                    className="text-xs text-black/40 hover:text-black transition-colors border border-black/15 px-3 py-1.5 rounded-full hover:border-black/40 w-fit disabled:opacity-30"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => setImageDataUrl(null)}
                    className="text-xs text-black/30 hover:text-black transition-colors w-fit"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Step 2: Instructions ── */}
      <div className="bg-white border border-black/10 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-5">
          02 — Instructions
        </p>

        <div className="space-y-6 max-w-2xl">
          {activeBrand && (
            <div>
              <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
                Brand
              </label>
              <span className="inline-flex items-center gap-2 border border-black/15 px-3 py-2 text-sm text-black/70">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                {activeBrand.name}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
              What is this post about?{" "}
              <span className="text-black/60">*</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The new linen collection — effortless summer dressing for women who value quality over quantity"
              rows={3}
              className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors bg-white resize-none"
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

          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
              Tone
            </label>
            <div className="flex gap-2 flex-wrap">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                    tone === t
                      ? "bg-black text-white border-black"
                      : "border-black/15 text-black/60 hover:border-black/40 hover:text-black"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
              Caption Mode
            </label>
            <div className="flex gap-px border border-black/10 w-fit">
              <button
                onClick={() => setCaptionMode("marketing")}
                className={`text-sm px-5 py-2.5 transition-colors ${
                  captionMode === "marketing"
                    ? "bg-black text-white"
                    : "text-black/50 hover:text-black bg-white"
                }`}
              >
                📢 Marketing
              </button>
              <button
                onClick={() => setCaptionMode("storytelling")}
                className={`text-sm px-5 py-2.5 transition-colors ${
                  captionMode === "storytelling"
                    ? "bg-black text-white"
                    : "text-black/50 hover:text-black bg-white"
                }`}
              >
                💛 Storytelling
              </button>
            </div>
            <p className="text-xs text-black/30 mt-2">
              {captionMode === "marketing"
                ? "Persuasive, structured, benefit-driven — uses ADORAR™ framework with CTA"
                : "Narrative, first-person, scene-based — insight lands quietly, CTA is soft or absent"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Generate ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={generate}
          disabled={!topic.trim() || loading}
          className="bg-black text-white text-sm px-10 py-4 hover:bg-black/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium tracking-wide"
        >
          {loading
            ? "Generating..."
            : captionMode === "marketing"
            ? "Generate with ADORAR™"
            : "Generate Story Caption"}
        </button>
        {!imageDataUrl && (
          <p className="text-xs text-black/30">
            Add a photo to get a caption written for your exact visual.
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 py-4">
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
            {captionMode === "storytelling"
              ? imageDataUrl
                ? "Reading your image and writing the story..."
                : "Crafting your story caption..."
              : imageDataUrl
              ? "Analysing your visual and building ADORAR™ strategy..."
              : "Running ADORAR™ analysis..."}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Results ── */}
      {result && !loading && (
        <div className="space-y-6">

          {/* Design Preview + Caption side by side */}
          <div className="grid sm:grid-cols-2 gap-6 items-start">

            {/* Design Preview */}
            <div className="bg-white border border-black/10 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-4">
                Design Preview
              </p>
              {imageDataUrl && previewImg ? (
                <>
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      display: "block",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() =>
                        onOpenInDesigner?.({
                          imageDataUrl,
                          caption: result.caption,
                          slides: result.slides,
                        })
                      }
                      disabled={!onOpenInDesigner}
                      className="flex-1 min-w-0 text-xs bg-black text-white px-3 py-2.5 hover:bg-black/80 transition-colors disabled:opacity-40 text-center font-medium"
                    >
                      Open in Design Creator
                    </button>
                    <button
                      onClick={downloadDesign}
                      className="text-xs border border-black/15 px-3 py-2.5 hover:border-black/40 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </>
              ) : (
                <div className="aspect-square bg-zinc-50 border border-black/8 flex flex-col items-center justify-center gap-3 text-black/25">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-xs text-center px-6">
                    Upload or generate a photo to see your design
                  </p>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="bg-white border border-black/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/30">
                    Caption — {format}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    captionMode === "storytelling"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-black/8 text-black/50"
                  }`}>
                    {captionMode === "storytelling" ? "💛 Storytelling" : "📢 Marketing"}
                  </span>
                </div>
                <CopyButton text={result.caption} label="Copy Caption" />
              </div>
              <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line">
                {result.caption}
              </p>
              {result.cta && (
                <div className="mt-5 pt-4 border-t border-black/8">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-1.5">
                    CTA
                  </p>
                  <p className="text-sm font-medium text-black/80">
                    {result.cta}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Carousel Slides */}
          {result.slides && result.slides.length > 0 && (
            <div className="bg-white border border-black/10 p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-5">
                Carousel Slides
              </p>
              <div className="space-y-3">
                {result.slides.map((slide) => (
                  <div
                    key={slide.slideNumber}
                    className="border border-black/10 p-5 flex gap-5 items-start"
                  >
                    <span className="shrink-0 text-2xl font-semibold text-black/10 w-7 leading-none pt-0.5">
                      {slide.slideNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-black/35 mb-1">
                        {slide.slideNumber === 1
                          ? "Hook"
                          : slide.slideNumber === 5
                          ? "CTA"
                          : `Value ${slide.slideNumber - 1}`}
                      </p>
                      <p className="text-xs font-semibold text-black/55 mb-1.5">
                        {slide.heading}
                      </p>
                      <p className="text-sm text-black/80 leading-relaxed">
                        {slide.body}
                      </p>
                    </div>
                    <CopyButton
                      text={`${slide.heading}\n\n${slide.body}`}
                      label="Copy Slide"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADORAR Analysis / Story Architecture */}
          <div className="bg-white border border-black/10 p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-6">
              {captionMode === "storytelling" ? "Story Architecture" : "ADORAR™ Analysis"}
            </p>
            {captionMode === "storytelling" ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {STORY_LABELS.map(({ key, label }) => (
                  <div key={key} className="border-l-2 border-amber-200 pl-4">
                    <p className="text-xs text-black/40 uppercase tracking-wider mb-2">
                      {label}
                    </p>
                    <p className="text-sm text-black/70 leading-relaxed">
                      {result.adorar[key]}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {ADORAR_LABELS.map(({ key, letter, label }) => (
                  <div key={key} className="border-l-2 border-black/10 pl-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-semibold leading-none">
                        {letter}
                      </span>
                      <span className="text-xs text-black/40 uppercase tracking-wider">
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-black/70 leading-relaxed">
                      {result.adorar[key]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core + Emotional + Visual Direction */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-black/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-3">
                Core Message
              </p>
              <p className="text-sm font-medium text-black/80 leading-relaxed">
                {result.coreMessage}
              </p>
            </div>
            <div className="bg-black text-white p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">
                Emotional Message
              </p>
              <p className="text-sm text-white/80 leading-relaxed">
                {result.emotionalMessage}
              </p>
            </div>
            <div className="bg-white border border-black/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-3">
                Visual Direction
              </p>
              <p className="text-sm text-black/70 leading-relaxed">
                {result.visualDirection}
              </p>
            </div>
          </div>

          {/* Psychological Explanation */}
          <div className="bg-white border border-black/10 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-3">
              Psychological Explanation
            </p>
            <p className="text-sm text-black/60 leading-relaxed">
              {result.psychologicalExplanation}
            </p>
          </div>

          {/* Start over */}
          <div className="flex justify-end">
            <button
              onClick={resetAll}
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
