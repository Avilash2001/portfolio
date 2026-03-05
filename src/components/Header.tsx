"use client";
import React, { useRef } from "react";
import Image from "next/image";
import {
  Cog,
  Contact,
  Download,
  FolderKanban,
  Gamepad,
  MenuIcon,
  User,
} from "lucide-react";
import Link from "next/link";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";

const Header = () => {
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);

  const headerItems = [
    {
      name: "About Me",
      link: "/about",
      icon: <User size={"20px"} />,
    },
    {
      name: "Skills",
      link: "/skills",
      icon: <Cog size={"20px"} />,
    },
    {
      name: "Projects",
      link: "/projects",
      icon: <FolderKanban size={"20px"} />,
    },
    {
      name: "Contact Me",
      link: "/contact",
      icon: <Contact size={"20px"} />,
    },
    {
      name: "Arcade",
      link: "/arcade",
      icon: <Gamepad size={"20px"} />,
    },
  ];

  const handleDrawerClose = () => {
    drawerTriggerRef.current?.click();
  };

  return (
    <nav className="flex items-center justify-between h-24 px-8 sm:px-16">
      <Link href={"/"}>
        <Image
          className="cursor-pointer h-8 sm:h-12 w-fit"
          src="/logo.svg"
          alt="My SVG"
          width={400}
          height={400}
        />
      </Link>

      <Drawer>
        <DrawerTrigger ref={drawerTriggerRef}>
          <MenuIcon color="white" className="lg:hidden" />
        </DrawerTrigger>
        <DrawerContent className="bg-[#0f0f0f] border-[#0f0f0f]">
          <div className="grid grid-cols-2 p-4 gap-4">
            {headerItems.map((item) => (
              <Link
                className="cursor-pointer font-semibold w-full gradient-border p-6 flex items-center justify-center rounded-xl gap-3"
                key={item.name}
                href={item.link}
                onClick={handleDrawerClose}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <a
              href="/resume.pdf"
              download="Avilash_Ghosh_Resume.pdf"
              className="cursor-pointer font-semibold w-full gradient-border p-6 flex items-center justify-center rounded-xl gap-3"
              onClick={handleDrawerClose}
            >
              <Download size={20} />
              Resume
            </a>
          </div>
        </DrawerContent>
      </Drawer>

      <div className="hidden lg:flex items-center gap-10">
        {headerItems.map((item) => (
          <Link
            className="text-xl cursor-pointer font-semibold hover:bg-gradient-to-r hover:from-[#FFCA30] hover:via-[#FF01A2] hover:to-[#B94DDC] hover:bg-clip-text hover:text-transparent"
            key={item.name}
            href={item.link}
          >
            {item.name}
          </Link>
        ))}
        <a
          href="/resume.pdf"
          download="Avilash_Ghosh_Resume.pdf"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-white/20 hover:border-white/50 transition-colors"
        >
          <Download size={16} />
          Resume
        </a>
      </div>
    </nav>
  );
};

export default Header;
