"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/skills", label: "Skills" },
    { href: "/projects", label: "Projects" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-white/60 dark:bg-black/40 border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo-small.png"
            width={32}
            height={32}
            alt="logo"
            className="rounded-xl"
          />
          <span className="font-semibold">Avilash</span>
        </Link>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              className={cn(
                "text-sm opacity-80 hover:opacity-100 transition-opacity",
                pathname === l.href &&
                  "opacity-100 font-semibold underline underline-offset-4"
              )}
              href={l.href}
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
