"use client";
import SkillCard from "@/components/SkillCard";
import Transition from "@/components/Transition";
import useIsMobile from "@/hooks/useIsMobile";
import { skillList } from "@/lib/data";
import { Job } from "@/lib/types";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import React, { useEffect, useState } from "react";

const SkillsPage = () => {
  const [selectedJob, setSelectedJob] = useState<Job>("Software Developer");
  const [isRotating, setIsRotating] = useState<boolean>(true);

  const isMobile = useIsMobile();

  const changeRob = (dir: "up" | "down") => {
    switch (selectedJob) {
      case "Software Developer":
        setSelectedJob(dir == "up" ? "UI/UX Designer" : "Digital Marketer");
        break;
      case "UI/UX Designer":
        setSelectedJob(dir == "up" ? "Digital Marketer" : "Software Developer");
        break;
      case "Digital Marketer":
        setSelectedJob(dir == "up" ? "Software Developer" : "UI/UX Designer");
        break;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRotating && !isMobile) changeRob("down");
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob, isRotating, isMobile]);

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col md:flex-row items-center gap-3">
        <p className="text-3xl md:text-5xl">My skills as a </p>
        <div className="flex gap-2">
          <ChevronLeft
            color="white"
            className="md:hidden cursor-pointer self-end "
            size={"30px"}
            onClick={() => changeRob("up")}
          />
          <Transition key={selectedJob} direction="ttb" pos={20}>
            <p
              className="text-3xl md:text-5xl gradient-text font-bold cursor-pointer inline-flex items-center gap-2 "
              onClick={() => setIsRotating((prev) => !prev)}
            >
              {selectedJob}
            </p>
          </Transition>
          <ChevronRight
            color="white"
            className="md:hidden cursor-pointer self-end"
            size={"30px"}
            onClick={() => changeRob("up")}
          />
        </div>
        {isRotating ? (
          <Pause
            fill="white"
            className="hidden md:block cursor-pointer self-end"
            size={"16px"}
            onClick={() => setIsRotating((prev) => !prev)}
          />
        ) : (
          <Play
            fill="white"
            className="hidden md:block cursor-pointer self-end"
            size={"16px"}
            onClick={() => setIsRotating((prev) => !prev)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[40px] mt-[40px]">
        {skillList[selectedJob].map((skill, index) => (
          <Transition
            key={skill.title}
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
