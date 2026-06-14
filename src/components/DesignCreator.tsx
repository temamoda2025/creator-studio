"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBrands } from "@/context/BrandsContext";

// ─── Formats ─────────────────────────────────────────────────────────────────

interface Format {
  id: string;
  label: string;
  w: number;
  h: number;
}

const FORMATS: Format[] = [
  { id: "ig-post",      label: "Instagram Post (4:5)",           w: 1080, h: 1350 },
  { id: "ig-story",     label: "Instagram Story / Reel Cover",   w: 1080, h: 1920 },
  { id: "ig-carousel",  label: "Instagram Carousel Slide (1:1)", w: 1080, h: 1080 },
  { id: "tiktok",       label: "TikTok Video Cover (9:16)",      w: 1080, h: 1920 },
  { id: "linkedin",     label: "LinkedIn Post (1.91:1)",         w: 1200, h:  628 },
  { id: "facebook",     label: "Facebook Post (1.91:1)",         w: 1200, h:  628 },
  { id: "yt-thumbnail", label: "YouTube Thumbnail (16:9)",       w: 1280, h:  720 },
  { id: "yt-community", label: "YouTube Community Post (1:1)",   w: 1080, h: 1080 },
];

// ─── Background colour presets ────────────────────────────────────────────────

const BG_PRESETS = [
  { label: "Noir",        hex: "#1a1a1a" },
  { label: "Chalk",       hex: "#f5f5f3" },
  { label: "Cream",       hex: "#f0ebe3" },
  { label: "Forest",      hex: "#1b3a2d" },
  { label: "Blush",       hex: "#f0dcd6" },
  { label: "Navy",        hex: "#0f2b4a" },
  { label: "Slate",       hex: "#3d4a5c" },
  { label: "Terracotta",  hex: "#c4603c" },
];

// ─── Canvas helpers ───────────────────────────────────────────────────────────

const STACK = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

