"use client";
import React from "react";
import { motion } from "framer-motion";

const SkillTitle: React.FC<{ label: string }> = ({ label }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass rounded-2xl px-4 py-2 text-sm"
    >
      {label}
    </motion.div>
  );
};

export default SkillTitle;
