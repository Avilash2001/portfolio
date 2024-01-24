import React from "react";
import Image from "next/image";
import { MenuIcon } from "lucide-react";

const Header = () => {
  const headerItems = [
    {
      name: "About Me",
      link: "/about",
    },
    {
      name: "Skills",
      link: "/skills",
    },
    {
      name: "Projects",
      link: "/projects",
    },
    {
      name: "Contact Me",
      link: "/contact",
    },
  ];

  return (
    <div className="absolute w-full flex items-center justify-between h-24 px-8 sm:px-16">
      <Image
        className="cursor-pointer h-10 sm:h-12 w-fit"
        src="/logo.svg"
        alt="My SVG"
        width={400}
        height={400}
      />

      <MenuIcon color="white" className="lg:hidden" />

      <div className="hidden lg:flex gap-10">
        {headerItems.map((item) => (
          <p
            style={{
              fontSize: "24px",
              cursor: "pointer",
            }}
            key={item.name}
          >
            {item.name}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Header;
