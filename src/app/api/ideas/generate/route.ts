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
    n.includes("wedding transport") ||
    n.includes("travel")
  );
}

function isNatasha(brandName: string, niche: string): boolean {
  const n = niche?.toLowerCase() ?? "";
  return (
    brandName?.toLowerCase().includes("natasha") ||
    n.includes("personal styling") ||
    n.includes("styling")
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

const NATASHA_PROMPT = `Generate 5 high-quality, specific social media content ideas for Natasha Tszyu — a personal stylist and luxury fashion editor who helps women look and feel extraordinary in their everyday life.

Content pillars:
- Wardrobe transformations (the before and after, what changes when you dress intentionally, the woman who finally feels like herself)
- Styling tips by body type and occasion (what actually works, the rules stylists live by, the mistakes most women make)
- Luxury fashion edits (how to shop smart at the high end, the investment pieces worth every dollar, seasonal edits curated by Natasha)
- Behind the scenes of a styling session (the process, the client reveal moment, the decisions that happen in the fitting room)
- Client success stories (the wedding guest who stopped apologising for her body, the executive who finally owns the room, the woman who stopped hiding)

Tone: Warm but elevated. Encouraging without being soft. She is the brilliant friend who happens to know everything about style — she tells you the truth, then shows you how to fix it. Hooks feel personal, like she is talking directly to one woman.

Return ONLY a raw JSON array — no markdown, no code fences, no preamble. Each item must match this exact shape:
[
  {
    "pillar": "Content pillar name (2–4 words, e.g. Wardrobe Transformation, Styling Session, Investment Edit)",
    "format": "Carousel | Reel | Static Post | Story",
    "hook": "The exact hook line — warm, specific, feels like it was written for one woman. In first or second person. Ready to post as-is.",
    "effort": "Low | Medium | High"
  }
]

Rules:
- Return exactly 5 ideas
- Hooks must be specific and personal — not generic fashion tips. Example quality bar: "She cried in the fitting room. Not because nothing fit — because something finally did." not "Style tips for every body type"
- Mix formats: include at least 1 Carousel, 1 Reel, 1 Static Post
- Mix effort: include at least 1 Low, 1 Medium, 1 High
- Each idea covers a different pillar
- Hooks make the reader feel seen, not sold to`;

interface BrandVoiceTrait { trait: string; opposite: string; intensity: number; }
interface BrandVoicePayload {
  traits?: BrandVoiceTrait[];
  toneDescription?: string;
  captionExample?: string;
}

function buildBrandPrompt(
  brandName: string,
  niche: string,
  targetAudience: string,
  positioning: string | null,
  mission: string | null,
  vision: string | null,
  brandVoice: BrandVoicePayload | null,
): string {
  // Resolve dominant side of each voice trait slider
  const traitsLine = brandVoice?.traits?.length
    ? brandVoice.traits
        .map(t =>
          t.intensity >= 0.65 ? t.trait
          : t.intensity <= 0.35 ? t.opposite
          : `${t.trait}/${t.opposite}`
        )
        .join(", ")
    : null;

  const context = [
    mission     ? `**Mission:** ${mission}`         : null,
    vision      ? `**Vision:** ${vision}`            : null,
    positioning ? `**Positioning:** ${positioning}`  : null,
    targetAudience ? `**Target Audience:** ${targetAudience}` : null,
  ].filter(Boolean).join("\n");

  const voice = [
    brandVoice?.toneDescription ? `**Tone:** ${brandVoice.toneDescription}` : null,
    traitsLine ? `**Voice traits:** ${traitsLine}` : null,
    brandVoice?.captionExample
      ? `**Caption example — study this voice carefully and match it exactly:**\n"${brandVoice.captionExample}"`
      : null,
  ].filter(Boolean).join("\n");

  return `Generate 5 high-quality, specific social media content ideas for ${brandName} — a ${niche} brand.

${context}
${voice ? `\n## Brand Voice\n${voice}` : ""}

## Your Task

Generate 5 content ideas that could ONLY have been written for ${brandName}. Not templates — the hooks must feel like they came from inside this brand, from someone who has lived in this world for years.

Quality bar:
- Specific scenarios, not general topics ("The client who almost cancelled because she didn't own one piece that fit" beats "wardrobe tips")
- Real texture: include numbers, timeframes, emotions, turning points wherever authentic
- Hooks in first or second person that land like a confession, a challenge, or a revelation
- Never generic — if a hook could apply to any ${niche} brand, it is not good enough

Return ONLY a raw JSON array — no markdown, no code fences, no preamble. Each item must match this exact shape:
[
  {
    "pillar": "Content pillar name (2–4 words, specific to ${brandName}'s world)",
    "format": "Carousel | Reel | Static Post | Story",
    "hook": "The exact hook line — specific, scroll-stopping, in first or second person, ready to post as-is",
    "effort": "Low | Medium | High"
  }
]

Rules:
- Return exactly 5 ideas
- Every hook must feel like it belongs to ${brandName} specifically — never generic
- Mix formats: include at least 1 Carousel, 1 Reel, 1 Static Post
- Mix effort: include at least 1 Low, 1 Medium, 1 High
- Cover different angles: education, social proof, behind the scenes, personal story, transformation`;
}

const TOPIC_PROMPT = (
  topic: string,
  niche: string,
  targetAudience: string,
  positioning: string,
  vanessa: boolean,
  astra: boolean,
  natasha: boolean,
  temaModa: boolean,
  brandName: string,
  brandVoice: BrandVoicePayload | null,
) => {
  const traitsLine = brandVoice?.traits?.length
    ? brandVoice.traits
        .map(t => t.intensity >= 0.65 ? t.trait : t.intensity <= 0.35 ? t.opposite : `${t.trait}/${t.opposite}`)
        .join(", ")
    : null;

  const voiceBlock = vanessa
    ? `Brand Voice: Vanessa Stoykov — bold, taboo-breaking finance educator. Brave, direct, confronting. Speaks to women in their 40s–60s navigating money and major life events.`
    : astra
    ? `Brand Voice: Astra Limousines — quietly luxurious, unhurried, scene-setting. Premium chauffeur and wedding transport. Hooks feel like the beginning of a story.`
    : natasha
    ? `Brand Voice: Natasha Tszyu — warm, elevated personal stylist. Helps women look and feel extraordinary. Hooks feel personal, like talking directly to one woman who finally feels seen.`
    : temaModa
    ? `Brand Voice: Tema Moda — elevated, considered, insider. Luxury fashion. Speaks to women who understand style as identity. Hooks feel like a truth the reader has always known.`
    : [
        `Brand: ${brandName} (${niche}).`,
        positioning ? `Positioning: ${positioning}.` : null,
        targetAudience ? `Target Audience: ${targetAudience}.` : null,
        brandVoice?.toneDescription ? `Tone: ${brandVoice.toneDescription}.` : null,
        traitsLine ? `Voice traits: ${traitsLine}.` : null,
        brandVoice?.captionExample ? `Voice example: "${brandVoice.captionExample}"` : null,
      ].filter(Boolean).join(" ");

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
    const {
      niche, targetAudience, positioning, brandName, topic,
      mission, vision, brandVoice,
    } = await request.json();

    if (!niche) {
      return Response.json({ error: "niche is required" }, { status: 400 });
    }

    const vanessa  = isVanessaStoykov(brandName ?? "", niche);
    const astra    = !vanessa && isAstra(brandName ?? "", niche);
    const natasha  = !vanessa && !astra && isNatasha(brandName ?? "", niche);
    const temaModa = !vanessa && !astra && !natasha && isTemaModa(brandName ?? "", niche);

    const userMessage = topic
      ? TOPIC_PROMPT(topic, niche, targetAudience, positioning, vanessa, astra, natasha, temaModa, brandName ?? "", brandVoice ?? null)
      : vanessa
        ? VANESSA_PROMPT
        : astra
          ? ASTRA_PROMPT
          : natasha
            ? NATASHA_PROMPT
            : temaModa
              ? TEMA_MODA_PROMPT
              : buildBrandPrompt(brandName ?? "", niche, targetAudience, positioning ?? null, mission ?? null, vision ?? null, brandVoice ?? null);

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
