"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const ALL_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Flute Gandharvas",
    icon: "/projects/FG.png",
    color: "#1677BD",
    description: "Flute learning platform",
  },
  {
    id: "2",
    name: "AI Fiesta",
    icon: "/projects/AF.png",
    color: "#4EB97B",
    description: "All AI in one place",
  },
  {
    id: "3",
    name: "Fanfix",
    icon: "/projects/FFC.png",
    color: "#E9AFE2",
    description: "Premium content platform",
  },
  {
    id: "4",
    name: "StoryVerse Land",
    icon: "/projects/SVL.png",
    color: "#3B85FE",
    description: "Personalised book e store",
  },
  {
    id: "5",
    name: "Stymconnect",
    icon: "/projects/SC.png",
    color: "#FF532D",
    description: "Version control for musicians",
  },
  {
    id: "6",
    name: "Tagmango Level Up",
    icon: "/projects/TM.png",
    color: "#F19626",
    description: "Gamified self improvement platform for creator audiences",
  },
  {
    id: "7",
    name: "IWAA Awards",
    icon: "/projects/IWAA.png",
    color: "#874F1F",
    description: "Award show platform",
  },
  {
    id: "8",
    name: "Mio Amore",
    icon: "/projects/MA.png",
    color: "#97167B",
    description: "Confectioneries e-commerce platform",
  },
  {
    id: "9",
    name: "Recipe Cup",
    icon: "/projects/RC.png",
    color: "#EF3451",
    description: "Food delivery app",
  },
  {
    id: "10",
    name: "Zorrro",
    icon: "/projects/ZOR.png",
    color: "#AD7F59",
    description: "Logistical delivery app",
  },
];

const chunkArray = (array: Project[], size: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const OrbitalRing: React.FC<{
  radius: number;
  direction: "clockwise" | "counter-clockwise";
  duration: number;
  delay: number;
  children: React.ReactNode;
}> = ({ radius, direction, duration, delay, children }) => {
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-600 pointer-events-none"
      style={{
        width: radius * 2,
        height: radius * 2,
      }}
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ rotate: direction === "clockwise" ? 360 : -360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: duration,
          delay: delay || 0,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const ProjectNode: React.FC<{
  project: Project;
  angle: number;
  radius: number;
  direction: "clockwise" | "counter-clockwise";
  duration: number;
  delay: number;
}> = ({ project, angle, radius, direction, duration, delay }) => {
  return (
    <div
      className="absolute top-1/2 left-1/2 pointer-events-auto cursor-pointer"
      style={{
        transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
        width: "3rem",
        height: "3rem",
        marginTop: "-1.5rem",
        marginLeft: "-1.5rem",
      }}
    >
      <motion.div
        className="relative group w-full h-full"
        animate={{ rotate: direction === "clockwise" ? -360 : 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: duration,
          delay: delay,
        }}
      >
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 whitespace-nowrap">
          <div className="bg-primary text-white text-xs px-2 py-1 rounded shadow-lg border border-secondary">
            <p className="font-bold">{project.name}</p>
            <p className="text-[10px] text-slate-300">{project.description}</p>
          </div>
        </div>

        <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-125">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#ffca30] via-[#ff01a2] to-[#b94ddc] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="relative w-full h-full rounded-full shadow-sm flex items-center justify-center">
            <Image
              src={project.icon}
              alt={project.name}
              width={200}
              height={200}
              className="object-contain rounded-full h-full w-full"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProjectsPage = () => {
  const orbits = useMemo(() => chunkArray(ALL_PROJECTS, 3), []);

  const BASE_RADIUS = 120;
  const RING_GAP = 60;
  const BASE_DURATION = 20;

  return (
    <div className="w-full pb-10">
      <p className="text-xl md:text-3xl text-center mb-8 md:mb-0">
        Projects I have{" "}
        <span className="gradient-text font-semibold">designed</span>,{" "}
        <span className="gradient-text font-semibold">created</span> &{" "}
        <span className="gradient-text font-semibold">marketed</span> in
      </p>

      <div className="hidden md:flex w-full flex-col items-center justify-center overflow-hidden font-sans relative">
        <div className="relative w-[700px] h-[700px] flex items-center justify-center scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform duration-500">
          <div className="relative z-20">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#ffca30] via-[#ff01a2] to-[#b94ddc] rounded-full blur-2xl"
              animate={{ scale: [0.5, 0.7, 0.5], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="w-32 shadow-2xl relative overflow-hidden flex items-center justify-center z-20">
              <Image
                src="/face2.svg"
                alt="My SVG"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
          </div>

          {orbits.map((chunk, ringIndex) => {
            const direction =
              ringIndex % 2 === 0 ? "clockwise" : "counter-clockwise";
            const radius = BASE_RADIUS + ringIndex * RING_GAP;
            const duration = BASE_DURATION + ringIndex * 20;
            const delay = ringIndex * -2;

            return (
              <OrbitalRing
                key={ringIndex}
                radius={radius}
                direction={direction}
                duration={duration}
                delay={delay}
              >
                {chunk.map((project, itemIndex) => {
                  const angleStep = 360 / chunk.length;
                  const angle = itemIndex * angleStep;

                  return (
                    <ProjectNode
                      key={project.id}
                      project={project}
                      angle={angle}
                      radius={radius}
                      direction={direction}
                      duration={duration}
                      delay={delay}
                    />
                  );
                })}
              </OrbitalRing>
            );
          })}
        </div>
      </div>

      <div className="flex md:hidden flex-col items-center w-full px-4 py-8 relative z-10">
        <div className="relative mb-12">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#ffca30] via-[#ff01a2] to-[#b94ddc] rounded-full blur-xl"
            animate={{ opacity: 0.2 }}
          />
          <div className="w-32 shadow-2xl relative overflow-hidden flex items-center justify-center z-20">
            <Image
              src="/face2.svg"
              alt="My SVG"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
        </div>

        <div className="relative w-full max-w-sm">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent -translate-x-1/2 border-l border-dashed border-gray-700"></div>

          <div className="space-y-12 relative">
            {ALL_PROJECTS.map((project, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center ${
                    isEven ? "flex-row" : "flex-row-reverse"
                  } relative`}
                >
                  <div
                    className={`w-[45%] ${
                      isEven ? "text-right pr-4" : "text-left pl-4"
                    }`}
                  >
                    <h3 className="font-bold text-sm truncate text-white">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-[10px] leading-tight mt-1">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex justify-center relative z-10">
                    <div className="w-14 h-14 rounded-full relative flex items-center justify-center">
                      <Image
                        src={project.icon}
                        alt={project.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  <div className="w-[45%]"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
