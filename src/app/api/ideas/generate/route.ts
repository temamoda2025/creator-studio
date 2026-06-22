import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

function isVanessaStoykov(brandName: string, niche: string): boolean {
  const n = niche?.toLowerCase() ?? "";
  return (
    brandName?.toLowerCase().includes("vanessa") ||
    n.includes("finance") ||
    n.includes("wealth") ||
    n.includes("money")
  );
}

function isAstra(brandName: string, niche: string): boolean {
  const n = niche?.toLowerCase() ?? "";
  return (
    brandName?.toLowerCase().includes("astra") ||
    n.includes("chauffeur") ||
    n.includes("limousine") ||
    n.includes("luxury transport") ||
    n.includes("wedding transport")
  );
}

function isTemaModa(brandName: string, niche: string): boolean {
  const n = niche?.toLowerCase() ?? "";
  return (
    brandName?.toLowerCase().includes("tema moda") ||
    n.includes("luxury fashion") ||
    n.includes("fashion")
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

const ASTRA_PROMPT = `Generate 5 high-quality, specific social media content ideas for Astra Chauffeur — a premium chauffeur and wedding transport brand that turns every journey into a moment worth remembering.

Content pillars:
- Weddings (the bride's arrival, the getaway car, behind-the-scenes at the venue, the nervous groom waiting, the dress in the back seat)
- Corporate transfers (the pre-meeting ritual, punctuality as a power move, the silent productivity of a chauffeured commute)
- Airport runs (the 4am pickup, travel day anxiety, the relief of someone else handling it)
- Special occasions (anniversaries, proposals in the car, school formals, milestone celebrations)
- The Astra standard (the detail in the vehicle preparation, the driver who remembers your name, the white-glove touch that competitors skip)

Tone: Quietly luxurious. Unhurried. The content never shouts — it simply shows. Let the reader imagine themselves there. Hooks feel like the beginning of a story, not a sales pitch.

Return ONLY a raw JSON array — no markdown, no code fences, no preamble. Each item must match this exact shape:
[
  {
    "pillar": "Content pillar name (2–4 words, e.g. Wedding Arrival, Airport Transfer, The Astra Detail)",
    "format": "Carousel | Reel | Static Post | Story",
    "hook": "The exact hook line — evocative, specific, scene-setting. In first or second person. Ready to post as-is.",
    "effort": "Low | Medium | High"
  }
]

Rules:
- Return exactly 5 ideas
- Hooks must paint a vivid scene — not generic luxury claims. Example quality bar: "I arrived at my wedding venue 3 minutes early. The dress was perfect. Nobody saw the chaos that almost wasn't." not "We provide luxury chauffeur services"
- Mix formats: include at least 1 Carousel, 1 Reel, 1 Static Post
- Mix effort: include at least 1 Low, 1 Medium, 1 High
- Each idea covers a different pillar
- Hooks feel like the first line of a story the reader wants to finish`;

const TEMA_MODA_PROMPT = `Generate 5 high-quality, specific social media content ideas for Tema Moda — a luxury fashion brand built on the belief that great style is an investment in who you are.

Content pillars:
- Wardrobe strategy (the capsule wardrobe, buying less and buying better, the cost-per-wear calculation, decluttering vs. curating)
- Brand heritage and craftsmanship (the story behind a fabric, the atelier process, what makes a garment worth its price, slow fashion vs. fast fashion)
- Customer styling stories (real women, real transformations, the outfit that changed how someone walked into a room)
- Style investment philosophy (why quality matters, the emotional cost of cheap fashion, the piece that outlasts trends)
- The Tema Moda world (behind the buying process, how pieces are selected, the curation story, founder perspective on style)

Tone: Elevated, considered, insider. The content speaks to women who understand that style is not about what you wear — it is about who you become when you wear it. Hooks feel like a truth the reader has always known but never heard said out loud.

Return ONLY a raw JSON array — no markdown, no code fences, no preamble. Each item must match this exact shape:
[
  {
    "pillar": "Content pillar name (2–4 words, e.g. Wardrobe Strategy, The Investment Piece, Style Philosophy)",
    "format": "Carousel | Reel | Static Post | Story",
    "hook": "The exact hook line — elegant, specific, speaks to a felt truth. In first or second person. Ready to post as-is.",
    "effort": "Low | Medium | High"
  }
]

Rules:
- Return exactly 5 ideas
- Hooks must feel like a revelation, not a promotion. Example quality bar: "The dress I bought for €40 cost me €400 in confidence over the years it fell apart." not "Shop our new collection"
- Mix formats: include at least 1 Carousel, 1 Reel, 1 Static Post
- Mix effort: include at least 1 Low, 1 Medium, 1 High
- Each idea covers a different pillar
- Hooks speak to the identity and values of the woman, not the product`;

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

const TOPIC_PROMPT = (
  topic: string,
  niche: string,
  targetAudience: string,
  positioning: string,
  vanessa: boolean,
  astra: boolean,
  temaModa: boolean,
) => {
  const voiceBlock = vanessa
    ? `Brand Voice: Vanessa Stoykov — bold, taboo-breaking finance educator. Brave, direct, confronting. Speaks to women in their 40s–60s navigating money and major life events.`
    : astra
    ? `Brand Voice: Astra Chauffeur — quietly luxurious, unhurried, scene-setting. Premium chauffeur and wedding transport. Hooks feel like the beginning of a story.`
    : temaModa
    ? `Brand Voice: Tema Moda — elevated, considered, insider. Luxury fashion. Speaks to women who understand style as identity. Hooks feel like a truth the reader has always known.`
    : `Brand: ${niche} brand.${positioning ? ` Positioning: ${positioning}.` : ""}${targetAudience ? ` Target Audience: ${targetAudience}.` : ""}`;

  return `Generate 5 high-quality, specific social media content ideas on the topic of "${topic}".

${voiceBlock}

Return ONLY a raw JSON array — no markdown, no code fences, no preamble. Each item must match this exact shape:
[
  {
    "pillar": "Content pillar name (2–4 words, specific to this topic)",
    "format": "Carousel | Reel | Static Post | Story",
    "hook": "The exact hook line — specific to "${topic}", scroll-stopping, in first or second person, ready to post as-is",
    "effort": "Low | Medium | High"
  }
]

Rules:
- Return exactly 5 ideas, all specifically about "${topic}"
- Every hook must directly reference or clearly relate to "${topic}" — no generic hooks
- Mix formats: include at least 1 Carousel, 1 Reel, 1 Static Post
- Mix effort: at least 1 Low, 1 Medium, 1 High
- Cover different angles on the topic: education, myth-busting, personal story, how-to, social proof`;
};

export async function POST(request: Request) {
  try {
    const { niche, targetAudience, positioning, brandName, topic } = await request.json();

    if (!niche) {
      return Response.json({ error: "niche is required" }, { status: 400 });
    }

    const vanessa  = isVanessaStoykov(brandName ?? "", niche);
    const astra    = !vanessa && isAstra(brandName ?? "", niche);
    const temaModa = !vanessa && !astra && isTemaModa(brandName ?? "", niche);

    const userMessage = topic
      ? TOPIC_PROMPT(topic, niche, targetAudience, positioning, vanessa, astra, temaModa)
      : vanessa
        ? VANESSA_PROMPT
        : astra
          ? ASTRA_PROMPT
          : temaModa
            ? TEMA_MODA_PROMPT
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
