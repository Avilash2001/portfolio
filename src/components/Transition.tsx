"use client";
import { AnimatePresence, AnimationGeneratorType, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

type Direction = "rtl" | "ltr" | "ttb" | "btt";

const Transition: React.FC<{
  children: React.ReactNode;
  key?: string;
  direction?: Direction;
  pos?: number;
  delay?: number;
  type?: AnimationGeneratorType;
}> = ({
  key,
  children,
  direction = "ltr",
  pos = 200,
  delay = 0,
  type = "spring",
}) => {
  const pathname = usePathname();
  const directionOffsets: Record<Direction, { x: number; y: number }> = {
    ltr: { x: -pos, y: 0 },
    rtl: { x: pos, y: 0 },
    ttb: { x: 0, y: -pos },
    btt: { x: 0, y: pos },
  };
  const offset = directionOffsets[direction];

  const variants = {
    hidden: { opacity: 0, ...offset },
    enter: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key || pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        transition={{ type, delay }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Transition;
