"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBrands } from "@/context/BrandsContext";

// ─── Formats ──────────────────────────────────────────────────────────────────

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
  { label: "Noir",       hex: "#1a1a1a" },
  { label: "Chalk",      hex: "#f5f5f3" },
  { label: "Cream",      hex: "#f0ebe3" },
  { label: "Forest",     hex: "#1b3a2d" },
  { label: "Blush",      hex: "#f0dcd6" },
  { label: "Navy",       hex: "#0f2b4a" },
  { label: "Slate",      hex: "#3d4a5c" },
  { label: "Terracotta", hex: "#c4603c" },
];

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: "bold-headline", label: "Bold Headline",  desc: "Large bold text, centered" },
  { id: "minimal-quote", label: "Minimal Quote",  desc: "Thin weight, quote marks"  },
  { id: "split-layout",  label: "Split Layout",   desc: "Brand top, caption below"  },
  { id: "full-bleed",    label: "Full Bleed",     desc: "Gradient overlay at bottom" },
  { id: "text-only",     label: "Text Only",      desc: "Clean headline, no brand"  },
  { id: "branded-frame", label: "Branded Frame",  desc: "Corner frame with brand"   },
] as const;

type TemplateId = (typeof TEMPLATES)[number]["id"];

// ─── Fonts ────────────────────────────────────────────────────────────────────

const FONT_CATEGORIES = [
  {
    label: "Luxury",
    fonts: [
      { family: "Playfair Display",   label: "Playfair Display"   },
      { family: "Cormorant Garamond", label: "Cormorant Garamond" },
      { family: "Libre Baskerville",  label: "Libre Baskerville"  },
    ],
  },
  {
    label: "Modern",
    fonts: [
      { family: "Montserrat", label: "Montserrat" },
      { family: "Inter",      label: "Inter"      },
      { family: "Raleway",    label: "Raleway"    },
    ],
  },
  {
    label: "Bold",
    fonts: [
      { family: "Oswald",     label: "Oswald"     },
      { family: "Anton",      label: "Anton"      },
      { family: "Bebas Neue", label: "Bebas Neue" },
    ],
  },
  {
    label: "Elegant",
    fonts: [
      { family: "Lato",         label: "Lato"         },
      { family: "Josefin Sans", label: "Josefin Sans" },
      { family: "Nunito",       label: "Nunito"       },
    ],
  },
  {
    label: "Casual",
    fonts: [
      { family: "Poppins",    label: "Poppins"    },
      { family: "Quicksand",  label: "Quicksand"  },
      { family: "Pacifico",   label: "Pacifico"   },
    ],
  },
] as const;

type FontFamily = (typeof FONT_CATEGORIES)[number]["fonts"][number]["family"];

const DEFAULT_FONT: FontFamily = "Inter";

// Single request for all 15 fonts, sorted alphabetically as Google recommends
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  "family=Anton&" +
  "family=Bebas+Neue&" +
  "family=Cormorant+Garamond:wght@300;400;500;600;700&" +
  "family=Inter:wght@300;400;500;600;700&" +
  "family=Josefin+Sans:wght@300;400;500;600;700&" +
  "family=Lato:wght@300;400;700&" +
  "family=Libre+Baskerville:wght@400;700&" +
  "family=Montserrat:wght@300;400;500;600;700&" +
  "family=Nunito:wght@300;400;500;600;700&" +
  "family=Oswald:wght@300;400;500;600;700&" +
  "family=Pacifico&" +
  "family=Playfair+Display:wght@300;400;500;600;700&" +
  "family=Poppins:wght@300;400;500;600;700&" +
  "family=Quicksand:wght@300;400;500;600;700&" +
  "family=Raleway:wght@300;400;500;600;700&" +
  "display=swap";

// ─── Canvas helpers ───────────────────────────────────────────────────────────

// Module-level mutable: set once at the top of each draw() call, safe because
// canvas rendering is synchronous and single-threaded.
const FALLBACK = 'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
let _fontStack = FALLBACK;

