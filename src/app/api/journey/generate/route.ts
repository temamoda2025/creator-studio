import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const client = new Anthropic();

interface BrandStrategyPayload {
  heroDescription?: string;
  externalProblem?: string;
  internalProblem?: string;
  philosophicalProblem?: string;
  guideRole?: string;
  threeStepPlan?: [string, string, string];
  directCta?: string;
  transitionalCta?: string;
  stakes?: string;
  transformation?: string;
  contentPillars?: string[];
  storytellingAngle?: string;
  postingCadence?: string;
  personalQuotes?: string[];
  lifestyleTopics?: string[];
  btsTopics?: string[];
}

export interface JourneyIdea {
  title: string;
  format: "Reel" | "Carousel" | "Static Post" | "Story";
  contentType: "Expertise" | "Lifestyle" | "Quote" | "BTS";
  week: number;
  hook: string;
  captionMode: "Marketing" | "Storytelling";
}

export interface JourneyStage {
  stage: number;
  name: string;
  description: string;
  ideas: JourneyIdea[];
}

function buildPrompt(
  brandName: string,
  niche: string,
  targetAudience: string,
  strategy: BrandStrategyPayload,
): string {
  const ctx: string[] = [];
  if (strategy.heroDescription)      ctx.push(`**Hero:** ${strategy.heroDescription}`);
  if (strategy.externalProblem)      ctx.push(`**External Problem:** ${strategy.externalProblem}`);
  if (strategy.internalProblem)      ctx.push(`**Internal Problem:** ${strategy.internalProblem}`);
  if (strategy.philosophicalProblem) ctx.push(`**Philosophical Problem:** ${strategy.philosophicalProblem}`);
  if (strategy.guideRole)            ctx.push(`**Guide Role:** ${strategy.guideRole}`);
  if (strategy.threeStepPlan?.some(Boolean))
    ctx.push(`**The Plan:** 1. ${strategy.threeStepPlan![0]} → 2. ${strategy.threeStepPlan![1]} → 3. ${strategy.threeStepPlan![2]}`);
  if (strategy.stakes)               ctx.push(`**Stakes:** ${strategy.stakes}`);
  if (strategy.transformation)       ctx.push(`**Transformation:** ${strategy.transformation}`);
  if (strategy.directCta)            ctx.push(`**Direct CTA:** "${strategy.directCta}"`);
  if (strategy.transitionalCta)      ctx.push(`**Transitional CTA:** "${strategy.transitionalCta}"`);
  if (strategy.contentPillars?.length)
    ctx.push(`**Content Pillars:** ${strategy.contentPillars.join(", ")}`);
  if (strategy.storytellingAngle)    ctx.push(`**Storytelling Angle:** ${strategy.storytellingAngle}`);
  if (strategy.personalQuotes?.length)
    ctx.push(`**Personal Quotes (use these verbatim in Quote ideas):**\n${strategy.personalQuotes.map(q => `  – "${q}"`).join("\n")}`);
  if (strategy.lifestyleTopics?.length)
    ctx.push(`**Lifestyle Topics (reference these specifically):** ${strategy.lifestyleTopics.join(", ")}`);
  if (strategy.btsTopics?.length)
    ctx.push(`**BTS Topics (reference these specifically):** ${strategy.btsTopics.join(", ")}`);

  return `Generate a 6-stage Brand Journey content plan for ${brandName} — a ${niche} brand targeting ${targetAudience || "their audience"}.

## Brand Context
${ctx.join("\n")}

## The 6 Stages (StoryBrand-mapped, one per week)

Stage 1 — Awareness (Week 1): Help the right people discover ${brandName}. Who is this brand, who is it for, and why should they care?
Stage 2 — Problem (Week 2): Make the audience feel deeply understood. Name their external, internal, and philosophical problems with precision and empathy.
Stage 3 — Solution (Week 3): Position ${brandName} as the empathetic, authoritative guide — never the hero. Show competence and compassion.
Stage 4 — Proof (Week 4): Demonstrate transformation. Client results, testimonials, before/after stories, credentials, real evidence.
Stage 5 — Decision (Week 5): Remove every objection. Make the "yes" feel obvious, safe, and easy. Address the fears that hold people back.
Stage 6 — Action (Week 6): Drive the call to action. Make acting now feel urgent, low-risk, and right.

## Content Mix (apply across EVERY stage)

Each stage must contain 4–5 ideas mixing ALL 4 content types in these proportions:
- **Expertise** (50%) — Brand knowledge: educational carousels, tips, frameworks, how-to Reels, expert takes. Never generic — must be specific to ${brandName}'s world.
- **Lifestyle** (25%) — Personal human moments that make the brand feel real: morning rituals, favourite places, current reads, family glimpses, weekend habits. Use the Lifestyle Topics above if provided.
- **Quote** (15%) — Quotes the brand genuinely stands by, personal mottos, borrowed wisdom that fits the brand's philosophy. Use Personal Quotes above verbatim where provided.
- **BTS** (10%) — Behind the scenes: real, unpolished moments preparing for a talk, writing content, meeting a client, an honest glimpse of the work behind the brand. Use BTS Topics above if provided.

## Quality Rules

- Every Expertise hook must be specific to ${brandName} — if it could be posted by any ${niche} brand, rewrite it
- Lifestyle ideas must name a SPECIFIC detail (e.g. "my Negroni at Icebergs" not "my favourite restaurant")
- Quote ideas must feel like genuine belief, not inspiration-porn
- BTS ideas must feel raw and real — not polished or performative
- Hooks are complete sentences, scroll-stopping, in first or second person, ready to post as-is
- Spread content types within each stage — do not cluster Expertise ideas together

Return ONLY a raw JSON array — no markdown, no code fences, no preamble:
[
  {
    "stage": 1,
    "name": "Awareness",
    "description": "One sentence describing this stage's goal for ${brandName} specifically",
    "ideas": [
      {
        "title": "Short descriptive title (4–7 words)",
        "format": "Reel" | "Carousel" | "Static Post" | "Story",
        "contentType": "Expertise" | "Lifestyle" | "Quote" | "BTS",
        "week": 1,
        "hook": "The exact opening line — scroll-stopping, in first or second person, ready to post as-is",
        "captionMode": "Marketing" | "Storytelling"
      }
    ]
  }
]

captionMode rules: "Marketing" = persuasive, benefit-driven, structured, CTA-focused. "Storytelling" = narrative, first-person, scene-based, insight lands quietly, soft or no CTA. Lifestyle, Quote, and BTS ideas are almost always "Storytelling". Expertise ideas may be either depending on whether they teach (Marketing) or share a personal revelation (Storytelling).

Return all 6 stages. Each stage has 4–5 ideas. No markdown. No code fences. Just the raw JSON array.`;
}

export async function POST(request: Request) {
  try {
    const { brandName, niche, targetAudience, strategy } = await request.json();

    if (!brandName || !niche) {
      return Response.json({ error: "brandName and niche are required" }, { status: 400 });
    }

    if (!strategy || Object.keys(strategy).length === 0) {
      return Response.json(
        { error: "No strategy found. Fill in your Brand Strategy first." },
        { status: 422 }
      );
    }

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      messages: [
        {
          role: "user",
          content: buildPrompt(brandName, niche, targetAudience ?? "", strategy),
        },
      ],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    if (!textBlock) throw new Error("No text response from Claude");

    let raw = textBlock.text.trim();
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) raw = fence[1].trim();
    const arrMatch = raw.match(/\[[\s\S]*\]/);
    if (arrMatch) raw = arrMatch[0];

    const stages: JourneyStage[] = JSON.parse(raw);
    return Response.json({ stages });
  } catch (error) {
    console.error("[journey/generate]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate journey" },
      { status: 500 }
    );
  }
}
