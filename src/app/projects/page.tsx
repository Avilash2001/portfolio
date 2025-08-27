import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import React from "react";

const Projects = () => {
  const demos = [
    {
      title: "StoryVerse Land",
      summary:
        "Personalized children’s storybooks storefront with regional inventory, multi-lang & fast UX.",
      image: "/logos/nextjs.svg",
    },
    {
      title: "Hackathon Hunter",
      summary:
        "Discord bot that aggregates hackathons & meetups with Kolkata filters and alerts.",
      image: "/logos/nextjs.svg",
    },
    {
      title: "Wordle Clone",
      summary:
        "Next.js + TS + Tailwind clone matching animations and flip delays.",
      image: "/logos/nextjs.svg",
    },
    {
      title: "Cloud Watermarker",
      summary:
        "Social media app that auto-watermarks images via Cloudflare workers.",
      image: "/logos/nextjs.svg",
    },
    {
      title: "RBAC API",
      summary:
        "NestJS backend with Supabase auth, RLS, and role-based route guards.",
      image: "/logos/nextjs.svg",
    },
  ];

  return (
    <div className="py-10 space-y-10">
      <Reveal>
        <h1 className="text-4xl font-bold">Projects</h1>
      </Reveal>
      <div className="space-y-6">
        {demos.map((p) => (
          <Reveal key={p.title}>
            <ProjectCard {...p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default Projects;