function setFont(
  ctx: CanvasRenderingContext2D,
  size: number,
  weight: 300 | 400 | 500 | 600 | 700,
  spacing = "0px"
) {
  ctx.font = `${weight} ${size}px ${_fontStack}`;
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

// ─── Template draw functions ──────────────────────────────────────────────────

function drawBoldHeadline(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  textColor: string, brandName: string, caption: string
) {
  const PAD = Math.round(Math.min(W, H) * 0.08);
  const { fontSize, lines } = fitText(ctx, caption, W - PAD * 2, H - PAD * 2.5, 120, 28, 700, "-2px", 1.2);
  setFont(ctx, fontSize, 700, "-2px");
  const lh = fontSize * 1.2;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const startY = (H - lines.length * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lh));

  const brandSize = Math.max(14, Math.round(W * 0.026));
  setFont(ctx, brandSize, 300, "5px");
  ctx.fillStyle = hex2rgba(textColor, 0.35);
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(brandName.toUpperCase(), PAD, H - PAD);
}

function drawMinimalQuote(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  textColor: string, handle: string, caption: string
) {
  const PAD = Math.round(Math.min(W, H) * 0.1);

  const quoteSize = Math.round(W * 0.18);
  setFont(ctx, quoteSize, 300, "0px");
  ctx.fillStyle = hex2rgba(textColor, 0.1);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("“", PAD * 0.5, -PAD * 0.25);

  const { fontSize, lines } = fitText(
    ctx, caption, W - PAD * 2.5, H - PAD * 3.5, 68, 20, 300, "0.5px", 1.6
  );
  setFont(ctx, fontSize, 300, "0.5px");
  const lh = fontSize * 1.6;
  const startY = (H - lines.length * lh) / 2;
  ctx.fillStyle = textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, PAD * 1.5, startY + i * lh));

  const handleSize = Math.max(12, Math.round(W * 0.022));
  setFont(ctx, handleSize, 300, "4px");
  ctx.fillStyle = hex2rgba(textColor, 0.35);
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(handle.toUpperCase(), W - PAD, H - PAD);
}

function drawSplitLayout(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  textColor: string, brandName: string, handle: string, caption: string
) {
  const isLandscape = W > H;
  const PAD = Math.round(Math.min(W, H) * 0.07);

  if (isLandscape) {
    const splitX = Math.round(W * 0.38);
    ctx.strokeStyle = hex2rgba(textColor, 0.2);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(splitX, PAD);
    ctx.lineTo(splitX, H - PAD);
    ctx.stroke();

    const brandFontSize = Math.max(14, Math.round(H * 0.12));
    setFont(ctx, brandFontSize, 700, "-1px");
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(brandName.toUpperCase(), splitX / 2, H / 2 - Math.round(H * 0.07));

    const handleFontSize = Math.max(10, Math.round(H * 0.05));
    setFont(ctx, handleFontSize, 300, "4px");
    ctx.fillStyle = hex2rgba(textColor, 0.4);
    ctx.textBaseline = "middle";
    ctx.fillText(handle.toUpperCase(), splitX / 2, H / 2 + Math.round(H * 0.06));

    const cX = splitX + PAD;
    const cW = W - splitX - PAD * 1.5;
    const { fontSize, lines } = fitText(ctx, caption, cW, H - PAD * 2, 64, 18, 500, "-0.5px", 1.3);
    setFont(ctx, fontSize, 500, "-0.5px");
    const lh = fontSize * 1.3;
    const startY = (H - lines.length * lh) / 2;
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    lines.forEach((l, i) => ctx.fillText(l, cX, startY + i * lh));
  } else {
    const splitY = Math.round(H * 0.34);
    ctx.strokeStyle = hex2rgba(textColor, 0.2);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, splitY);
    ctx.lineTo(W - PAD, splitY);
    ctx.stroke();

    const brandFontSize = Math.max(14, Math.round(W * 0.09));
    setFont(ctx, brandFontSize, 700, "-1px");
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(brandName.toUpperCase(), PAD, splitY * 0.38);

    const handleFontSize = Math.max(10, Math.round(W * 0.038));
    setFont(ctx, handleFontSize, 300, "4px");
    ctx.fillStyle = hex2rgba(textColor, 0.4);
    ctx.textBaseline = "middle";
    ctx.fillText(handle.toUpperCase(), PAD, splitY * 0.65);

    const cY = splitY + PAD;
    const cH = H - splitY - PAD * 1.5;
    const { fontSize, lines } = fitText(ctx, caption, W - PAD * 2, cH, 72, 20, 500, "-0.5px", 1.3);
    setFont(ctx, fontSize, 500, "-0.5px");
    const lh = fontSize * 1.3;
    const startY = cY + (cH - lines.length * lh) / 2;
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    lines.forEach((l, i) => ctx.fillText(l, PAD, startY + i * lh));
  }
}

