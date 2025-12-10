"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const COLORS = ["red", "green", "blue", "yellow"];

export default function SimonSays() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [userTurn, setUserTurn] = useState(false);
  const [step, setStep] = useState(0);
  const [flash, setFlash] = useState("");

  const startGame = () => {
    setSequence([]);
    setStep(0);
    setPlaying(true);
    nextRound([]);
  };

  const nextRound = (currentSeq: string[]) => {
    const nextColor = COLORS[Math.floor(Math.random() * 4)];
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setUserTurn(false);
    setStep(0);
    setTimeout(() => playSequence(newSeq), 500);
  };

  const playSequence = async (seq: string[]) => {
    for (let i = 0; i < seq.length; i++) {
      setFlash(seq[i]);
      await new Promise(r => setTimeout(r, 500));
      setFlash("");
      await new Promise(r => setTimeout(r, 200));
    }
    setUserTurn(true);
  };

  const handleClick = (color: string) => {
    if (!userTurn) return;
    setFlash(color);
    setTimeout(() => setFlash(""), 200);

    if (color !== sequence[step]) {
      setPlaying(false);
      alert(`Game Over! Score: ${sequence.length - 1}`);
      setSequence([]);
    } else {
      if (step + 1 === sequence.length) {
        setTimeout(() => nextRound(sequence), 1000);
      } else {
        setStep(step + 1);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-2 gap-4">
        {COLORS.map(color => (
          <motion.button
            key={color}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(color)}
            className={`w-24 h-24 rounded-2xl border-2 border-white/10 transition-all duration-200
              ${color === "red" ? "bg-red-500/20 hover:bg-red-500/40" : 
                color === "green" ? "bg-green-500/20 hover:bg-green-500/40" : 
                color === "blue" ? "bg-blue-500/20 hover:bg-blue-500/40" : "bg-yellow-500/20 hover:bg-yellow-500/40"}
              ${flash === color ? "brightness-200 shadow-[0_0_30px_rgba(255,255,255,0.5)]" : ""}
            `}
          />
        ))}
      </div>
      {!playing && (
        <button onClick={startGame} className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20">Start Game</button>
      )}
      {playing && <p className="text-gray-400 text-sm">{userTurn ? "Your Turn" : "Watch..."}</p>}
    </div>
  );
}