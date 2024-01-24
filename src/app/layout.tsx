import type { Metadata } from "next";
import { Darker_Grotesque } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";

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
    <html lang="en">
      <body className={font.className}>
        <div className="h-full w-full relative">
          <Header />
          <SideBar />
          {children}
        </div>
      </body>
    </html>
  );
}