function drawFullBleed(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  textColor: string, brandName: string, handle: string, caption: string
) {
  const PAD = Math.round(Math.min(W, H) * 0.07);
  const bandH = Math.round(H * 0.48);

  const grad = ctx.createLinearGradient(0, H - bandH * 1.6, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.8)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, H - bandH * 1.6, W, bandH * 1.6);

  const brandSize = Math.max(12, Math.round(W * 0.028));
  setFont(ctx, brandSize, 300, "6px");
  ctx.fillStyle = hex2rgba(textColor, 0.7);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(brandName.toUpperCase(), PAD, PAD);

  const { fontSize, lines } = fitText(
    ctx, caption, W - PAD * 2, bandH * 0.72, 80, 20, 600, "-0.5px", 1.25
  );
  setFont(ctx, fontSize, 600, "-0.5px");
  const lh = fontSize * 1.25;
  const startY = H - PAD - lines.length * lh;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, PAD, startY + i * lh));

  const handleSize = Math.max(10, Math.round(W * 0.02));
  setFont(ctx, handleSize, 300, "4px");
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(handle.toUpperCase(), W - PAD, H - Math.round(PAD * 0.4));
}

function drawTextOnly(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  textColor: string, caption: string
) {
  const PAD = Math.round(Math.min(W, H) * 0.1);
  const { fontSize, lines } = fitText(ctx, caption, W - PAD * 2, H - PAD * 2, 100, 20, 500, "-0.5px", 1.3);
  setFont(ctx, fontSize, 500, "-0.5px");
  const lh = fontSize * 1.3;
  const startY = (H - lines.length * lh) / 2;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lh));
}

function drawBrandedFrame(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  textColor: string, brandName: string, handle: string, caption: string
) {
  const PAD = Math.round(Math.min(W, H) * 0.07);
  const inner = Math.round(PAD * 0.65);
  const cornerLen = Math.round(Math.min(W, H) * 0.05);

  ctx.strokeStyle = hex2rgba(textColor, 0.22);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(PAD, PAD, W - PAD * 2, H - PAD * 2);

  ctx.strokeStyle = hex2rgba(textColor, 0.75);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(PAD, PAD + cornerLen); ctx.lineTo(PAD, PAD); ctx.lineTo(PAD + cornerLen, PAD); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W - PAD - cornerLen, PAD); ctx.lineTo(W - PAD, PAD); ctx.lineTo(W - PAD, PAD + cornerLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(PAD, H - PAD - cornerLen); ctx.lineTo(PAD, H - PAD); ctx.lineTo(PAD + cornerLen, H - PAD); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W - PAD - cornerLen, H - PAD); ctx.lineTo(W - PAD, H - PAD); ctx.lineTo(W - PAD, H - PAD - cornerLen); ctx.stroke();

  const brandSize = Math.max(12, Math.round(W * 0.025));
  setFont(ctx, brandSize, 300, "6px");
  ctx.fillStyle = hex2rgba(textColor, 0.5);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(brandName.toUpperCase(), PAD + inner, PAD + inner);

  const inX = PAD + inner;
  const inY = PAD + inner + Math.round(W * 0.045);
  const inW = W - (PAD + inner) * 2;
  const inH = H - inY - (PAD + inner) - Math.round(W * 0.04);
  const { fontSize, lines } = fitText(ctx, caption, inW, inH, 80, 20, 500, "-0.5px", 1.3);
  setFont(ctx, fontSize, 500, "-0.5px");
  const lh = fontSize * 1.3;
  const startY = inY + (inH - lines.length * lh) / 2;
  ctx.fillStyle = textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, inX, startY + i * lh));

  const handleSize = Math.max(10, Math.round(W * 0.022));
  setFont(ctx, handleSize, 300, "4px");
  ctx.fillStyle = hex2rgba(textColor, 0.35);
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(handle.toUpperCase(), W - PAD - inner, H - PAD - inner);
}

