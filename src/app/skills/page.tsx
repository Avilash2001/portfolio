"use client";
import SkillCard from "@/components/SkillCard";
import Transition from "@/components/Transition";
import { skillList } from "@/lib/data";
import { Job } from "@/lib/types";
import { Pause, Play } from "lucide-react";
import React, { useEffect, useState } from "react";

const SkillsPage = () => {
  const [selectedJob, setSelectedJob] = useState<Job>("Software Developer");
  const [isRotating, setIsRotating] = useState<boolean>(true);

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
      if (isRotating) changeRob("down");
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob, isRotating]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <p className="text-3xl sm:text-5xl">My skills as a </p>
        <Transition key={selectedJob} direction="ttb" pos={20}>
          <p
            className="text-3xl sm:text-5xl gradient-text font-bold cursor-pointer inline-flex items-center gap-2 "
            onClick={() => setIsRotating((prev) => !prev)}
          >
            {selectedJob}
          </p>
        </Transition>{" "}
        {isRotating ? (
          <Pause
            fill="white"
            className="cursor-pointer self-end"
            size={"16px"}
            onClick={() => setIsRotating((prev) => !prev)}
          />
        ) : (
          <Play
            fill="white"
            className="cursor-pointer self-end"
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
