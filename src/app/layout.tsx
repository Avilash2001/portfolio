import type { Metadata } from "next";
import { Darker_Grotesque } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import Transition from "@/components/Transition";
import StarBackgroundDeflect from "@/components/StarBackgroundDeflect";
import SpaceshipCursor from "@/components/SpaceshipCursor"; // Import
import StarBackgroundDistort from "@/components/StarBackgroundDistort";

const font = Darker_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Avilash Ghosh",
  description: "Personal website of Avilash Ghosh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={font.className}>
      <body className="relative min-h-screen text-white max-w-[100vw]">
        {/* <body className="relative min-h-screen text-white max-w-[100vw] cursor-none selection:bg-cyan-500/30"> */}
        {/* <SpaceshipCursor /> */}
        {/* <StarBackgroundDeflect /> */}
        <StarBackgroundDistort />
        <div className="relative z-10 h-full">
          <Header />
          <SideBar />
          <main className="mx-auto max-w-7xl px-8 sm:px-16">
            <Transition>{children}</Transition>
          </main>
        </div>
      </body>
    </html>
  );
}