// ─── Main draw orchestrator ───────────────────────────────────────────────────

interface DrawOptions {
  template: TemplateId;
  bgImage: HTMLImageElement | null;
  overlayOpacity: number;
  logo: HTMLImageElement | null;
  logoPosition: "top-left" | "top-right";
  fontFamily: string;
}

function draw(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  bgColor: string, textColor: string,
  brandName: string, handle: string, caption: string,
  opts: DrawOptions
) {
  const { template, bgImage, overlayOpacity, logo, logoPosition, fontFamily } = opts;
  const PAD = Math.round(Math.min(W, H) * 0.07);

  // Set font stack once for the entire draw call
  _fontStack = `"${fontFamily}", ${FALLBACK}`;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  if (bgImage) {
    const scale = Math.max(W / bgImage.naturalWidth, H / bgImage.naturalHeight);
    const sw = bgImage.naturalWidth * scale;
    const sh = bgImage.naturalHeight * scale;
    ctx.drawImage(bgImage, (W - sw) / 2, (H - sh) / 2, sw, sh);
    if (overlayOpacity > 0) {
      ctx.fillStyle = hex2rgba(bgColor, overlayOpacity);
      ctx.fillRect(0, 0, W, H);
    }
  }

  switch (template) {
    case "bold-headline":  drawBoldHeadline(ctx, W, H, textColor, brandName, caption); break;
    case "minimal-quote":  drawMinimalQuote(ctx, W, H, textColor, handle, caption); break;
    case "split-layout":   drawSplitLayout(ctx, W, H, textColor, brandName, handle, caption); break;
    case "full-bleed":     drawFullBleed(ctx, W, H, textColor, brandName, handle, caption); break;
    case "text-only":      drawTextOnly(ctx, W, H, textColor, caption); break;
    case "branded-frame":  drawBrandedFrame(ctx, W, H, textColor, brandName, handle, caption); break;
  }

  if (logo) {
    const maxLogoH = Math.round(H * 0.07);
    const ratio = logo.naturalWidth / logo.naturalHeight;
    const lh = Math.min(maxLogoH, logo.naturalHeight);
    const lw = lh * ratio;
    const x = logoPosition === "top-left" ? PAD : W - PAD - lw;
    ctx.drawImage(logo, x, PAD, lw, lh);
  }

  try {
    (ctx as unknown as Record<string, unknown>).letterSpacing = "0px";
  } catch { /* ignore */ }
}

// ─── Template thumbnail sub-component ────────────────────────────────────────

const THUMB_PX = 180;

