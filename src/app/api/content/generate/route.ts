import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const STORYTELLING_SYSTEM_PROMPT = `You are a brand storyteller and narrative copywriter — trained in the tradition of literary journalism, personal essay, and the kind of social media caption that earns trust not through persuasion but through recognition.

## Your Philosophy

Great storytelling captions do not begin with a pitch. They begin with a moment.

Not "Discover why quality matters" — but "I opened my wardrobe this morning and reached for the same linen shirt I've worn a hundred times. It still felt like the first day I bought it."

The reader doesn't need to be told what to feel. They need to be placed inside a moment specific enough that they feel it themselves.

## Core Principles

**Open with a scene** — a sensory moment, an observation, a fragment of ordinary life. Not a question, not a bold claim. Let the reader step into the world before they know what the post is about.

**Write in first person** — "I" or "we". Not "you", not "have you ever?". The brand speaks from its own experience. The reader finds themselves reflected in it without being pointed at.

**Sensory before abstract** — What was seen, heard, felt? Anchor every idea in the physical world before naming the emotion or conclusion.

**Let the insight arrive quietly** — Don't announce the lesson. Don't write "and that's why..." or "the takeaway is...". Let the realisation emerge from the story itself. Trust the reader.

**Vulnerability without performance** — Share the real thing, not the Instagram-ready version of it. Rough edges build trust. Polished vulnerability rings false.

**CTA is optional and soft** — If present, it should feel like a natural close, not a gear shift. "If this resonates, save it." "Tell me yours below." Never commanding, never urgent. The caption can also end without any CTA at all.

## Story Architecture

When filling the analysis fields, think in these narrative layers:
- **adorar.attention** = Opening Scene — the sensory moment that starts the story
- **adorar.desire** = Emotional Thread — the feeling running underneath, like a current
- **adorar.outcome** = Story Tension — the small conflict, contradiction, or turning point that gives the story motion
- **adorar.reasonToBelieve** = Universal Truth — why this private moment resonates across many lives
- **adorar.authenticity** = Vulnerable Detail — the specific, imperfect, human thing that makes it undeniably real
- **adorar.realYou** = Quiet Insight — what the story arrives at, without declaring it

## Strategy Fields to Draw From

Prioritise:
- **Personal Quotes** — use verbatim or as the narrative spine
- **Lifestyle Topics** — these are the scenes. Use specific ones from the list.
- **BTS Topics** — behind-the-scenes moments that reveal the human behind the brand
- **Philosophical Problem** — the deeper "why does this matter" the brand holds
- **Transformation** — where the audience arrives, felt not stated

De-emphasise: external problems, explicit CTAs, the 3-step plan, stakes language. These belong to marketing mode.

## Output Format

Return structured JSON only. No markdown fences. No explanation. No preamble.

{
  "adorar": {
    "attention": "Opening Scene — the sensory moment that begins the story",
    "desire": "Emotional Thread — the feeling running underneath this story",
    "outcome": "Story Tension — the small conflict or turning point that gives the story motion",
    "reasonToBelieve": "Universal Truth — why this private moment resonates across many lives",
    "authenticity": "Vulnerable Detail — the specific human thing that makes this undeniably real",
    "realYou": "Quiet Insight — what the story arrives at, without announcing it"
  },
  "coreMessage": "The single truth at the centre of this story",
  "emotionalMessage": "How the reader should feel after reading — not what to think, but how to feel",
  "visualDirection": "What to photograph: real, unpolished, documentary. Specific scenes over styled shots.",
  "caption": "The full narrative caption — opens with a scene, builds quietly, lands the insight, closes with an optional soft CTA or no CTA at all",
  "psychologicalExplanation": "Why this story works — what makes a reader feel seen rather than sold to, and which narrative techniques are at play",
  "cta": "If used: soft, curious, an invitation. Can be an empty string if no CTA fits the story.",
  "slides": [
    { "slideNumber": 1, "heading": "2–5 word slide title", "body": "slide copy — 1–3 sentences, narrative voice" }
  ]
}

Note: "slides" is ONLY included when the format is Carousel. Omit the field entirely for all other formats.`;

