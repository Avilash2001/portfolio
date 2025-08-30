import { Skill } from "@/lib/types";
import Image from "next/image";
import React from "react";

const Progressbar: React.FC<{ percentage: number; color?: string }> = ({
  percentage,
  color = "#E44D26",
}) => {
  return (
    <div className="relative pt-1">
      <div className="overflow-hidden h-2 text-xs flex rounded bg-[#D9D9D9]">
        <div
          style={{ width: `${percentage}%`, background: color }}
          className={`shadow-none flex flex-col text-center whitespace-nowrap text-red justify-center`}
        ></div>
      </div>
    </div>
  );
};

const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
  const { title, percentage, color, icon, iconBorder = false } = skill;
  return (
    <div className="flex w-full items-center justify-between gap-[20px]">
      <div className="w-full">
        {title}
        <Progressbar percentage={percentage} color={color} />
      </div>
      {!iconBorder ? (
        <Image
          src={icon}
          alt={title}
          width={300}
          height={300}
          className="h-10 w-10"
        />
      ) : (
        <div className="min-w-10 min-h-10 rounded-full bg-white flex items-center justify-center">
          <Image
            src={icon}
            alt={title}
            width={300}
            height={300}
            className="h-8 w-8"
          />
        </div>
      )}
    </div>
  );
};

export default SkillCard;