function TemplateThumbnail({
  id, label, desc, isSelected, onClick, bgColor, textColor, fontFamily, fontsReady,
}: {
  id: TemplateId;
  label: string;
  desc: string;
  isSelected: boolean;
  onClick: () => void;
  bgColor: string;
  textColor: string;
  fontFamily: string;
  fontsReady: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const doRender = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = THUMB_PX;
      canvas.height = THUMB_PX;
      draw(ctx, THUMB_PX, THUMB_PX, bgColor, textColor, "BRAND", "@brand",
        "Preview headline text for layout", {
          template: id, bgImage: null, overlayOpacity: 0,
          logo: null, logoPosition: "top-right", fontFamily,
        });
    };
    document.fonts.load(`500 1em "${fontFamily}"`).then(doRender, doRender);
  }, [id, bgColor, textColor, fontFamily, fontsReady]);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col text-left border transition-all overflow-hidden ${
        isSelected ? "border-black" : "border-black/15 hover:border-black/40"
      }`}
    >
      <canvas ref={ref} style={{ width: 90, height: 90, display: "block" }} />
      <div className="px-2 py-2">
        <p className={`text-[11px] font-semibold leading-tight ${isSelected ? "text-black" : "text-black/70"}`}>
          {label}
        </p>
        <p className="text-[10px] text-black/35 mt-0.5 leading-tight">{desc}</p>
      </div>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const MAX_PREVIEW = 500;

export default function DesignCreator() {
  const { activeBrand } = useBrands();
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef   = useRef<HTMLInputElement>(null);

  const [formatId,       setFormatId]       = useState(FORMATS[0].id);
  const [caption,        setCaption]        = useState("Paste your ADORAR™ generated caption here — or write a headline for your design.");
  const [bgColor,        setBgColor]        = useState(BG_PRESETS[0].hex);
  const [textColor,      setTextColor]      = useState<"#ffffff" | "#000000">("#ffffff");
  const [templateId,     setTemplateId]     = useState<TemplateId>("bold-headline");
  const [fontFamily,     setFontFamily]     = useState<string>(DEFAULT_FONT);
  const [fontsReady,     setFontsReady]     = useState(false);

  // Logo
  const [logoImg,        setLogoImg]        = useState<HTMLImageElement | null>(null);
  const [logoDataUrl,    setLogoDataUrl]    = useState<string | null>(null);
  const [logoPosition,   setLogoPosition]   = useState<"top-left" | "top-right">("top-right");

  // Background image
  const [bgImg,          setBgImg]          = useState<HTMLImageElement | null>(null);
  const [bgImgThumb,     setBgImgThumb]     = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  // AI image generation
  const [bgMode,    setBgMode]    = useState<"upload" | "ai">("upload");
  const [aiPrompt,  setAiPrompt]  = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,   setAiError]   = useState<string | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const fmt      = FORMATS.find((f) => f.id === formatId)!;
  const scale    = Math.min(MAX_PREVIEW / fmt.w, MAX_PREVIEW / fmt.h);
  const prevW    = Math.round(fmt.w * scale);
  const prevH    = Math.round(fmt.h * scale);
  const brandName = activeBrand?.name ?? "Your Brand";
  // Strip any leading @ the user typed in Brand Blueprint to avoid @@
  const rawHandle = activeBrand?.handle
    ? activeBrand.handle.replace(/^@+/, "")
    : brandName.toLowerCase().replace(/\s+/g, "");
  const handle = `@${rawHandle}`;

  // ── Load all Google Fonts once on mount ──────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("gf-design-creator")) {
      // Already injected (e.g. hot-reload) — still wait for fonts
      document.fonts.ready.then(() => setFontsReady(true));
      return;
    }
    const link = document.createElement("link");
    link.id   = "gf-design-creator";
    link.rel  = "stylesheet";
    link.href = GOOGLE_FONTS_HREF;
    link.onload = () => document.fonts.ready.then(() => setFontsReady(true));
    document.head.appendChild(link);
  }, []);

  // ── Restore font per brand from localStorage ─────────────────────────────────
  useEffect(() => {
    if (!activeBrand) return;
    const saved = localStorage.getItem(`font-${activeBrand.id}`);
    if (saved) setFontFamily(saved);
    else setFontFamily(DEFAULT_FONT);
  }, [activeBrand]);

  // ── Restore logo per brand from localStorage ─────────────────────────────────
  useEffect(() => {
    if (!activeBrand) { setLogoImg(null); setLogoDataUrl(null); return; }
    const saved = localStorage.getItem(`logo-${activeBrand.id}`);
    if (saved) {
      const img = new Image();
      img.onload = () => { setLogoImg(img); setLogoDataUrl(saved); };
      img.src = saved;
    } else {
      setLogoImg(null);
      setLogoDataUrl(null);
    }
  }, [activeBrand]);

  // ── Event handlers ───────────────────────────────────────────────────────────
  const pickFont = (family: string) => {
    setFontFamily(family);
    if (activeBrand) {
      try { localStorage.setItem(`font-${activeBrand.id}`, family); } catch { /* quota */ }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setLogoImg(img);
        setLogoDataUrl(dataUrl);
        if (activeBrand) {
          try { localStorage.setItem(`logo-${activeBrand.id}`, dataUrl); } catch { /* quota */ }
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeLogo = () => {
    setLogoImg(null);
    setLogoDataUrl(null);
    if (activeBrand) localStorage.removeItem(`logo-${activeBrand.id}`);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => { setBgImg(img); setBgImgThumb(dataUrl); };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeBgImage = () => { setBgImg(null); setBgImgThumb(null); };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res  = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim(), formatId }),
      });
      const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      const img  = new Image();
      img.onload = () => { setBgImg(img); setBgImgThumb(json.dataUrl); };
      img.src    = json.dataUrl;
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Canvas rendering ─────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const doRender = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width  = fmt.w;
      canvas.height = fmt.h;
      draw(ctx, fmt.w, fmt.h, bgColor, textColor, brandName, handle, caption, {
        template: templateId, bgImage: bgImg, overlayOpacity,
        logo: logoImg, logoPosition, fontFamily,
      });
    };
    // Wait for the selected font before drawing; fall back if unavailable
    document.fonts.load(`500 1em "${fontFamily}"`).then(doRender, doRender);
  }, [fmt, bgColor, textColor, brandName, handle, caption, templateId,
      bgImg, overlayOpacity, logoImg, logoPosition, fontFamily, fontsReady]);

  useEffect(() => { redraw(); }, [redraw]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${brandName.toLowerCase().replace(/\s+/g, "-")}-${formatId}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Controls ── */}
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
          Create branded social graphics. Choose a template and format, paste your caption, pick a colour and font — then download at full resolution.
        </p>

        <div className="space-y-6 max-w-2xl">

          {/* Format */}
          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">Format</label>
            <select
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
              className="w-full border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white appearance-none"
            >
              {FORMATS.map(({ id, label, w, h }) => (
                <option key={id} value={id}>{label} — {w}×{h}px</option>
              ))}
            </select>
          </div>

          {/* Background colour */}
          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">Background Colour</label>
            <div className="flex gap-2 flex-wrap items-center">
              {BG_PRESETS.map(({ label, hex }) => (
                <button
                  key={hex}
                  title={label}
                  onClick={() => setBgColor(hex)}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-full border transition-colors ${
                    bgColor === hex ? "border-black" : "border-black/15 hover:border-black/40"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ background: hex }} />
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

          {/* Text colour */}
          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">Text Colour</label>
            <div className="flex gap-2">
              {(["#ffffff", "#000000"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setTextColor(c)}
                  className={`flex items-center gap-2 text-xs px-4 py-2 rounded-full border transition-colors ${
                    textColor === c ? "border-black" : "border-black/15 hover:border-black/40"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-black/15 shrink-0" style={{ background: c }} />
                  <span className="text-black/60">{c === "#ffffff" ? "White" : "Black"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font picker */}
          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-3">Font</label>
            <div className="space-y-4">
              {FONT_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-[10px] text-black/25 uppercase tracking-[0.15em] mb-2">{cat.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.fonts.map((f) => (
                      <button
                        key={f.family}
                        onClick={() => pickFont(f.family)}
                        style={{ fontFamily: `"${f.family}", serif` }}
                        className={`text-sm px-3 py-1.5 border transition-colors ${
                          fontFamily === f.family
                            ? "border-black bg-black text-white"
                            : "border-black/15 text-black/70 hover:border-black/40"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logo upload */}
          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">Logo</label>
            {logoDataUrl ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-12 border border-black/10 flex items-center justify-center p-2 shrink-0" style={{ background: bgColor }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoDataUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {(["top-left", "top-right"] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setLogoPosition(pos)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          logoPosition === pos ? "border-black text-black" : "border-black/15 text-black/50 hover:border-black/40"
                        }`}
                      >
                        {pos === "top-left" ? "Top Left" : "Top Right"}
                      </button>
                    ))}
                  </div>
                  <button onClick={removeLogo} className="text-xs text-black/35 hover:text-black/70 transition-colors text-left">
                    Remove logo ×
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="text-xs border border-dashed border-black/20 px-5 py-3 hover:border-black/40 transition-colors text-black/45"
              >
                Upload PNG or SVG logo ↑
              </button>
            )}
            <input ref={logoInputRef} type="file" accept=".png,.svg,image/png,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
            {activeBrand && !logoDataUrl && (
              <p className="text-[11px] text-black/30 mt-1.5">Saved per brand in your browser.</p>
            )}
          </div>

          {/* Background image */}
          <div>
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-2">Background Image</label>

            <div className="flex gap-2 mb-3">
              {(["upload", "ai"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setBgMode(mode); setAiError(null); }}
                  className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${
                    bgMode === mode ? "border-black text-black" : "border-black/15 text-black/45 hover:border-black/35"
                  }`}
                >
                  {mode === "upload" ? "Upload Photo" : "AI Generate"}
                </button>
              ))}
            </div>

            {bgMode === "upload" && !bgImgThumb && (
              <button
                onClick={() => bgInputRef.current?.click()}
                className="text-xs border border-dashed border-black/20 px-5 py-3 hover:border-black/40 transition-colors text-black/45"
              >
                Upload background photo ↑
              </button>
            )}

            {bgMode === "ai" && !bgImgThumb && (
              <div className="space-y-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiGenerate(); } }}
                  rows={2}
                  placeholder="Describe the image — e.g. soft Italian linen draped over a marble surface, natural light, minimal…"
                  className="w-full border border-black/15 px-4 py-3 text-sm placeholder:text-black/25 focus:outline-none focus:border-black/40 transition-colors rounded-none bg-white resize-none leading-relaxed"
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={!aiPrompt.trim() || aiLoading}
                  className="text-xs bg-black text-white px-5 py-2.5 rounded-full hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {aiLoading ? "Generating…" : "Generate with AI ↗"}
                </button>
                {aiError && <p className="text-[11px] text-red-500 leading-snug">{aiError}</p>}
              </div>
            )}

            {bgImgThumb && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 border border-black/10 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bgImgThumb} alt="Background" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] text-black/50">{bgMode === "ai" ? "AI generated" : "Uploaded photo"}</p>
                    <button onClick={removeBgImage} className="text-[11px] text-black/35 hover:text-black/70 transition-colors text-left">
                      Remove ×
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-black/40 shrink-0">Overlay</span>
                  <input
                    type="range" min={0} max={80} step={5}
                    value={Math.round(overlayOpacity * 100)}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                    className="flex-1 accent-black cursor-pointer"
                  />
                  <span className="text-[11px] text-black/35 w-8 text-right shrink-0">
                    {Math.round(overlayOpacity * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-black/30">
                  Overlay tints the photo with your background colour so text stays readable.
                </p>
              </div>
            )}

            <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
          </div>

        </div>
      </div>

      {/* ── Template gallery ── */}
      <div className="bg-white border border-black/10 p-6">
        <p className="text-xs text-black/40 uppercase tracking-wider mb-4">Templates</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {TEMPLATES.map((t) => (
            <TemplateThumbnail
              key={t.id}
              id={t.id}
              label={t.label}
              desc={t.desc}
              isSelected={templateId === t.id}
              onClick={() => setTemplateId(t.id)}
              bgColor={bgColor}
              textColor={textColor}
              fontFamily={fontFamily}
              fontsReady={fontsReady}
            />
          ))}
        </div>
      </div>

      {/* ── Canvas + editor ── */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* Preview */}
        <div className="bg-white border border-black/10 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-black/30 mb-5">Preview</p>
          <div className="flex justify-center items-center" style={{ minHeight: prevH }}>
            <canvas ref={canvasRef} style={{ width: prevW, height: prevH, display: "block" }} />
          </div>
          <p className="text-[11px] text-black/25 mt-4">{fmt.w} × {fmt.h}px — exports at full resolution</p>
        </div>

        {/* Caption + download */}
        <div className="space-y-4">
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs text-black/40 uppercase tracking-wider mb-3">Caption / Headline</label>
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
