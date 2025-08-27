"use client";
import LogosMarquee from "@/components/LogosMarquee";
import MagneticButton from "@/components/MagneticButton";
import ParallaxHero from "@/components/ParallaxHero";
import Reveal from "@/components/Reveal";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24 py-10">
      <ParallaxHero />
      <div className="flex gap-4">
        <MagneticButton asChild>
          <Link href="/about">Get to know me</Link>
        </MagneticButton>
        <MagneticButton variant="outline" asChild>
          <Link href="/projects">View Projects</Link>
        </MagneticButton>
      </div>

      <Reveal>
        <LogosMarquee />
      </Reveal>

      <Reveal>
        <blockquote className="text-lg md:text-xl opacity-90">
          “Some people can read <em>War and Peace</em> and come away thinking
          it&apos;s a simple adventure story. Others can read the ingredients on
          a chewing gum wrapper and unlock the secrets of the universe.”
          <span className="block mt-2 opacity-70">— Lex Luthor</span>
        </blockquote>
      </Reveal>
    </div>
  );
}
