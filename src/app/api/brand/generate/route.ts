import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert personal brand strategist for Instagram creators.
Generate a comprehensive, personalized brand blueprint based on the creator's profile.
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
          content: `Generate a brand blueprint for this Instagram creator:

Name: ${name}
What they create: ${description}
Their passion: ${passion}
Their skills/expertise: ${skills}
Their mission/goal: ${mission}
Their niche/vocation: ${vocation}

Return this exact JSON structure (raw JSON only, no markdown):
{
  "positioning": "2-3 sentence brand positioning statement",
  "mission": "one sentence mission statement",
  "vision": "one sentence vision statement",
  "customerAvatar": {
    "description": "1-2 sentence ideal follower description",
    "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
    "aspirations": ["aspiration 1", "aspiration 2", "aspiration 3"]
  },
  "brandVoice": {
    "traits": [
      { "trait": "Positive trait", "opposite": "Negative opposite", "intensity": 0.75 },
      { "trait": "Positive trait", "opposite": "Negative opposite", "intensity": 0.80 },
      { "trait": "Positive trait", "opposite": "Negative opposite", "intensity": 0.70 },
      { "trait": "Positive trait", "opposite": "Negative opposite", "intensity": 0.65 }
    ],
    "captionExample": "A realistic sample Instagram caption in this voice, 2-3 sentences"
  },
  "contentPillars": [
    { "id": "01", "name": "Pillar Name", "description": "One sentence description.", "formats": ["Format1", "Format2"], "frequency": "X× per week" },
    { "id": "02", "name": "Pillar Name", "description": "One sentence description.", "formats": ["Format1", "Format2"], "frequency": "X× per week" },
    { "id": "03", "name": "Pillar Name", "description": "One sentence description.", "formats": ["Format1", "Format2"], "frequency": "X× per week" }
  ]
}

Generate exactly 4 brand voice trait pairs (with intensity between 0.5 and 0.9) and 3-5 content pillars tailored to their specific niche and goals.`,
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