function setFont(
  ctx: CanvasRenderingContext2D,
  size: number,
  weight: 300 | 400 | 500 | 600 | 700,
  spacing = "0px"
) {
  ctx.font = `${weight} ${size}px ${STACK}`;
  try {
    (ctx as unknown as Record<string, unknown>).letterSpacing = spacing;
  } catch { /* browser may not support */ }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    if (!para.trim()) { lines.push(""); continue; }
    let cur = "";
    for (const word of para.split(" ")) {
      const test = cur ? `${cur} ${word}` : word;
      if (cur && ctx.measureText(test).width > maxW) {
        lines.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxH: number,
  maxSize: number,
  minSize: number,
  weight: 300 | 400 | 500 | 600 | 700,
  spacing: string,
  lhRatio: number
): { fontSize: number; lines: string[] } {
  for (let s = maxSize; s >= minSize; s -= 4) {
    setFont(ctx, s, weight, spacing);
    const lines = wrapText(ctx, text, maxW);
    if (lines.length * s * lhRatio <= maxH) return { fontSize: s, lines };
  }
  setFont(ctx, minSize, weight, spacing);
  return { fontSize: minSize, lines: wrapText(ctx, text, maxW) };
}

function hex2rgba(hex: string, a: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(0,0,0,${a})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function draw(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  bgColor: string,
  textColor: string,
  brandName: string,
  handle: string,
  caption: string
) {
  const isLandscape = W > H;
  const PAD = isLandscape ? Math.round(W * 0.055) : Math.round(W * 0.083);

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  if (isLandscape) {
    // ── Wide layout (LinkedIn / Facebook) ────────────────────────────────────

    // Left accent bar
    ctx.fillStyle = hex2rgba(textColor, 0.18);
    ctx.fillRect(PAD, PAD, 3, H - PAD * 2);

    // Brand name — top left
    setFont(ctx, 28, 300, "8px");
    ctx.fillStyle = hex2rgba(textColor, 0.45);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(brandName.toUpperCase(), PAD + 24, PAD);

    // Caption — vertically centered in remaining space
    const zX = PAD + 24;
    const zW = W - PAD * 2 - 24;
    const zTop = PAD + 60;
    const zH = H - PAD * 2 - 60;

    const { fontSize, lines } = fitText(ctx, caption, zW, zH, 88, 28, 600, "-1px", 1.25);
    setFont(ctx, fontSize, 600, "-1px");
    const lh = fontSize * 1.25;
    const totalH = Math.min(lines.length, 5) * lh;
    const startY = zTop + (zH - totalH) / 2;

    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    lines.slice(0, 5).forEach((line, i) => ctx.fillText(line, zX, startY + i * lh));

    // Handle — bottom right
    setFont(ctx, 24, 300, "4px");
    ctx.fillStyle = hex2rgba(textColor, 0.35);
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(handle.toUpperCase(), W - PAD, H - PAD);

  } else {
    // ── Portrait / square layout (Instagram, TikTok) ─────────────────────────

    // Top rule
    ctx.strokeStyle = hex2rgba(textColor, 0.18);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD, PAD);
    ctx.lineTo(W - PAD, PAD);
    ctx.stroke();

    // Brand name above rule
    setFont(ctx, 32, 300, "9px");
    ctx.fillStyle = hex2rgba(textColor, 0.45);
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(brandName.toUpperCase(), PAD, PAD - 14);

    // Caption — vertically centered
    const { fontSize, lines } = fitText(
      ctx, caption,
      W - PAD * 2, H - PAD * 4,
      80, 28, 500, "-0.5px", 1.3
    );
    setFont(ctx, fontSize, 500, "-0.5px");
    const lh = fontSize * 1.3;
    const startY = (H - lines.length * lh) / 2;

    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    lines.forEach((line, i) => ctx.fillText(line, PAD, startY + i * lh));

    // Bottom rule
    ctx.strokeStyle = hex2rgba(textColor, 0.18);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD, H - PAD);
    ctx.lineTo(W - PAD, H - PAD);
    ctx.stroke();

    // Handle below rule
    setFont(ctx, 26, 300, "5px");
    ctx.fillStyle = hex2rgba(textColor, 0.38);
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(handle.toUpperCase(), W - PAD, H - PAD + 14);
  }

  // Reset letterSpacing
  try {
    (ctx as unknown as Record<string, unknown>).letterSpacing = "0px";
  } catch { /* ignore */ }
}

// ─── Component ────────────────────────────────────────────────────────────────

const MAX_PREVIEW = 500;

export default function DesignCreator() {
  const { activeBrand } = useBrands();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formatId, setFormatId]     = useState(FORMATS[0].id);
  const [caption,  setCaption]      = useState("Paste your ADORAR™ generated caption here — or write a headline for your design.");
  const [bgColor,  setBgColor]      = useState(BG_PRESETS[0].hex);
  const [textColor, setTextColor]   = useState<"#ffffff" | "#000000">("#ffffff");

  const fmt = FORMATS.find((f) => f.id === formatId)!;
  const scale   = Math.min(MAX_PREVIEW / fmt.w, MAX_PREVIEW / fmt.h);
  const prevW   = Math.round(fmt.w * scale);
  const prevH   = Math.round(fmt.h * scale);

  const brandName = activeBrand?.name ?? "Your Brand";
  const handle    = activeBrand?.handle
    ? `@${activeBrand.handle}`
    : `@${brandName.toLowerCase().replace(/\s+/g, "")}`;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width  = fmt.w;
    canvas.height = fmt.h;
    draw(ctx, fmt.w, fmt.h, bgColor, textColor, brandName, handle, caption);
  }, [fmt, bgColor, textColor, brandName, handle, caption]);

  useEffect(() => { redraw(); }, [redraw]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${brandName.toLowerCase().replace(/\s+/g, "-")}-${formatId}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="space-y-6">

      {/* ── Controls card ── */}
      <div className="bg-white border border-black/10 p-8">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-base font-semibold">Design Creator</h2>
          {activeBrand && (
            <span className="text-xs border border-black/15 px-2.5 py-1 rounded-full text-black/50 shrink-0 ml-4">
              {activeBrand.name}
            </span>
          )}
        </div>
        <p className="text-sm text-black/40 mb-8 leading-relaxed">
          Create branded social graphics. Choose a format, paste your ADORAR™ caption or write a headline, pick a colour — then download at full resolution.
        </p>

        <div className="space-y-5 max-w-2xl">

          {/* Format */}
          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
              Format
            </label>
            <select
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
              className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white appearance-none"
            >
              {FORMATS.map(({ id, label, w, h }) => (
                <option key={id} value={id}>
                  {label} — {w}×{h}px
                </option>
              ))}
            </select>
          </div>

          {/* Background colour */}
          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
              Background Colour
            </label>
            <div className="flex gap-2 flex-wrap items-center">
              {BG_PRESETS.map(({ label, hex }) => (
                <button
                  key={hex}
                  title={label}
                  onClick={() => setBgColor(hex)}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-full border transition-colors ${
                    bgColor === hex
                      ? "border-black"
                      : "border-black/15 hover:border-black/40"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ background: hex }}
                  />
                  <span className="text-black/60">{label}</span>
                </button>
              ))}
              <label className="flex items-center gap-2 text-xs border border-black/15 px-3 py-2 rounded-full cursor-pointer hover:border-black/40 transition-colors">
                <span className="text-black/40">Custom</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-5 h-5 cursor-pointer bg-transparent border-0 p-0"
                />
              </label>
            </div>
          </div>

          {/* Text colour toggle */}
          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">
              Text Colour
            </label>
            <div className="flex gap-2">
              {(["#ffffff", "#000000"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setTextColor(c)}
                  className={`flex items-center gap-2 text-xs px-4 py-2 rounded-full border transition-colors ${
                    textColor === c
                      ? "border-black"
                      : "border-black/15 hover:border-black/40"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                    style={{ background: c }}
                  />
                  <span className="text-black/60">{c === "#ffffff" ? "White" : "Black"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Canvas + editor ── */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* Preview */}
        <div className="bg-white border border-black/10 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-5">Preview</p>
          <div className="flex justify-center items-center" style={{ minHeight: prevH }}>
            <canvas
              ref={canvasRef}
              style={{ width: prevW, height: prevH, display: "block" }}
            />
          </div>
          <p className="text-[11px] text-black/25 mt-4">
            {fmt.w} × {fmt.h}px — exports at full resolution
          </p>
        </div>

        {/* Caption + download */}
        <div className="space-y-4">
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-3">
              Caption / Headline
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={11}
              placeholder="Paste your ADORAR™ caption or write a headline…"
              className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white resize-none leading-relaxed"
            />
            <p className="text-[11px] text-black/25 mt-1.5">{caption.length} chars</p>
          </div>

          {!activeBrand && (
            <div className="bg-zinc-50 border border-black/10 p-4">
              <p className="text-xs text-black/50 leading-relaxed">
                No active brand — go to Brand Blueprint to create one. Your brand name and handle will appear on the design automatically.
              </p>
            </div>
          )}

          <button
            onClick={downloadPng}
            className="w-full bg-black text-white text-sm px-8 py-4 rounded-full hover:bg-black/80 transition-colors font-medium"
          >
            Download as PNG ↓
          </button>

          <p className="text-[11px] text-black/25 text-center">
            {fmt.w} × {fmt.h}px · ready to upload
          </p>
        </div>
      </div>
    </div>
  );
}
