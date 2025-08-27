import Navbar from "@/components/Navbar";
import "./globals.css";
import type { Metadata } from "next";
import { Darker_Grotesque } from "next/font/google";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";

const grotesque = Darker_Grotesque({
  subsets: ["latin"],
  variable: "--font-darker-grotesque",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title:
    "Avilash Ghosh — Senior Full Stack Developer, UI/UX Designer, Digital Marketer",
  description: "I am a smart potato that builds anything you desire.",
  openGraph: {
    title: "Avilash Ghosh",
    description: "I am a smart potato that builds anything you desire.",
    url: "https://avilash.org",
    siteName: "Avilash Ghosh",
    images: [{ url: "/Hero.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Avilash Ghosh",
    description: "I am a smart potato that builds anything you desire.",
    images: ["/Hero.png"],
  },
  metadataBase: new URL("https://avilash.org"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={grotesque.variable}>
      <body className="bg-white text-black dark:bg-black dark:text-white font-grotesque antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
