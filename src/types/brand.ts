export type Platform = "instagram" | "tiktok" | "youtube" | "pinterest" | "facebook";

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

export interface Brand {
  id: string;
  name: string;
  handle?: string;
  niche: string;
  platforms: Platform[];
  targetAudience: string;
  positioning?: string;
  mission?: string;
  vision?: string;
  brandVoice: BrandVoice;
  createdAt: string;
  updatedAt: string;
}
