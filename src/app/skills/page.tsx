"use client";
import SkillCard from "@/components/SkillCard";
import Transition from "@/components/Transition";
import { skillList } from "@/lib/data";
import { Job } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";

const JOBS: Job[] = [
  "Software Developer",
  "UI/UX Designer",
  "Digital Marketer",
];

const SkillsPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const selectedJob = JOBS[currentIndex];

  const changeJob = (direction: "left" | "right") => {
    if (direction === "left") {
      setCurrentIndex((prev) => (prev - 1 + JOBS.length) % JOBS.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % JOBS.length);
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col items-center justify-start gap-4 xl:gap-10 mb-10">
        <p className="text-xl font-medium shrink-0">My skills as a</p>

        <div className="relative h-[40px] w-full max-w-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute left-0 w-[50px] h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 w-[50px] h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          <div
            className="absolute left-2 z-20 cursor-pointer hover:scale-110 transition-transform opacity-50 hover:opacity-100"
            onClick={() => changeJob("left")}
          >
            <ChevronLeft color="white" size={30} />
          </div>

          <div className="relative w-full h-full flex justify-center items-center">
            {JOBS.map((job, index) => {
              let offset = index - currentIndex;
              if (offset === -2) offset = 1;
              if (offset === 2) offset = -1;

              const isActive = offset === 0;

              return (
                <motion.div
                  key={job}
                  className="absolute flex items-center justify-center cursor-pointer"
                  initial={false}
                  animate={{
                    x: offset * 250,
                    scale: isActive ? 1 : 0.6,
                    opacity: isActive ? 1 : 0.2,
                    zIndex: isActive ? 10 : 0,
                    rotateY: offset * -25,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  onClick={() => {
                    if (offset === -1) changeJob("left");
                    if (offset === 1) changeJob("right");
                  }}
                >
                  <span
                    className={`font-bold text-center whitespace-nowrap transition-colors duration-300 ${
                      isActive
                        ? "text-3xl md:text-5xl gradient-text"
                        : "text-2xl text-white"
                    }`}
                  >
                    {job}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div
            className="absolute right-2 z-20 cursor-pointer hover:scale-110 transition-transform opacity-50 hover:opacity-100"
            onClick={() => changeJob("right")}
          >
            <ChevronRight color="white" size={30} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[40px] mt-[20px]">
        {skillList[selectedJob].map((skill, index) => (
          <Transition
            key={`${selectedJob}-${skill.title}`}
            pos={10}
            delay={index / 10}
            direction={index % 2 === 0 ? "ltr" : "rtl"}
            type="spring"
          >
            <SkillCard key={index} skill={skill} />
          </Transition>
        ))}
      </div>
    </div>
  );
};

export default SkillsPage;