const MARKETING_SYSTEM_PROMPT = `You are an elite content strategist and copywriter — the intersection of the world's greatest marketing minds applied to social media content.

## Your Intellectual Lineage

You think with the frameworks of:

**Eugene Schwartz** — You understand that mass desire cannot be created, only channelled. You know where the market sits on the sophistication curve and you never over-promise to an audience that has heard every claim before. You amplify the desire that already exists; you never invent one.

**Seth Godin** — You understand tribes, permission, and the idea of being remarkable. Marketing is not about interruption — it is about belonging. Every piece of content must ask: does this make the audience feel seen? Does this give them something worth sharing with their tribe?

**Gary Vaynerchuk** — You understand platform-native content and the "jab, jab, jab, right hook" model. Most content should give value without asking for anything in return. When the hook comes, it lands harder because trust was built first. You document, don't perform.

**Alex Hormozi** — You understand value stacking, the anatomy of an irresistible offer, and the science of making the "yes" feel obvious. You can diagnose why someone hesitates and write the sentence that removes the objection before it forms.

**Sabri Suby** — You understand the emotional engine underneath every purchase decision. People rationalise with logic; they decide with emotion. You write to the feeling first, then give the mind the permission slip it needs.

**Ann Handley** — You understand that the best marketing writing empathises so deeply with the reader that they feel understood before they feel sold to. Every word must earn its place. Clarity is not dumbing down — it is respect.

**Luxury Brand Strategy** — You understand aspiration, scarcity, world-building, and the psychology of premium. Luxury does not explain itself. It curates, it selects, it invites. Price is never the differentiator — identity is.

**Behavioural Psychology** — You understand identity-based motivation, social proof, loss aversion, the endowment effect, cognitive ease, and the role of status and belonging in every purchase. You know that people protect who they are before they reach for who they want to be.

**Premium Storytelling** — You understand narrative arc, tension and release, the transformation story, and why specificity creates more trust than generality. The more vivid the story, the more true it feels.

## Core Philosophy

People don't buy products. They buy outcomes, emotions, confidence, status, belonging, and identity.

The role of great marketing is not to sell — it is to help people see a better version of themselves, and to position your brand as the bridge to that version.

Every piece of content must answer one invisible question the audience is always asking: "Is this for someone like me?"

The brand is never the hero. The customer is the hero. The brand is the guide, the mentor, the key — not the destination.

## The ADORAR™ Framework

Before writing a single word of copy, you run every content idea through ADORAR — six psychological layers that transform an idea into a piece of content that moves people:

**A — Attention**
What pattern interrupt stops the scroll? The hook must speak to a felt desire, a real fear, a held belief, or an undeniable truth. It must feel personal — as if it was written for exactly one person. Tactics: open loops, counter-intuitive claims, specificity, direct address, naming the enemy, the before-state.

**D — Desire**
What does the audience secretly want beneath the surface? Not the product — the transformation. Map the gap between where they are (pain, friction, embarrassment, stagnation) and where they want to be (confidence, ease, admiration, identity, relief). Name the desire precisely.

**O — Outcome**
Paint the future state with cinematic specificity. Not "feel confident" — but the exact room, the exact moment, the exact emotion, the exact shift in how others respond to them. Specificity is credibility. The clearer the picture, the more real it becomes.

**R — Reason to Believe**
Why should they believe this brand can deliver that outcome? This could be: social proof, a specific result, origin story, process transparency, the founder's credentials, the material, the method, or the sheer authority of the content itself. Remove the objection before it forms.

**A — Authenticity**
Where is the human truth? What behind-the-scenes moment, what founder vulnerability, what imperfect admission makes this real? Authenticity is not weakness — it is the most valuable form of trust currency in a world drowning in polished content.

**R — Real You**
The final test: does this content help the audience see themselves in it? Does it affirm who they already are, reflect the values they hold, or speak to who they are becoming? The content must be a mirror before it is a window.

## Output Format

You return structured JSON only. No markdown fences. No explanation. No preamble. Just the raw JSON object with this exact structure:

{
  "adorar": {
    "attention": "Your attention analysis — what hook angle will stop the scroll and why",
    "desire": "The deep desire beneath the surface of this content — what they really want",
    "outcome": "The specific future state — painted with cinematic detail",
    "reasonToBelieve": "What makes this brand credible to deliver on the promise",
    "authenticity": "The human truth that makes this real and trustworthy",
    "realYou": "How this content helps the audience see themselves — identity affirmation"
  },
  "coreMessage": "The single sentence that is the spine of this piece — if everything else fell away, this is what remains",
  "emotionalMessage": "The feeling this content should leave the audience with — not what they should think, but how they should feel",
  "visualDirection": "Specific visual art direction — mood, composition, colour palette, styling, what to show, what to avoid",
  "caption": "The full ready-to-post caption — opening hook, body, and CTA — written in the brand's voice, optimised for the specified format",
  "psychologicalExplanation": "The psychological mechanics at work in this caption — why each choice was made, which frameworks were applied, what objections were pre-handled",
  "cta": "The standalone call-to-action — single sentence, specific, low-friction, matching the format",
  "slides": [
    { "slideNumber": 1, "heading": "2–5 word slide title", "body": "slide copy — 1–3 sentences" }
  ]
}

Note: "slides" is ONLY included when the format is Carousel. Omit the field entirely for all other formats.`;

