"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useBrands } from "@/context/BrandsContext";

export default function Nav() {
  const pathname = usePathname();
  const { brands, activeBrand, setActiveBrandId } = useBrands();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { href: "/brands", label: "Brands" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-sm tracking-widest uppercase shrink-0">
          Tema Moda
        </Link>

        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "text-black font-medium"
                  : "text-black/50 hover:text-black"
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Brand switcher */}
          {brands.length > 0 && (
            <div ref={switcherRef} className="relative">
              <button
                onClick={() => setSwitcherOpen((o) => !o)}
                className="flex items-center gap-1.5 text-sm border border-black/15 px-3 py-1.5 rounded-full hover:border-black/40 transition-colors max-w-40"
              >
                <span className="truncate font-medium text-sm">
                  {activeBrand?.name ?? "Select brand"}
                </span>
                <svg
                  className={`shrink-0 w-3.5 h-3.5 text-black/40 transition-transform ${switcherOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {switcherOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-black/10 shadow-md min-w-48 py-1 z-50">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => {
                        setActiveBrandId(brand.id);
                        setSwitcherOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-black/4 transition-colors flex items-center justify-between gap-3 ${
                        activeBrand?.id === brand.id
                          ? "text-black font-medium"
                          : "text-black/60"
                      }`}
                    >
                      <span className="truncate">{brand.name}</span>
                      {activeBrand?.id === brand.id && (
                        <svg className="shrink-0 w-3.5 h-3.5 text-black" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-black/8 mt-1 pt-1">
                    <Link
                      href="/brands"
                      onClick={() => setSwitcherOpen(false)}
                      className="block px-4 py-2 text-xs text-black/40 hover:text-black transition-colors"
                    >
                      Manage brands →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {brands.length === 0 && (
            <Link
              href="/brands"
              className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-black/80 transition-colors"
            >
              Add Brand
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
