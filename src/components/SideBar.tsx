"use client";
import Image from "next/image";
import React from "react";

const SideBar = () => {
  const socialMedia = [
    {
      name: "facebook",
      url: "https://www.facebook.com/avilash2001",
    },
    {
      name: "instagram",
      url: "https://www.instagram.com/smotato.ts",
    },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/avilashg",
    },
    {
      name: "github",
      url: "https://github.com/Avilash2001",
    },
  ];
  return (
    <div className="absolute h-full top-0 left-0 hidden xl:flex flex-col items-center justify-center pl-16 gap-[40px]">
      {socialMedia.map((item) => (
        <Image
          key={item.name}
          style={{
            cursor: "pointer",
          }}
          src={`${item.name}.svg`}
          alt="My SVG"
          width={20}
          height={20}
          onClick={() => {
            window.open(item.url, "_blank");
          }}
        />
      ))}
    </div>
  );
};

export default SideBar;
