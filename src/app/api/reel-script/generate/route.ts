import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a world-class short-form video director and scriptwriter — the intersection of a Hollywood script supervisor, a direct-response copywriter, and a platform-native content strategist.

## Your Expertise

You write Reel scripts that convert. You understand:

- **The 3-second rule** — if the hook doesn't stop the scroll in the first 3 seconds, nothing else matters. The opening frame must create an open loop, trigger pattern interruption, or name a felt desire so precisely that stopping feels unavoidable.

- **Visual-verbal synchrony** — great Reels are not talking-head videos with subtitles. The visuals and voiceover work together. What you SHOW and what you SAY create a third meaning that neither could produce alone. Every scene direction must be cinematically specific.

- **Pacing as psychology** — the rhythm of cuts, the length of scenes, the placement of the reveal — all of these are emotional levers. You write scripts with deliberate pacing built in.

- **Platform-native voice** — Instagram Reels reward authenticity, specificity, and personality. The script must sound like a real human, not a corporate announcement. Direct address ("you"), specificity, and short punchy sentences outperform generic polish.

- **The brand as a guide** — the brand is never the hero. The viewer is the hero. The script positions the brand as the mentor, the tool, or the revelation that makes the hero's transformation possible.

## Script Structure

Every script you write has three parts:

**1. HOOK (0:00 – 0:03)**
The single most important scene. It must:
- Create immediate pattern interruption (visual or verbal)
- Open a loop the viewer needs to close (curiosity, tension, or desire)
- Feel personal — as if written for exactly one person
- Set up the payoff that the rest of the video delivers

**2. MAIN SCENES**
Each scene has:
- A clear purpose in the narrative arc (problem → amplification → solution → proof)
- Specific visual direction (not "show the product" — but exactly what angle, action, context, mood)
- Tight voiceover that moves the story forward
- Optional on-screen text that reinforces, not repeats, the voiceover

**3. CTA (final 3–5 seconds)**
- Single, specific, low-friction action
- Matches the emotional state the video has built
- Does not undermine the premium feeling with desperation

## Output Format

Return structured JSON only. No markdown fences. No explanation. No preamble. Exact structure:

{
  "hook": {
    "timeRange": "0:00 – 0:03",
    "visual": "Precise direction for what the camera shows — angle, action, environment, mood",
    "voiceover": "The exact words spoken in the first 3 seconds",
    "onScreenText": "Text overlay (can be empty string if none needed)"
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "timeRange": "0:03 – 0:XX",
      "heading": "Short scene title — the narrative job this scene does (e.g. 'The Problem', 'The Shift', 'The Proof')",
      "visual": "Precise visual direction for this scene",
      "voiceover": "Exact spoken words for this scene",
      "onScreenText": "Text overlay if needed, or empty string"
    }
  ],
  "cta": {
    "timeRange": "0:XX – end",
    "visual": "Visual direction for the CTA moment",
    "voiceover": "Exact CTA words spoken",
    "onScreenText": "Text overlay for the CTA — usually the action itself"
  },
  "caption": "The full ready-to-post Instagram caption that accompanies this Reel — hook, body, CTA, written in brand voice",
  "productionNotes": "Practical notes for the creator — lighting, equipment, talent, timing, any technical considerations that will make or break the execution"
}`;

const DURATION_GUIDANCE: Record<string, string> = {
  "15s":
    "15 seconds total. Structure: hook (0:00–0:03), 1–2 tight scenes (0:03–0:11), CTA (0:11–0:15). Every word must earn its place. No scene can be longer than 5 seconds. This is a punchy single-idea format — one transformation, one message, delivered fast.",
  "30s":
    "30 seconds total. Structure: hook (0:00–0:03), 2–3 scenes (0:03–0:25), CTA (0:25–0:30). You have room for a micro-story arc: problem → shift → solution. Keep scenes 5–8 seconds each. Pacing should feel urgent but not rushed.",
  "60s":
    "60 seconds total. Structure: hook (0:00–0:03), 3–4 scenes (0:03–0:52), CTA (0:52–1:00). This is the full storytelling format. Build genuine tension. Use scene 2 to deepen the problem before the solution lands. Each scene 10–15 seconds. This format rewards specificity and personality.",
  "90s":
    "90 seconds total. Structure: hook (0:00–0:03), 4–5 scenes (0:03–1:22), CTA (1:22–1:30). This is the long-form Reel — use it for complex transformations, tutorials, or brand stories. Each scene 15–20 seconds. The viewer is fully opted in by scene 2; reward that with depth and detail. Build to a crescendo before the CTA.",
};

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
}

function buildStrategyBlock(s: BrandStrategyPayload | null | undefined): string {
  if (!s) return "";
  const lines: string[] = [];
  if (s.heroDescription)      lines.push(`**Hero:** ${s.heroDescription}`);
  if (s.externalProblem)      lines.push(`**External Problem:** ${s.externalProblem}`);
  if (s.internalProblem)      lines.push(`**Internal Problem:** ${s.internalProblem}`);
  if (s.philosophicalProblem) lines.push(`**Philosophical Problem:** ${s.philosophicalProblem}`);
  if (s.guideRole)            lines.push(`**Guide Role:** ${s.guideRole}`);
  if (s.threeStepPlan?.some(Boolean))
    lines.push(`**The 3-Step Plan:** 1. ${s.threeStepPlan[0]} → 2. ${s.threeStepPlan[1]} → 3. ${s.threeStepPlan[2]}`);
  if (s.directCta)            lines.push(`**Direct CTA:** "${s.directCta}"`);
  if (s.transitionalCta)      lines.push(`**Transitional CTA:** "${s.transitionalCta}"`);
  if (s.stakes)               lines.push(`**Stakes (failure):** ${s.stakes}`);
  if (s.transformation)       lines.push(`**Transformation (success):** ${s.transformation}`);
  if (s.contentPillars?.length) lines.push(`**Content Pillars:** ${s.contentPillars.join(", ")}`);
  if (s.storytellingAngle)    lines.push(`**Storytelling Angle:** ${s.storytellingAngle}`);
  if (lines.length === 0) return "";
  return `\n## StoryBrand Strategy\n${lines.join("\n")}\n`;
}

