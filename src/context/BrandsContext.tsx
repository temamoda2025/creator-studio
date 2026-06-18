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
