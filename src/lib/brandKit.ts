import { supabase } from "./supabase";

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

export async function getBrandKit(brandId: string): Promise<BrandKit> {
  const { data, error } = await supabase
    .from("brand_kit")
    .select("*")
    .eq("brand_id", brandId)
    .single();

  if (error || !data) return { ...DEFAULT_KIT };

  return {
    primaryColour: data.primary_colour ?? DEFAULT_KIT.primaryColour,
    secondaryColour: data.secondary_colour ?? DEFAULT_KIT.secondaryColour,
    accentColour: data.accent_colour ?? DEFAULT_KIT.accentColour,
    headingFont: data.heading_font ?? DEFAULT_KIT.headingFont,
    bodyFont: data.body_font ?? DEFAULT_KIT.bodyFont,
    logo: data.logo_base64 ?? null,
    handle: data.handle ?? "",
  };
}

export async function saveBrandKit(brandId: string, kit: BrandKit): Promise<void> {
  await supabase.from("brand_kit").upsert(
    {
      brand_id: brandId,
      primary_colour: kit.primaryColour,
      secondary_colour: kit.secondaryColour,
      accent_colour: kit.accentColour,
      heading_font: kit.headingFont,
      body_font: kit.bodyFont,
      logo_base64: kit.logo,
      handle: kit.handle,
    },
    { onConflict: "brand_id" }
  );
}
