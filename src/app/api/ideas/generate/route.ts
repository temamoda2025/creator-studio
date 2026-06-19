import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const { niche, targetAudience, positioning } = await request.json();

    if (!niche) {
      return Response.json({ error: "niche is required" }, { status: 400 });
    }

    const positioningLine = positioning
      ? `Brand Positioning: ${positioning}\n`
      : "";

    const userMessage = `Generate 5 high-quality, specific social media content ideas for a ${niche} brand.
${positioningLine}Target Audience: ${targetAudience || "infer from niche"}

Return ONLY a raw JSON array — no markdown, no code fences, no preamble. Each item must match this exact shape:
[
  {
    "pillar": "Content pillar name (2–4 words, e.g. Client Success, Brand Story, Expert Education)",
    "format": "Carousel | Reel | Static Post | Story",
    "hook": "The exact hook line — a specific, scroll-stopping sentence in first or second person, ready to use as-is",
    "effort": "Low | Medium | High"
  }
]

Rules:
- Return exactly 5 ideas
- Hooks must be deeply specific to the ${niche} world — not generic. Example quality bar: "The #1 money mistake I see high earners make" not "Tips for saving money"
- Mix formats: include at least 1 Carousel, 1 Reel, 1 Static Post
- Mix effort: include at least 1 Low, 1 Medium, 1 High
- Hooks written in first or second person
- Ideas should cover different content pillars (education, social proof, behind the scenes, inspiration, etc.)`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    if (!textBlock) throw new Error("No text response from Claude");

    let jsonText = textBlock.text.trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonText = fenceMatch[1].trim();

    const parsed = JSON.parse(jsonText);
    const ideas = Array.isArray(parsed) ? parsed : parsed.ideas ?? [];
    return Response.json(ideas);
  } catch (error) {
    console.error("Ideas generation error:", error);
    return Response.json({ error: "Failed to generate ideas" }, { status: 500 });
  }
}
