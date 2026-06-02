import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a brand strategist for Tema Moda — an Australian fashion label rooted in authentic Italian craftsmanship. Every blueprint you generate must be true to this brand's DNA.

## The Brand

Tema Moda is co-founded by Emanuela Tellaroli, a master seamstress who creates each piece with Italian craftsmanship: small quantities, natural fabrics, timeless silhouettes, accessible luxury. This is not fast fashion. It is not trend-chasing. It is clothing made with skill and intention.

## The Ideal Customer

She is a woman aged 35–70. She values quality over quantity. She is confident, sophisticated, well-travelled, and drawn to craftsmanship. She is not buying to impress others — she knows who she is. She has moved past the noise of fast fashion and is looking for pieces that feel like themselves.

The deeper truth: she doesn't buy Tema Moda because she needs another dress. She buys because she wants to feel like herself again — reclaiming her identity through clothing that respects who she has become.

## Brand Voice Principles

- Speak with warmth and quiet confidence, never loudness.
- Never hype, never urgency tactics, never trend language.
- Honour the craft — mention fabric, construction, and the hand behind the work.
- Speak to the woman's interior life, not her appearance.
- Short sentences. White space. Let the words breathe.
- The emotional register is: intimate, considered, grounded, a little poetic.

## What to Avoid

- Aspirational language that implies she is not yet enough.
- Trend references, fast-fashion comparisons, seasonal urgency.
- Excessive adjectives or marketing clichés ("elevate your wardrobe", "effortless style").
- Speaking about the clothes before speaking about the woman wearing them.

## Your Task

Generate a brand blueprint grounded in this DNA. All outputs — positioning, mission, vision, customer avatar, brand voice, content pillars — must reflect Tema Moda's values of craftsmanship, authenticity, and the deeper emotional truth of why this customer buys.

Return ONLY valid JSON — no markdown code fences, no preamble, just the raw JSON object.`;

export async function POST(request: Request) {
  try {
    const { name, description, passion, skills, mission, vocation } =
      await request.json();

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
      messages: [
        {
          role: "user",
          content: `Generate a brand blueprint for this Tema Moda creator profile:

Name: ${name}
What they create: ${description}
Their passion: ${passion}
Their skills/expertise: ${skills}
Their mission/goal: ${mission}
Their niche/vocation: ${vocation}

Remember the brand DNA: authentic Italian craftsmanship by master seamstress Emanuela Tellaroli, small quantities, natural fabrics, timeless silhouettes, accessible luxury. The customer is a confident woman (35–70) who buys not because she needs another dress, but because she wants to feel like herself again.

All copy must honour this — quiet confidence, craft-first language, speaking to her interior life.

Return this exact JSON structure (raw JSON only, no markdown):
{
  "positioning": "2-3 sentence positioning statement grounded in craft and the emotional truth of this customer",
  "mission": "one sentence mission statement — specific, human, craft-forward",
  "vision": "one sentence vision statement — what a world shaped by this brand looks like",
  "customerAvatar": {
    "description": "1-2 sentences describing her — who she is, not what she wears",
    "painPoints": ["interior struggle 1", "interior struggle 2", "interior struggle 3"],
    "aspirations": ["what she is moving toward 1", "aspiration 2", "aspiration 3"]
  },
  "brandVoice": {
    "traits": [
      { "trait": "Positive trait", "opposite": "Negative opposite", "intensity": 0.75 },
      { "trait": "Positive trait", "opposite": "Negative opposite", "intensity": 0.80 },
      { "trait": "Positive trait", "opposite": "Negative opposite", "intensity": 0.70 },
      { "trait": "Positive trait", "opposite": "Negative opposite", "intensity": 0.65 }
    ],
    "captionExample": "A real Instagram caption in the Tema Moda voice — intimate, craft-aware, speaking to her identity not her wardrobe. 2-3 sentences. No hashtags."
  },
  "contentPillars": [
    { "id": "01", "name": "Pillar Name", "description": "One sentence — what this pillar serves for the customer.", "formats": ["Format1", "Format2"], "frequency": "X× per week" },
    { "id": "02", "name": "Pillar Name", "description": "One sentence.", "formats": ["Format1", "Format2"], "frequency": "X× per week" },
    { "id": "03", "name": "Pillar Name", "description": "One sentence.", "formats": ["Format1", "Format2"], "frequency": "X× per week" }
  ]
}

Generate exactly 4 brand voice trait pairs (intensity 0.5–0.9) and 3–5 content pillars. Pillars should reflect slow fashion values: craftsmanship, the maker's hand, the customer's life, timeless dressing — not trend content or shopping hauls.`,
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
    // Strip markdown code fences if present
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonText = fenceMatch[1].trim();

    return Response.json(JSON.parse(jsonText));
  } catch (error) {
    console.error("Brand generation error:", error);
    return Response.json(
      { error: "Failed to generate brand blueprint" },
      { status: 500 }
    );
  }
}
