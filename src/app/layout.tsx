import type { Metadata } from "next";
import { Darker_Grotesque } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import Transition from "@/components/Transition";

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
      <body>
        <Header />
        <SideBar />
        <main className="mx-auto max-w-7xl px-8 sm:px-16">
          <Transition>{children}</Transition>
        </main>
      </body>
    </html>
  );
}