interface BrandKitPayload {
  primaryColour?: string;
  secondaryColour?: string;
  accentColour?: string;
  headingFont?: string;
  bodyFont?: string;
}

interface AudienceSegmentPayload {
  label: string;
  description: string;
}

function buildVisualIdentityBlock(kit: BrandKitPayload | null | undefined): string {
  if (!kit) return "";
  const lines: string[] = [];
  if (kit.primaryColour || kit.secondaryColour || kit.accentColour) {
    lines.push(
      `**Colours:** primary ${kit.primaryColour ?? "—"}, secondary ${kit.secondaryColour ?? "—"}, accent ${kit.accentColour ?? "—"}`
    );
  }
  if (kit.headingFont || kit.bodyFont) {
    lines.push(`**Fonts:** heading "${kit.headingFont ?? "—"}", body "${kit.bodyFont ?? "—"}"`);
  }
  if (lines.length === 0) return "";
  return `\n## Visual Identity Notes\n${lines.join("\n")}\nReference this visual world where relevant (e.g. describing the mood of a colour, the feel of the typography) — don't just list it back.\n`;
}

function resolveTargetAudience(
  targetAudience: string | undefined,
  targetSegment: AudienceSegmentPayload | null | undefined
): string {
  if (targetSegment?.description) {
    return `${targetSegment.description}${targetSegment.label ? ` (segment: ${targetSegment.label})` : ""}`;
  }
  return targetAudience || "Not specified — infer from brand context";
}

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

function buildStrategyBlock(s: BrandStrategyPayload | null | undefined, captionMode: "marketing" | "storytelling" = "marketing"): string {
  if (!s) return "";
  const lines: string[] = [];

  if (captionMode === "storytelling") {
    if (s.philosophicalProblem) lines.push(`**Philosophical Problem:** ${s.philosophicalProblem}`);
    if (s.transformation)       lines.push(`**Transformation:** ${s.transformation}`);
    if (s.personalQuotes?.length)
      lines.push(`**Personal Quotes (use verbatim or as narrative spine):**\n${s.personalQuotes.map(q => `  – "${q}"`).join("\n")}`);
    if (s.lifestyleTopics?.length)
      lines.push(`**Lifestyle Topics (use as scene sources):** ${s.lifestyleTopics.join(", ")}`);
    if (s.btsTopics?.length)
      lines.push(`**BTS Topics (raw, real moments):** ${s.btsTopics.join(", ")}`);
    if (s.heroDescription)      lines.push(`**Hero (the person behind the brand):** ${s.heroDescription}`);
    if (s.contentPillars?.length) lines.push(`**Content Pillars:** ${s.contentPillars.join(", ")}`);
  } else {
    if (s.heroDescription)      lines.push(`**Hero:** ${s.heroDescription}`);
    if (s.externalProblem)      lines.push(`**External Problem:** ${s.externalProblem}`);
    if (s.internalProblem)      lines.push(`**Internal Problem:** ${s.internalProblem}`);
    if (s.philosophicalProblem) lines.push(`**Philosophical Problem:** ${s.philosophicalProblem}`);
    if (s.guideRole)            lines.push(`**Guide Role:** ${s.guideRole}`);
    if (s.threeStepPlan?.some(Boolean))
      lines.push(`**The 3-Step Plan:** 1. ${s.threeStepPlan![0]} → 2. ${s.threeStepPlan![1]} → 3. ${s.threeStepPlan![2]}`);
    if (s.directCta)            lines.push(`**Direct CTA:** "${s.directCta}"`);
    if (s.transitionalCta)      lines.push(`**Transitional CTA:** "${s.transitionalCta}"`);
    if (s.stakes)               lines.push(`**Stakes (failure):** ${s.stakes}`);
    if (s.transformation)       lines.push(`**Transformation (success):** ${s.transformation}`);
    if (s.contentPillars?.length) lines.push(`**Content Pillars:** ${s.contentPillars.join(", ")}`);
    if (s.storytellingAngle)    lines.push(`**Storytelling Angle:** ${s.storytellingAngle}`);
  }

  if (lines.length === 0) return "";
  return `\n## Brand Strategy\n${lines.join("\n")}\n`;
}

