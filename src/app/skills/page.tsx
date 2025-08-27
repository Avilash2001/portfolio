import Reveal from "@/components/Reveal";
import SkillTitle from "@/components/SkillTitle";
import React from "react";

const Skills = () => {
  const categories: { title: string; items: string[] }[] = [
    {
      title: "Senior Full Stack Developer",
      items: [
        "HTML",
        "CSS",
        "JS",
        "TS",
        "React Js",
        "Next Js",
        "Vue Js",
        "React Native",
        "Node",
        "Express",
        "Nest JS",
        "PHP",
        "Laravel",
        "Symfony",
        "Sql",
        "MongoDB",
        "AWS",
        "GCP",
        "C/C++",
        "Java",
        "Python",
        "Django",
        "GraphQL",
        "Docker",
      ],
    },
    {
      title: "UI/UX Designer",
      items: [
        "Figma",
        "Adobe XD",
        "Adobe Photoshop",
        "Adobe Illustrator",
        "Filmora",
        "Adobe Premier",
      ],
    },
    {
      title: "Digital Marketer",
      items: [
        "Wordpress",
        "SEO",
        "SEM",
        "Google Adsense",
        "Google Adwords",
        "Google Analytics",
        "Facebook Marketing",
        "Instagram Marketing",
        "Youtube Marketing",
        "Mailchimp",
        "Affiliate Marketing",
      ],
    },
  ];

  return (
    <div className="py-10 space-y-10">
      <Reveal>
        <h1 className="text-4xl font-bold">Skills</h1>
      </Reveal>
      {categories.map((cat) => (
        <section key={cat.title} className="space-y-4">
          <Reveal>
            <h2 className="text-2xl font-semibold">{cat.title}</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cat.items.map((i) => (
              <SkillTitle key={i} label={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Skills;
