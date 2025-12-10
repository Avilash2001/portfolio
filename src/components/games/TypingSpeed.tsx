"use client";
import React, { useState, useEffect } from "react";

const WORDS = ["react", "nextjs", "typescript", "tailwind", "prisma", "docker", "graphql", "node", "framer", "vercel"];

export default function TypingSpeed() {
  const [currentWord, setCurrentWord] = useState("");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying && timer > 0) {
      const id = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(id);
    } else if (timer === 0) setIsPlaying(false);
  }, [isPlaying, timer]);

  useEffect(() => {
    if (input === currentWord && isPlaying) {
      setScore(s => s + 1);
      setInput("");
      setCurrentWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }
  }, [input, currentWord, isPlaying]);

  const start = () => {
    setScore(0);
    setTimer(30);
    setIsPlaying(true);
    setCurrentWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setInput("");
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-2">
        <p className="text-4xl font-mono font-bold text-cyan-400 min-h-[50px]">{isPlaying ? currentWord : "READY?"}</p>
        <p className="text-sm text-gray-400">Score: {score} | Time: {timer}s</p>
      </div>
      <input 
        autoFocus
        value={input}
        disabled={!isPlaying}
        onChange={(e) => setInput(e.target.value)}
        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-center text-xl focus:outline-none focus:border-cyan-500 transition-colors"
        placeholder={isPlaying ? "Type here..." : "Press Start"}
      />
      {!isPlaying && <button onClick={start} className="px-8 py-2 bg-white/10 hover:bg-white/20 rounded-full">Start Typing</button>}
    </div>
  );
}