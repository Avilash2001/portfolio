"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Hand, Scissors, Scroll, RotateCcw } from "lucide-react";

const OPTIONS = [
  { name: "rock", icon: Hand, color: "text-red-400" },
  { name: "paper", icon: Scroll, color: "text-cyan-400" },
  { name: "scissors", icon: Scissors, color: "text-yellow-400" },
];

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const playGame = (choiceName: string) => {
    const computerRandom =
      OPTIONS[Math.floor(Math.random() * OPTIONS.length)].name;
    setPlayerChoice(choiceName);
    setComputerChoice(computerRandom);

    if (choiceName === computerRandom) setResult("Draw");
    else if (
      (choiceName === "rock" && computerRandom === "scissors") ||
      (choiceName === "paper" && computerRandom === "rock") ||
      (choiceName === "scissors" && computerRandom === "paper")
    )
      setResult("Win");
    else setResult("Lose");
  };

  const reset = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto text-center">
      <div className="flex justify-center items-center h-24 gap-12">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-400">You</p>
          {playerChoice ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl"
            >
              {OPTIONS.find((o) => o.name === playerChoice)?.name === "rock"
                ? "✊"
                : OPTIONS.find((o) => o.name === playerChoice)?.name === "paper"
                ? "✋"
                : "✌️"}
            </motion.div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
          )}
        </div>

        <div className="text-2xl font-bold">
          {result === "Win" && <span className="text-cyan-400">YOU WIN!</span>}
          {result === "Lose" && <span className="text-red-400">YOU LOSE!</span>}
          {result === "Draw" && <span className="text-yellow-400">DRAW!</span>}
          {!result && <span className="text-white/20">VS</span>}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-400">Bot</p>
          {computerChoice ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl"
            >
              {OPTIONS.find((o) => o.name === computerChoice)?.name === "rock"
                ? "✊"
                : OPTIONS.find((o) => o.name === computerChoice)?.name ===
                  "paper"
                ? "✋"
                : "✌️"}
            </motion.div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
          )}
        </div>
      </div>

      {!result ? (
        <div className="flex gap-4">
          {OPTIONS.map((opt) => (
            <motion.button
              key={opt.name}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => playGame(opt.name)}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-cyan-500/50 transition-all group"
            >
              <opt.icon
                className={`w-8 h-8 ${opt.color} group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
              />
            </motion.button>
          ))}
        </div>
      ) : (
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full font-bold hover:opacity-90"
        >
          <RotateCcw size={18} /> Play Again
        </button>
      )}
    </div>
  );
};

export default RockPaperScissors;
