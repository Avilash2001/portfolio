import React from "react";
import Image from "next/image";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

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
    <nav className="sticky top-0 z-50 flex items-center justify-between h-24 px-8 sm:px-16">
      <Link href={"/"}>
        <Image
          className="cursor-pointer h-10 sm:h-12 w-fit"
          src="/logo.svg"
          alt="My SVG"
          width={400}
          height={400}
        />
      </Link>

      <MenuIcon color="white" className="lg:hidden" />

      <div className="hidden lg:flex gap-10">
        {headerItems.map((item) => (
          <Link
            className="text-xl cursor-pointer font-semibold hover:bg-gradient-to-r hover:from-[#FFCA30] hover:via-[#FF01A2] hover:to-[#B94DDC] hover:bg-clip-text hover:text-transparent"
            key={item.name}
            href={item.link}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Header;
