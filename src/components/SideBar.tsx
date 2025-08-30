import Image from "next/image";
import React from "react";

const SideBar = () => {
  const socialMedia = [
    {
      name: "facebook",
      url: "https://www.facebook.com/",
    },
    {
      name: "instagram",
      url: "https://www.instagram.com/",
    },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/",
    },
    {
      name: "github",
      url: "https://www.github.com/",
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
        />
      ))}
    </div>
  );
};

export default SideBar;