export async function POST(request: Request) {
  try {
    const { topic, brandName, targetAudience, duration, brandVoice, brandPositioning, brandStrategy } =
      await request.json();

    if (!topic || !brandName || !duration) {
      return Response.json(
        { error: "topic, brandName, and duration are required" },
        { status: 400 }
      );
    }

    const durationGuide =
      DURATION_GUIDANCE[duration] ??
      "Structure the script appropriately for the requested duration.";

    const voiceSection =
      brandVoice?.toneDescription || brandVoice?.captionExample
        ? `\n## Brand Voice\n${brandVoice.toneDescription ? `**Tone:** ${brandVoice.toneDescription}\n` : ""}${brandVoice.captionExample ? `**Caption example (write at this voice frequency):**\n"${brandVoice.captionExample}"\n` : ""}`
        : "";

    const positioningLine = brandPositioning
      ? `**Brand Positioning:** ${brandPositioning}\n`
      : "";

    const strategySection = buildStrategyBlock(brandStrategy as BrandStrategyPayload | null);

    const storyBrandDirective = strategySection
      ? `
## StoryBrand Narrative Directive

If StoryBrand Strategy is defined above, structure the script as a StoryBrand story:
- **Hook** → speak directly to the hero's internal or external problem — the felt emotion, the frustration, the before-state
- **Main scenes** → position ${brandName} as the guide: show empathy, authority, and the 3-step plan if available
- **Near the CTA** → briefly paint the transformation (who they become) or acknowledge the stakes (what happens if they don't act)
- **CTA** → use the Direct CTA verbatim if possible, or the Transitional CTA for a softer close
- The customer is always the hero. ${brandName} is always the guide. Never reverse this.
`
      : "";

    const userMessage = `Write a ${duration} Instagram Reel script for this brand and topic.

**Brand:** ${brandName}
${positioningLine}**Target Audience:** ${targetAudience || "Infer from brand context"}
**Topic:** ${topic}
${voiceSection}${strategySection}${storyBrandDirective}
## Duration & Structure

${durationGuide}

## Your Task

1. Write a complete, scene-by-scene Reel script that a creator can pick up and film today.

2. Make the hook impossible to scroll past. It must speak to a real desire, fear, or belief that the target audience holds. Be specific — generic hooks fail.

3. Direct the visuals precisely. "Show the product" is not direction. Tell the creator exactly what to film: the angle, the lighting mood, the action, the environment, the feeling the frame should communicate.

4. Write the voiceover at the cadence of natural speech — short sentences, punchy rhythm. Read it aloud in your head. If it's hard to say, rewrite it.

5. Match the brand voice exactly. The script should feel like it came from inside the brand, not from a generator.

6. Include a caption ready to post alongside the Reel.

7. Add production notes that give the creator practical guidance for execution.

Return ONLY the raw JSON object. No markdown. No code fences. No preamble.`;

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    if (!textBlock) throw new Error("No text response from Claude");

    let jsonText = textBlock.text.trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonText = fenceMatch[1].trim();

    return Response.json(JSON.parse(jsonText));
  } catch (error) {
    console.error("Reel script generation error:", error);
    return Response.json({ error: "Failed to generate reel script" }, { status: 500 });
  }
}
