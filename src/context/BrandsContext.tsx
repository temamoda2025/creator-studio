"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Brand } from "@/types/brand";
import { supabase } from "@/lib/supabase";

const PLACEHOLDER_USER_ID = "00000000-0000-0000-0000-000000000001";

interface BrandsContextValue {
  brands: Brand[];
  activeBrand: Brand | null;
  setActiveBrandId: (id: string) => void;
  addBrand: (data: Omit<Brand, "id" | "createdAt" | "updatedAt">) => Promise<Brand>;
  updateBrand: (id: string, data: Partial<Omit<Brand, "id" | "createdAt">>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBrand(row: Record<string, any>): Brand {
  const hasStrategy =
    row.hero_description || row.external_problem || row.internal_problem ||
    row.philosophical_problem || row.guide_role || row.three_step_plan ||
    row.direct_cta || row.transitional_cta || row.stakes || row.transformation ||
    row.content_pillars || row.storytelling_angle || row.posting_cadence;

  return {
    id: row.id,
    name: row.name,
    niche: row.niche ?? "",
    handle: row.handle ?? undefined,
    platforms: row.platforms ?? [],
    targetAudience: row.target_audience ?? "",
    positioning: row.positioning ?? undefined,
    mission: row.mission ?? undefined,
    vision: row.vision ?? undefined,
    brandVoice: row.brand_voice ?? { traits: [] },
    strategy: hasStrategy ? {
      heroDescription:      row.hero_description      ?? undefined,
      externalProblem:      row.external_problem      ?? undefined,
      internalProblem:      row.internal_problem      ?? undefined,
      philosophicalProblem: row.philosophical_problem ?? undefined,
      guideRole:            row.guide_role            ?? undefined,
      threeStepPlan:        row.three_step_plan       ?? undefined,
      directCta:            row.direct_cta            ?? undefined,
      transitionalCta:      row.transitional_cta      ?? undefined,
      stakes:               row.stakes                ?? undefined,
      transformation:       row.transformation        ?? undefined,
      contentPillars:       row.content_pillars       ?? undefined,
      storytellingAngle:    row.storytelling_angle    ?? undefined,
      postingCadence:       row.posting_cadence       ?? undefined,
    } : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}

const BrandsContext = createContext<BrandsContextValue | null>(null);

export function BrandsProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrandId, setActiveBrandIdState] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("brands")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setBrands(data.map(rowToBrand));
      });

    const activeId = localStorage.getItem("agency_active_brand_id");
    if (activeId) setActiveBrandIdState(activeId);
  }, []);

  useEffect(() => {
    if (activeBrandId) {
      localStorage.setItem("agency_active_brand_id", activeBrandId);
    } else {
      localStorage.removeItem("agency_active_brand_id");
    }
  }, [activeBrandId]);

  const addBrand = useCallback(
    async (data: Omit<Brand, "id" | "createdAt" | "updatedAt">): Promise<Brand> => {
      const s = data.strategy;
      const { data: row, error } = await supabase
        .from("brands")
        .insert({
          user_id: PLACEHOLDER_USER_ID,
          name: data.name,
          handle: data.handle ?? null,
          niche: data.niche,
          platforms: data.platforms,
          target_audience: data.targetAudience,
          positioning: data.positioning ?? null,
          mission: data.mission ?? null,
          vision: data.vision ?? null,
          brand_voice: data.brandVoice,
          hero_description:      s?.heroDescription      ?? null,
          external_problem:      s?.externalProblem      ?? null,
          internal_problem:      s?.internalProblem      ?? null,
          philosophical_problem: s?.philosophicalProblem ?? null,
          guide_role:            s?.guideRole            ?? null,
          three_step_plan:       s?.threeStepPlan        ?? null,
          direct_cta:            s?.directCta            ?? null,
          transitional_cta:      s?.transitionalCta      ?? null,
          stakes:                s?.stakes               ?? null,
          transformation:        s?.transformation       ?? null,
          content_pillars:       s?.contentPillars       ?? null,
          storytelling_angle:    s?.storytellingAngle    ?? null,
          posting_cadence:       s?.postingCadence       ?? null,
        })
        .select()
        .single();

      if (error || !row) throw error ?? new Error("Insert failed");
      const brand = rowToBrand(row);
      setBrands((prev) => [...prev, brand]);
      setActiveBrandIdState((prev) => prev ?? brand.id);
      return brand;
    },
    []
  );

  const updateBrand = useCallback(
    async (id: string, data: Partial<Omit<Brand, "id" | "createdAt">>) => {
      const patch: Record<string, unknown> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.handle !== undefined) patch.handle = data.handle ?? null;
      if (data.niche !== undefined) patch.niche = data.niche;
      if (data.platforms !== undefined) patch.platforms = data.platforms;
      if (data.targetAudience !== undefined) patch.target_audience = data.targetAudience;
      if (data.positioning !== undefined) patch.positioning = data.positioning ?? null;
      if (data.mission !== undefined) patch.mission = data.mission ?? null;
      if (data.vision !== undefined) patch.vision = data.vision ?? null;
      if (data.brandVoice !== undefined) patch.brand_voice = data.brandVoice;
      if (data.strategy !== undefined) {
        const s = data.strategy;
        patch.hero_description      = s?.heroDescription      ?? null;
        patch.external_problem      = s?.externalProblem      ?? null;
        patch.internal_problem      = s?.internalProblem      ?? null;
        patch.philosophical_problem = s?.philosophicalProblem ?? null;
        patch.guide_role            = s?.guideRole            ?? null;
        patch.three_step_plan       = s?.threeStepPlan        ?? null;
        patch.direct_cta            = s?.directCta            ?? null;
        patch.transitional_cta      = s?.transitionalCta      ?? null;
        patch.stakes                = s?.stakes               ?? null;
        patch.transformation        = s?.transformation       ?? null;
        patch.content_pillars       = s?.contentPillars       ?? null;
        patch.storytelling_angle    = s?.storytellingAngle    ?? null;
        patch.posting_cadence       = s?.postingCadence       ?? null;
      }

      const { data: row, error } = await supabase
        .from("brands")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error || !row) throw error ?? new Error("Update failed");
      const updated = rowToBrand(row);
      setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)));
    },
    []
  );

  const deleteBrand = useCallback(async (id: string) => {
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) throw error;
    setBrands((prev) => {
      const next = prev.filter((b) => b.id !== id);
      setActiveBrandIdState((current) => {
        if (current !== id) return current;
        return next[0]?.id ?? null;
      });
      return next;
    });
  }, []);

  const setActiveBrandId = useCallback((id: string) => {
    setActiveBrandIdState(id);
  }, []);

  const activeBrand =
    brands.find((b) => b.id === activeBrandId) ?? brands[0] ?? null;

  return (
    <BrandsContext.Provider
      value={{
        brands,
        activeBrand,
        setActiveBrandId,
        addBrand,
        updateBrand,
        deleteBrand,
      }}
    >
      {children}
    </BrandsContext.Provider>
  );
}

export function useBrands() {
  const ctx = useContext(BrandsContext);
  if (!ctx) throw new Error("useBrands must be used within BrandsProvider");
  return ctx;
}
