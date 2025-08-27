"use client";
import React from "react";

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-black/10 dark:border-white/10 py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm opacity-70">
        © {new Date().getFullYear()} Avilash Ghosh. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
