import Reveal from "@/components/Reveal";
import Image from "next/image";
import React from "react";

const AboutMe = () => {
  return (
    <div className="py-10 space-y-10">
      <Reveal>
        <h1 className="text-4xl font-bold">Nice to meet you!</h1>
      </Reveal>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Reveal>
          <p className="text-lg opacity-80">
            Since beginning my journey 5 years ago, I&apos;ve done remote work
            for agencies, worked in startups, and collaborated with talented
            people to design, create &amp; market digital products for both
            business and consumer use. I&apos;m quietly confident, naturally
            curious, and perpetually working on improving my chops.
          </p>
        </Reveal>
        <Reveal>
          <Image
            src="/face2.svg"
            alt="Avilash"
            width={520}
            height={520}
            className="rounded-3xl shadow-soft"
          />
        </Reveal>
      </div>
      <Reveal>
        <h2 className="text-2xl font-semibold mt-6">The longer story</h2>
        <p className="opacity-75">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          placerat, nisl nec tristique volutpat, arcu ligula iaculis magna, et
          tempor nulla lorem nec justo. (Replace with your real story.)
        </p>
      </Reveal>

      <Reveal>
        <h3 className="text-xl font-semibold mt-6">Hobbies</h3>
        <ul className="flex flex-wrap gap-3">
          {[
            "Art",
            "Gaming",
            "Riding",
            "Swimming",
            "Table Tennis",
            "Cricket",
            "Reading",
            "Writing",
            "Building stuff",
          ].map((h) => (
            <li key={h} className="glass px-3 py-1.5 rounded-xl text-sm">
              {h}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
};

export default AboutMe;
