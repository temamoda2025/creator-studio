export interface BrandKit {
  primaryColour: string;
  secondaryColour: string;
  accentColour: string;
  headingFont: string;
  bodyFont: string;
  logo: string | null;
  handle: string;
}

export const DEFAULT_KIT: BrandKit = {
  primaryColour: "#1a1a1a",
  secondaryColour: "#ffffff",
  accentColour: "#c4603c",
  headingFont: "Inter",
  bodyFont: "Inter",
  logo: null,
  handle: "",
};

export function getBrandKit(brandId: string): BrandKit {
  if (typeof window === "undefined") return { ...DEFAULT_KIT };
  const raw = localStorage.getItem(`brandkit-${brandId}`);
  if (!raw) return { ...DEFAULT_KIT };
  try {
    return { ...DEFAULT_KIT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_KIT };
  }
}

export function saveBrandKit(brandId: string, kit: BrandKit): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`brandkit-${brandId}`, JSON.stringify(kit));
  } catch { /* quota */ }
}
