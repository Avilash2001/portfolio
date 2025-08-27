"use client";
import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const ParallaxHero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 60]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand.purple/15 via-brand.pink/10 to-brand.yellow/15 dark:from-brand.purple/25 dark:via-brand.pink/15 dark:to-brand.yellow/25 p-8 md:p-12 border border-black/10 dark:border-white/10">
      <motion.div style={{ y: y2 }} className="max-w-xl">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Hey I am <span className="gradient-text">Avilash</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl opacity-80">
          Senior Full Stack Developer · UI/UX Designer · Digital Marketer
        </p>
      </motion.div>
      <motion.div style={{ y: y1 }} className="absolute right-6 top-0">
        <Image
          src="/face2.svg"
          alt="Hero"
          width={200}
          height={200}
          className="rounded-[2rem] shadow-soft"
        />
      </motion.div>
    </div>
  );
};

export default ParallaxHero;
