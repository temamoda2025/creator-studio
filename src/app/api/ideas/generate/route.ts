import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

function isVanessaStoykov(brandName: string, niche: string): boolean {
  return (
    brandName?.toLowerCase().includes("vanessa stoykov") ||
    niche?.toLowerCase() === "finance"
  );
}

const VANESSA_PROMPT = `Generate 5 high-quality, specific social media content ideas for Vanessa Stoykov — a bold, taboo-breaking finance educator who talks about the money conversations nobody else will have.

Her content pillars are the uncomfortable intersections of money and real life:
- Divorce and money (what actually happens to assets, who gets what, the mistakes people make)
- Inheritance planning (what couples never talk about but desperately need to)
- Prenuptial agreements (the stigma, the reality, why more people need them)
- Financial conversations in relationships (who controls the money, what happens when you don't talk about it, how couples fight about finances)
- Wealth during major life events (separation, death of a partner, blended families, second marriages)

Her tone is brave, direct, and taboo-breaking. She says the thing nobody else will say. She speaks to women in their 40s–60s who are navigating (or avoiding) these exact conversations. Her hooks are specific, confronting, and feel like a confession or a warning.

Return ONLY a raw JSON array — no markdown, no code fences, no preamble. Each item must match this exact shape:
[
  {
    "pillar": "Content pillar name (2–4 words, e.g. Divorce & Money, Inheritance Talk, Prenup Reality)",
    "format": "Carousel | Reel | Static Post | Story",
    "hook": "The exact hook line — brave, specific, scroll-stopping. In first or second person. Ready to post as-is.",
    "effort": "Low | Medium | High"
  }
]

Rules:
- Return exactly 5 ideas
- Hooks must be specific to her world — not generic finance tips. Example quality bar: "If your partner died tomorrow, do you know where every cent of your money is?" not "Tips for financial planning"
- Mix formats: include at least 1 Carousel, 1 Reel, 1 Static Post
- Mix effort: include at least 1 Low, 1 Medium, 1 High
- Each idea covers a different pillar from her list above
- Hooks are brave enough to make someone stop mid-scroll`;

const GENERIC_PROMPT = (niche: string, targetAudience: string, positioning: string) =>
  `Generate 5 high-quality, specific social media content ideas for a ${niche} brand.
${positioning ? `Brand Positioning: ${positioning}\n` : ""}Target Audience: ${targetAudience || "infer from niche"}

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

export async function POST(request: Request) {
  try {
    const { niche, targetAudience, positioning, brandName } = await request.json();

    if (!niche) {
      return Response.json({ error: "niche is required" }, { status: 400 });
    }

    const userMessage = isVanessaStoykov(brandName ?? "", niche)
      ? VANESSA_PROMPT
      : GENERIC_PROMPT(niche, targetAudience, positioning);

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
