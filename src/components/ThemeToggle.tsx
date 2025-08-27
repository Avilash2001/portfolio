"use client";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored =
      localStorage.getItem("theme") || (prefers ? "dark" : "light");
    document.documentElement.classList.toggle("dark", stored === "dark");
    setDark(stored === "dark");
  }, []);

  if (!mounted) return null;

  return (
    <button
      aria-label="Toggle theme"
      className="rounded-full p-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
      onClick={() => {
        const next = !dark;
        setDark(next);
        localStorage.setItem("theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
