import { NextRequest, NextResponse } from "next/server";

// Map canvas format IDs to Ideogram aspect ratios (portrait/square/landscape).
// Background images are cover-scaled so an approximate AR is fine.
function aspectRatio(formatId: string): string {
  const portrait  = new Set(["ig-post", "ig-story", "tiktok"]);
  const landscape = new Set(["linkedin", "facebook", "yt-thumbnail"]);
  const square    = new Set(["ig-carousel", "yt-community"]);
  if (portrait.has(formatId))  return "ASPECT_2_3";
  if (landscape.has(formatId)) return "ASPECT_16_9";
  if (square.has(formatId))    return "ASPECT_1_1";
  return "ASPECT_1_1";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.IDEOGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "IDEOGRAM_API_KEY is not configured" }, { status: 500 });
  }

  let prompt: string;
  let formatId: string;
  try {
    ({ prompt, formatId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const aspect_ratio = aspectRatio(formatId ?? "ig-carousel");

  let ideogramData: { data?: Array<{ url: string }> };
  try {
    const res = await fetch("https://api.ideogram.ai/generate", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_request: {
          prompt: prompt.trim(),
          aspect_ratio,
          model: "V_2",
          magic_prompt_option: "AUTO",
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: `Ideogram error: ${body}` }, { status: res.status });
    }
    ideogramData = await res.json();
  } catch (e) {
    return NextResponse.json({ error: `Request failed: ${String(e)}` }, { status: 502 });
  }

  const imageUrl = ideogramData?.data?.[0]?.url;
  if (!imageUrl) {
    return NextResponse.json({ error: "No image in Ideogram response" }, { status: 500 });
  }

  // Proxy image through server so the canvas does not taint from cross-origin load
  let imgBuffer: ArrayBuffer;
  let contentType: string;
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
    imgBuffer  = await imgRes.arrayBuffer();
    contentType = imgRes.headers.get("content-type") ?? "image/png";
  } catch (e) {
    return NextResponse.json({ error: `Could not fetch generated image: ${String(e)}` }, { status: 502 });
  }

  const base64  = Buffer.from(imgBuffer).toString("base64");
  const dataUrl = `data:${contentType};base64,${base64}`;

  return NextResponse.json({ dataUrl });
}
