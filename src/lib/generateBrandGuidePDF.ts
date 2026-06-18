import { jsPDF } from "jspdf";
import type { Brand } from "@/types/brand";
import type { BrandKit } from "./brandKit";

interface BlueprintData {
  positioning?: string;
  mission?: string;
  vision?: string;
  brandVoice?: {
    traits?: Array<{ trait: string; opposite: string; intensity: number }>;
    captionExample?: string;
  };
  contentPillars?: Array<{
    id: string;
    name: string;
    description: string;
    formats: string[];
    frequency: string;
  }>;
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function blend(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] * (1 - t) + b[0] * t),
    Math.round(a[1] * (1 - t) + b[1] * t),
    Math.round(a[2] * (1 - t) + b[2] * t),
  ];
}

function luminance(r: number, g: number, b: number): number {
  const s = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
}

function isLight(rgb: [number, number, number]): boolean {
  return luminance(rgb[0], rgb[1], rgb[2]) > 0.35;
}

export function generateBrandGuidePDF(
  brand: Brand,
  kit: BrandKit,
  blueprint: BlueprintData | null
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 22;
  const CW = W - M * 2;

  const pri = hexToRgb(kit.primaryColour);
  const sec = hexToRgb(kit.secondaryColour);
  const acc = hexToRgb(kit.accentColour);

  const muteSecondary = blend(pri, sec, 0.35);
  const dimSecondary = blend(pri, sec, 0.18);

  function footer(doc: jsPDF, brandName: string, pageLabel: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 200);
    doc.text(brandName.toUpperCase(), M, H - M + 6);
    doc.text(pageLabel, W - M, H - M + 6, { align: "right" });
  }

  // ── Page 1: Cover ──────────────────────────────────────────────────────────
  doc.setFillColor(...pri);
  doc.rect(0, 0, W, H, "F");

  // Thin accent bar at top
  doc.setFillColor(...acc);
  doc.rect(0, 0, W, 1.5, "F");

  // Logo
  const logoIsRaster =
    kit.logo &&
    !kit.logo.startsWith("data:image/svg+xml") &&
    !kit.logo.startsWith("data:image/svg");
  if (logoIsRaster && kit.logo) {
    try {
      doc.addImage(kit.logo, M, M + 8, 0, 18);
    } catch {
      // logo omitted if format unrecognised
    }
  }

  // "Brand Guide" label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...dimSecondary);
  doc.text("BRAND GUIDE", M, 120);

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(44);
  doc.setTextColor(...sec);
  const nameLines = doc.splitTextToSize(brand.name.toUpperCase(), CW);
  doc.text(nameLines, M, 134);

  // Positioning tagline
  const tagline =
    blueprint?.positioning || brand.positioning || brand.niche || "";
  if (tagline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...muteSecondary);
    const taglineY = 134 + nameLines.length * 18 + 2;
    const taglineLines = doc.splitTextToSize(tagline, CW);
    doc.text(taglineLines.slice(0, 3), M, taglineY);
  }

  // Social handle on cover
  const coverHandle = kit.handle || brand.handle || "";
  if (coverHandle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dimSecondary);
    doc.text(
      `@${coverHandle.replace(/^@+/, "")}`,
      M,
      H - M - 12
    );
  }

  // Bottom accent line
  doc.setFillColor(...acc);
  doc.rect(0, H - 1.5, W, 1.5, "F");

  // Year
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...dimSecondary);
  doc.text(String(new Date().getFullYear()), W - M, H - M + 6, {
    align: "right",
  });

  // ── Page 2: Brand Colours ─────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(190, 190, 190);
  doc.text("02", M, M + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 15, 15);
  doc.text("Brand Colours", M, M + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Your brand palette defines every visual touchpoint.",
    M,
    M + 24
  );
  doc.setDrawColor(225, 225, 225);
  doc.line(M, M + 30, W - M, M + 30);

  const swatches = [
    {
      label: "Primary",
      role: "Main background & dominant colour",
      hex: kit.primaryColour,
      rgb: pri,
    },
    {
      label: "Secondary",
      role: "Text & foreground elements",
      hex: kit.secondaryColour,
      rgb: sec,
    },
    {
      label: "Accent",
      role: "Highlights & calls to action",
      hex: kit.accentColour,
      rgb: acc,
    },
  ];

  const swY = M + 42;
  const swW = 52;
  const swH = 55;
  const swGap = 7;

  swatches.forEach(({ label, role, hex, rgb }, i) => {
    const x = M + i * (swW + swGap);
    doc.setFillColor(...rgb);
    doc.setDrawColor(210, 210, 210);
    doc.rect(x, swY, swW, swH, "FD");

    // Hex code on swatch
    const swText: [number, number, number] = isLight(rgb)
      ? [30, 30, 30]
      : [240, 240, 240];
    doc.setTextColor(...swText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(hex.toUpperCase(), x + 4, swY + swH - 4);

    doc.setTextColor(15, 15, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, x, swY + swH + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    const roleLines = doc.splitTextToSize(role, swW);
    doc.text(roleLines, x, swY + swH + 16);
  });

  // Combination preview strip
  const prevY = swY + swH + 48;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 180, 180);
  doc.text("PALETTE PREVIEW", M, prevY);
  doc.setDrawColor(225, 225, 225);
  doc.line(M, prevY + 3, W - M, prevY + 3);

  const circY = prevY + 18;
  swatches.forEach(({ hex, rgb }, i) => {
    const cx = M + 7 + i * 24;
    doc.setFillColor(...rgb);
    doc.setDrawColor(210, 210, 210);
    doc.circle(cx, circY, 7, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(hex.toUpperCase(), cx, circY + 11, { align: "center" });
  });

  // Sample buttons
  const btnY = circY + 20;
  doc.setFillColor(...pri);
  doc.rect(M, btnY, 48, 9, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...sec);
  doc.text("Primary button", M + 24, btnY + 5.8, { align: "center" });

  doc.setFillColor(...acc);
  doc.rect(M + 54, btnY, 48, 9, "F");
  const accText: [number, number, number] = isLight(acc) ? [20, 20, 20] : [255, 255, 255];
  doc.setTextColor(...accText);
  doc.text("Accent button", M + 78, btnY + 5.8, { align: "center" });

  footer(doc, brand.name, "2");

  // ── Page 3: Typography ────────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(190, 190, 190);
  doc.text("03", M, M + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 15, 15);
  doc.text("Typography", M, M + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Consistent type creates a recognisable brand voice across every medium.",
    M,
    M + 24
  );
  doc.setDrawColor(225, 225, 225);
  doc.line(M, M + 30, W - M, M + 30);

  let typY = M + 46;

  // Heading font block
  doc.setFillColor(248, 248, 248);
  doc.rect(M, typY, CW, 52, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 160);
  doc.text("HEADING FONT", M + 6, typY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(15, 15, 15);
  doc.text(kit.headingFont, M + 6, typY + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("Used for titles, headlines, and brand name overlays", M + 6, typY + 33);

  doc.setDrawColor(230, 230, 230);
  doc.line(M + 6, typY + 38, M + CW - 6, typY + 38);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text(brand.name, M + 6, typY + 48);

  typY += 62;

  // Body font block
  doc.setFillColor(248, 248, 248);
  doc.rect(M, typY, CW, 52, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 160);
  doc.text("BODY FONT", M + 6, typY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(15, 15, 15);
  doc.text(kit.bodyFont, M + 6, typY + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("Used for captions, handles, and supporting copy", M + 6, typY + 33);

  doc.setDrawColor(230, 230, 230);
  doc.line(M + 6, typY + 38, M + CW - 6, typY + 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "The quick brown fox jumps over the lazy dog.",
    M + 6,
    typY + 48
  );

  typY += 68;

  // Type scale table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 15, 15);
  doc.text("Type Scale", M, typY);
  doc.setDrawColor(220, 220, 220);
  doc.line(M, typY + 4, W - M, typY + 4);

  const typeScale = [
    { role: "Display", spec: `${kit.headingFont} · 48–72pt · Bold` },
    { role: "Heading", spec: `${kit.headingFont} · 24–36pt · Semibold` },
    { role: "Subheading", spec: `${kit.headingFont} · 18–22pt · Medium` },
    { role: "Body", spec: `${kit.bodyFont} · 12–14pt · Regular` },
    { role: "Caption / Label", spec: `${kit.bodyFont} · 9–11pt · Light` },
  ];

  typeScale.forEach(({ role, spec }, i) => {
    const rowY = typY + 12 + i * 11;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(role, M, rowY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(spec, M + 40, rowY);
    if (i < typeScale.length - 1) {
      doc.setDrawColor(240, 240, 240);
      doc.line(M, rowY + 4, W - M, rowY + 4);
    }
  });

  footer(doc, brand.name, "3");

  // ── Page 4: Brand Voice ───────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(190, 190, 190);
  doc.text("04", M, M + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 15, 15);
  doc.text("Brand Voice", M, M + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "The north star for every caption, visual, and collaboration.",
    M,
    M + 24
  );
  doc.setDrawColor(225, 225, 225);
  doc.line(M, M + 30, W - M, M + 30);

  let voiceY = M + 44;

  // Mission / Vision / Positioning
  const mission = blueprint?.mission || brand.mission || "";
  const vision = blueprint?.vision || brand.vision || "";
  const positioning = blueprint?.positioning || brand.positioning || "";
  const mvpItems = [
    { label: "Mission", text: mission },
    { label: "Vision", text: vision },
    { label: "Positioning", text: positioning },
  ].filter((x) => x.text);

  if (mvpItems.length > 0) {
    const colW = (CW - (mvpItems.length - 1) * 8) / mvpItems.length;
    mvpItems.forEach(({ label, text }, i) => {
      const cx = M + i * (colW + 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text(label.toUpperCase(), cx, voiceY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(55, 55, 55);
      const lines = doc.splitTextToSize(text, colW);
      doc.text(lines.slice(0, 7), cx, voiceY + 7);
    });
    voiceY += 58;
    doc.setDrawColor(235, 235, 235);
    doc.line(M, voiceY - 4, W - M, voiceY - 4);
  }

  // Tone of voice
  const toneTraits =
    blueprint?.brandVoice?.traits ||
    (brand.brandVoice?.traits as
      | Array<{ trait: string; opposite: string; intensity: number }>
      | undefined) ||
    [];

  if (toneTraits.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 15, 15);
    doc.text("Tone of Voice", M, voiceY);
    voiceY += 8;

    toneTraits.slice(0, 5).forEach(({ trait, opposite, intensity }) => {
      const barW = 65;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(25, 25, 25);
      doc.text(trait, M, voiceY + 3.5);

      doc.setFillColor(230, 230, 230);
      doc.rect(M + 42, voiceY, barW, 4, "F");
      doc.setFillColor(15, 15, 15);
      doc.rect(M + 42, voiceY, barW * Math.min(intensity, 1), 4, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`not ${opposite}`, M + 42 + barW + 4, voiceY + 3.5);

      voiceY += 10;
    });
    voiceY += 5;
  }

  // Caption example
  const captionExample = blueprint?.brandVoice?.captionExample;
  if (captionExample) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 15, 15);
    doc.text("Caption Example", M, voiceY);
    voiceY += 5;
    doc.setFillColor(250, 250, 250);
    doc.rect(M, voiceY, CW, 32, "F");
    doc.setDrawColor(230, 230, 230);
    doc.rect(M, voiceY, CW, 32, "D");

    doc.setFillColor(...acc);
    doc.rect(M, voiceY, 2, 32, "F");

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(75, 75, 75);
    const captionLines = doc.splitTextToSize(
      `“${captionExample}”`,
      CW - 14
    );
    doc.text(captionLines.slice(0, 5), M + 8, voiceY + 8);
    voiceY += 40;
  }

  footer(doc, brand.name, "4");

  // ── Page 5: Content Pillars & Social ──────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(190, 190, 190);
  doc.text("05", M, M + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 15, 15);
  doc.text("Content & Social", M, M + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("What you post and where you show up.", M, M + 24);
  doc.setDrawColor(225, 225, 225);
  doc.line(M, M + 30, W - M, M + 30);

  let p5Y = M + 42;

  // Content pillars
  const pillars = blueprint?.contentPillars || [];
  if (pillars.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 15, 15);
    doc.text("Content Pillars", M, p5Y);
    p5Y += 7;

    pillars.forEach(({ id, name, description, formats, frequency }) => {
      if (p5Y > 245) {
        doc.addPage();
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, W, H, "F");
        p5Y = M + 10;
      }

      doc.setFillColor(248, 248, 248);
      doc.rect(M, p5Y, CW, 28, "F");
      doc.setFillColor(...acc);
      doc.rect(M, p5Y, 2, 28, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(180, 180, 180);
      doc.text(String(id), M + 6, p5Y + 7);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 15, 15);
      doc.text(name, M + 6, p5Y + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      const descLines = doc.splitTextToSize(description, CW - 55);
      doc.text(descLines[0], M + 6, p5Y + 21);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text(frequency, W - M - 4, p5Y + 10, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      doc.text(formats.join(" · "), W - M - 4, p5Y + 18, { align: "right" });

      p5Y += 32;
    });

    p5Y += 6;
    doc.setDrawColor(235, 235, 235);
    doc.line(M, p5Y - 3, W - M, p5Y - 3);
  }

  // Social media handle + platforms
  const handle = kit.handle || brand.handle || "";
  if (handle) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(180, 180, 180);
    doc.text("HANDLE", M, p5Y + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(15, 15, 15);
    doc.text(`@${handle.replace(/^@+/, "")}`, M, p5Y + 20);
    p5Y += 32;
  }

  if (brand.platforms && brand.platforms.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(180, 180, 180);
    doc.text("PLATFORMS", M, p5Y + 6);
    p5Y += 10;

    brand.platforms.forEach((platform) => {
      doc.setFillColor(248, 248, 248);
      doc.rect(M, p5Y + 2, 58, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(25, 25, 25);
      doc.text(
        platform.charAt(0).toUpperCase() + platform.slice(1),
        M + 6,
        p5Y + 9
      );
      p5Y += 14;
    });
    p5Y += 4;
  }

  // Closing brand block
  if (p5Y < H - 70) {
    const closingY = H - 60;
    doc.setFillColor(...pri);
    doc.rect(M, closingY, CW, 35, "F");
    doc.setFillColor(...acc);
    doc.rect(M, closingY, 2, 35, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...sec);
    doc.text(brand.name, M + 8, closingY + 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...muteSecondary);
    doc.text(brand.niche || "", M + 8, closingY + 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...dimSecondary);
    doc.text("Brand Guide · Creator Studio", M + 8, closingY + 30);
  }

  footer(doc, brand.name, "5");

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `${brand.name.replace(/[^a-z0-9\s]/gi, "").trim().replace(/\s+/g, "-")}-Brand-Guide.pdf`;
  doc.save(filename);
}