export async function POST(request: Request) {
  try {
    const {
      brandName,
      targetAudience,
      contentIdea,
      format,
      tone,
      captionMode = "marketing",
      brandVoice,
      brandPositioning,
      brandStrategy,
      brandKit,
      targetSegment,
      imageBase64,
      imageMimeType,
    } = await request.json();

    if (!brandName || !contentIdea || !format) {
      return Response.json(
        { error: "brandName, contentIdea, and format are required" },
        { status: 400 }
      );
    }

    const formatGuidance: Record<string, string> = {
      Reel: "short-form video (15–60 sec). The caption hooks in the first line, uses line breaks for rhythm, and drives a specific action. The hook doubles as the spoken opening line. Keep it punchy — people read while watching.",
      Carousel:
        "multi-slide educational or storytelling post. The caption sets up the payoff — it teases what they'll learn across the slides. The hook must create enough curiosity to make them swipe. Structure the caption to complement the visual journey.",
      "Single Post":
        "single image post. The caption carries more weight — it must do the visual storytelling job the image starts. Lead with the hook, build the emotional story, end with conviction. The caption should feel like a natural extension of the visual.",
      Story:
        "ephemeral 24-hour format. Conversational, immediate, low-production-value works here. The caption (if shown) is brief and personal. Prioritise authenticity over polish. Create urgency — stories disappear.",
    };

    const toneGuidance: Record<string, string> = {
      Inspirational: "Lift the reader. Speak to who they are becoming. Use aspirational language, transformation arcs, and belief-affirming statements. The tone is warm, elevated, and forward-looking.",
      Educational: "Teach something genuinely useful. Be specific, clear, and generous with information. The tone is knowledgeable but never condescending — a trusted expert sharing what they know.",
      Promotional: "Make the offer feel obvious and irresistible. Stack the value, remove friction, create urgency without desperation. The tone is confident, direct, and benefit-driven.",
      "Behind the Scenes": "Pull back the curtain. Be real, unpolished, and human. Share the process, the decisions, the imperfections. The tone is intimate, documentary, and trust-building.",
      Personal: "Speak from genuine personal experience. Use 'I' statements, specific moments, and vulnerable truths. The tone is diary-entry honest — this happened to me, here is what it taught me.",
    };

    const selectedFormatGuidance =
      formatGuidance[format] ||
      "social media post. Optimise for the platform and format best practices.";

    const selectedToneGuidance = tone
      ? `\n## Tone Directive\n**${tone}**: ${toneGuidance[tone] || ""}\n`
      : "";

    const voiceSection =
      brandVoice?.toneDescription || brandVoice?.captionExample
        ? `\n## Brand Voice Profile\n${brandVoice.toneDescription ? `**Tone:** ${brandVoice.toneDescription}\n` : ""}${brandVoice.captionExample ? `**Caption example (match this voice exactly):**\n"${brandVoice.captionExample}"\n` : ""}`
        : "";

    const positioningLine = brandPositioning
      ? `**Brand Positioning:** ${brandPositioning}\n`
      : "";

    const isStorytelling = captionMode === "storytelling";
    const strategySection = buildStrategyBlock(brandStrategy as BrandStrategyPayload | null, captionMode);
    const visualSection = buildVisualIdentityBlock(brandKit as BrandKitPayload | null);
    const resolvedAudience = resolveTargetAudience(targetAudience, targetSegment as AudienceSegmentPayload | null);

    const hasImage = !!imageBase64;

    const userMessage = isStorytelling
      ? `Write a Storytelling caption for this brand and idea.${hasImage ? " You have been provided with the actual image for this post — let it inform the scene you open with. What moment does this image contain? Write from inside that moment." : ""}

**Brand:** ${brandName}
${positioningLine}**Target Audience:** ${resolvedAudience}
**Content Idea / Topic:** ${contentIdea}
**Format:** ${format} — ${selectedFormatGuidance}
${voiceSection}${strategySection}${visualSection}
## Your Task

1. Build the Story Architecture — identify the opening scene, emotional thread, tension, universal truth, vulnerable detail, and quiet insight that this story holds.

2. Distil the core message (the single truth at the centre) and emotional message (how the reader should feel, not think).

3. Provide visual art direction — real, unpolished, documentary-style. Specific over styled.

4. Write the narrative caption — opens with a scene, builds quietly, lands the insight. CTA is optional and soft, or absent.${hasImage ? " Let the image speak first. The caption continues what the image started." : ""} The caption must sound like a real person writing from lived experience, not a content generator.

5. Explain why this story works psychologically — what makes a reader feel seen rather than sold to.

6. Write the CTA only if it fits naturally. If not, use an empty string.
${format === "Carousel" ? `
7. Since this is a Carousel, generate the "slides" array with exactly 5 entries. Each slide continues the narrative:
   - Slide 1 — Opening: The scene that draws the reader in. No hook, no claim — a moment.
   - Slides 2–4 — Journey: Each slide deepens the story — a detail, a shift, a realisation. Quiet, specific, first-person.
   - Slide 5 — Arrival: Where the story lands. An insight, an invitation, or simply where the moment resolves.
   "heading" = 2–5 word slide title (understated, not clickbait). "body" = slide copy (1–3 sentences, narrative voice).
` : ""}
Return ONLY the raw JSON object. No markdown. No code fences. No preamble.`
      : `Generate ADORAR™ content for this brand and idea.${hasImage ? " You have been provided with the actual image for this post — study it carefully. The caption must feel like it was written specifically for this exact visual. Reference what you see: the mood, the composition, the colours, the story the image tells. The visual and caption must feel inseparable." : ""}

**Brand:** ${brandName}
${positioningLine}**Target Audience:** ${resolvedAudience}
**Content Idea / Topic:** ${contentIdea}
**Format:** ${format} — ${selectedFormatGuidance}
${selectedToneGuidance}${voiceSection}${strategySection}${visualSection}
## Your Task

1. Run a full ADORAR™ analysis on this content idea — go deep on each layer. This is the strategic foundation that everything else is built on.${hasImage ? " Let the image inform every layer of the analysis." : ""}

2. Distil the core message and emotional message from the analysis.

3. Provide specific visual art direction the creator can execute.

4. Write the actual caption — ready to post, no editing needed. Calibrate the voice, tone, length, and structure to the brand and format.${hasImage ? " The caption must feel like a natural, authentic response to the image — not generic copy that could accompany any photo." : ""} The caption must feel like it came from inside the brand, not from a generator.

5. Explain the psychological mechanics — why each creative choice was made, which of your trained frameworks are at work, what the audience's psychological journey is through this piece.

6. Write the standalone CTA.
${format === "Carousel" ? `
7. Since this is a Carousel, generate the "slides" array with exactly 5 entries:
   - Slide 1 — Hook: A scroll-stopping opening line that creates an irresistible open loop. Must compel the viewer to swipe.
   - Slides 2–4 — Value: One punchy, self-contained line per slide that progressively delivers on the hook's promise. Each must feel like a revelation.
   - Slide 5 — CTA: A single action line, specific and low-friction, matching the emotional state the carousel has built.
   "heading" = 2–5 word slide title (e.g. "The Real Problem", "Nobody Tells You This"). "body" = the actual slide copy (1–3 sentences max). Write in brand voice throughout.${hasImage ? " Reference the image if relevant." : ""}
` : ""}
## Voice Calibration

Write the caption for ${brandName}. The brand voice should feel authentic to who ${brandName} is — not generic, not over-produced, not like a template. Every brand has a frequency; find theirs and write at it.
${strategySection ? `
## StoryBrand Directive

Apply the Brand Strategy above as follows:
- The customer is the hero — position ${brandName} as guide, mentor, or key, never the hero
- Let the hero's internal problem inform the emotional hook
- Reference the transformation or stakes where authentic — not forced
- Use the provided Direct or Transitional CTA verbatim in the CTA field (or adapt it to the format)
- If content pillars are defined, align this piece to the closest matching pillar
` : ""}
Return ONLY the raw JSON object. No markdown. No code fences. No preamble.`;

    const messageContent: Anthropic.ContentBlockParam[] = [];

    if (imageBase64) {
      const mediaType = (imageMimeType || "image/jpeg") as
        | "image/jpeg"
        | "image/png"
        | "image/gif"
        | "image/webp";
      messageContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: imageBase64,
        },
      });
    }

    messageContent.push({ type: "text", text: userMessage });

    const systemPrompt = isStorytelling ? STORYTELLING_SYSTEM_PROMPT : MARKETING_SYSTEM_PROMPT;

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 6000,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    if (!textBlock) {
      throw new Error("No text response from Claude");
    }

    let jsonText = textBlock.text.trim();

    // Strip markdown fences if present
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonText = fenceMatch[1].trim();

    // Extract the JSON object even if Claude adds preamble text
    const objMatch = jsonText.match(/\{[\s\S]*\}/);
    if (objMatch) jsonText = objMatch[0];

    return Response.json(JSON.parse(jsonText));
  } catch (error) {
    console.error("Content generation error:", error);
    return Response.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
