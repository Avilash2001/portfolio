"use client";
import React from "react";
import { Card, CardTitle } from "./ui/card";
import Image from "next/image";
import Link from "next/link";

const ProjectCard: React.FC<{
  title: string;
  summary: string;
  href?: string;
  image?: string;
}> = ({ title, summary, href = "#", image = "/project-placeholder.png" }) => {
  return (
    <Card className="flex flex-col md:flex-row gap-6 items-center">
      <Image
        src={image}
        width={520}
        height={320}
        alt={title}
        className="rounded-2xl object-cover"
      />
      <div>
        <CardTitle>{title}</CardTitle>
        <p className="mb-4">{summary}</p>
        <Link href={href} className="underline underline-offset-4">
          View more →
        </Link>
      </div>
    </Card>
  );
};

export default ProjectCard;
