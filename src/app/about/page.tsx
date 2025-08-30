import Image from "next/image";
import React from "react";

const AboutPage = () => {
  const specialties = [
    {
      title: "Software Developer",
      text: "I like to code things from scratch, and enjoy bringing ideas to life.",
    },
    {
      title: "UI/UX Designer",
      text: "I value simple content structure, clean design and thoughtful interactions.",
    },
    {
      title: "Digital Marketer",
      text: "I genuinely care about people, and enjoy helping them work on their craft.",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-10 justify-evenly items-center px-8 sm:px-16 pt-24 lg:mt-0">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <p className="text-5xl">Nice to meet you!</p>
          <p className="text-lg">
            Since beginning my journey 6 years ago, I&apos;ve done remote work
            for agencies, worked in startups, and collaborated with talented
            people to design, create & market digital products for both business
            and consumer use. I&apos;m quietly confident, naturally curious, and
            perpetually working on improving my chops.
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-5xl">My specialties?</p>
          <div className="flex gap-5">
            {specialties.map(({ text, title }) => (
              <div key={text}>
                <p className="gradient-text text-xl font-bold">{title}</p>
                <p className="text-lg">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Image
        src="/face2.svg"
        alt="My SVG"
        width={400}
        height={400}
        className="scale-x-[-1]"
      />
    </div>
  );
};

export default AboutPage;
