"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/brand", label: "Brand" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-sm tracking-widest uppercase">
          Tema Moda
        </Link>
        <div className="flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                pathname === href
                  ? "text-black font-medium"
                  : "text-black/50 hover:text-black"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/onboarding"
            className="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-black/80 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
