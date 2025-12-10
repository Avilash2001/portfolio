"use client";
import React, { useState, useEffect } from "react";
import { Bug, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function WhackAMole() {
  const [score, setScore] = useState(0);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setActiveSlot(Math.floor(Math.random() * 9));
      }, 700);
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isPlaying]);

  const whack = (i: number) => {
    if (i === activeSlot) {
      setScore((s) => s + 1);
      setActiveSlot(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-xs px-4">
        <span>Score: {score}</span>
        <span>Time: {timeLeft}s</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="w-20 h-20 bg-white/5 rounded-full relative border border-white/10 overflow-hidden cursor-pointer"
            onClick={() => whack(i)}
          >
            {activeSlot === i && (
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="absolute inset-0 flex items-center justify-center text-red-500"
              >
                <Bug size={40} />
              </motion.div>
            )}
          </div>
        ))}
      </div>
      {!isPlaying && (
        <button
          onClick={() => {
            setScore(0);
            setTimeLeft(30);
            setIsPlaying(true);
          }}
          className="flex items-center gap-2 px-6 py-2 bg-cyan-600 rounded-full"
        >
          <Play size={16} /> Start
        </button>
      )}
    </div>
  );
}
