export type Platform = "instagram" | "tiktok" | "youtube" | "pinterest" | "facebook" | "linkedin";

export interface AudienceSegment {
  label: string;
  description: string;
}

export interface BrandVoiceTrait {
  trait: string;
  opposite: string;
  intensity: number; // 0–1
}

export interface BrandVoice {
  traits: BrandVoiceTrait[];
  toneDescription?: string;
  captionExample?: string;
}

export interface BrandStrategy {
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

export interface Brand {
  id: string;
  name: string;
  handle?: string;
  niche: string;
  platforms: Platform[];
  targetAudience: string;
  audienceSegments?: AudienceSegment[]; // up to 3 distinct segments (e.g. B2C + B2B)
  positioning?: string;
  mission?: string;
  vision?: string;
  brandVoice: BrandVoice;
  strategy?: BrandStrategy;
  createdAt: string;
  updatedAt: string;
}
