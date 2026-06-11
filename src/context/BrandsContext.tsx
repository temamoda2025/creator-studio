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

interface BrandsContextValue {
  brands: Brand[];
  activeBrand: Brand | null;
  setActiveBrandId: (id: string) => void;
  addBrand: (data: Omit<Brand, "id" | "createdAt" | "updatedAt">) => Brand;
  updateBrand: (id: string, data: Partial<Omit<Brand, "id" | "createdAt">>) => void;
  deleteBrand: (id: string) => void;
}

const BrandsContext = createContext<BrandsContextValue | null>(null);

export function BrandsProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrandId, setActiveBrandIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("agency_brands");
    const activeId = localStorage.getItem("agency_active_brand_id");
    if (raw) {
      try {
        setBrands(JSON.parse(raw));
      } catch {
        // ignore malformed data
      }
    }
    if (activeId) setActiveBrandIdState(activeId);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("agency_brands", JSON.stringify(brands));
  }, [brands, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (activeBrandId) {
      localStorage.setItem("agency_active_brand_id", activeBrandId);
    } else {
      localStorage.removeItem("agency_active_brand_id");
    }
  }, [activeBrandId, hydrated]);

  const addBrand = useCallback(
    (data: Omit<Brand, "id" | "createdAt" | "updatedAt">): Brand => {
      const now = new Date().toISOString();
      const brand: Brand = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      setBrands((prev) => [...prev, brand]);
      setActiveBrandIdState((prev) => prev ?? brand.id);
      return brand;
    },
    []
  );

  const updateBrand = useCallback(
    (id: string, data: Partial<Omit<Brand, "id" | "createdAt">>) => {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, ...data, updatedAt: new Date().toISOString() }
            : b
        )
      );
    },
    []
  );

  const deleteBrand = useCallback((id: string) => {
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
