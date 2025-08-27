"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";

const LogosMarquee = () => {
  const logos = [
    "react",
    "nextjs",
    "node",
    "ts",
    "aws",
    "gcp",
    "figma",
    "docker",
  ];

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    console.log({ el });
    if (!el) return;
    const allImages = el.querySelectorAll("img");
    allImages.forEach((img) => {
      el.appendChild(img.cloneNode(true));
    });
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
      <div className="flex gap-12 p-6 animate-[marquee_20s_linear_infinite]">
        <style>{`@keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
        <div className="flex gap-12 items-center" ref={ref}>
          {logos.map((l) => (
            <Image
              key={l}
              src={`/logos/${l}.svg`}
              alt={l}
              className="h-10 opacity-70"
              height={100}
              width={100}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogosMarquee;
