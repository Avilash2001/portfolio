"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, BrainCircuit, Scissors, Ghost, Bug, 
  Lightbulb, Keyboard, Zap, Crosshair, DollarSign 
} from "lucide-react";

// Import all 10 games
import TicTacToe from "@/components/games/TicTacToe";
import MemoryMatch from "@/components/games/MemoryMatch";
import RockPaperScissors from "@/components/games/RockPaperScissors";
import SnakeGame from "@/components/games/SnakeGame";
import SimonSays from "@/components/games/SimonSays";
import WhackAMole from "@/components/games/WhackAMole";
import TypingSpeed from "@/components/games/TypingSpeed";
import ReactionTime from "@/components/games/ReactionTime";
import AimTrainer from "@/components/games/AimTrainer";
import SlotMachine from "@/components/games/SlotMachine";

const games = [
  { id: "tictactoe", title: "Cosmic Tac Toe", icon: Gamepad2, component: TicTacToe },
  { id: "memory", title: "Memory Stack", icon: BrainCircuit, component: MemoryMatch },
  { id: "rps", title: "R.P.S. Galaxy", icon: Scissors, component: RockPaperScissors },
  { id: "snake", title: "Cyber Snake", icon: Ghost, component: SnakeGame },
  { id: "simon", title: "Simon Sequence", icon: Lightbulb, component: SimonSays },
  { id: "whack", title: "Bug Zapper", icon: Bug, component: WhackAMole },
  { id: "typing", title: "Speed Typer", icon: Keyboard, component: TypingSpeed },
  { id: "reaction", title: "Reaction Void", icon: Zap, component: ReactionTime },
  { id: "aim", title: "Aim Lab", icon: Crosshair, component: AimTrainer },
  { id: "slots", title: "Lucky Slots", icon: DollarSign, component: SlotMachine },
];

export default function ArcadePage() {
  const [activeGame, setActiveGame] = useState(games[0].id);

  const CurrentGameComponent = games.find((g) => g.id === activeGame)?.component;
  const currentGameTitle = games.find((g) => g.id === activeGame)?.title;

  return (
    <div className="flex flex-col h-full gap-8 items-center w-full">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold">
          <span className="gradient-text">Arcade</span> Zone
        </h1>
        <p className="text-gray-400">Select a cartridge to play</p>
      </div>

      {/* Game Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-w-4xl">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2
              ${activeGame === game.id 
                ? "bg-cyan-500/20 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
              }`}
          >
            <game.icon size={24} />
            <span className="text-xs font-semibold">{game.title}</span>
          </button>
        ))}
      </div>

      {/* Game Console */}
      <div className="w-full max-w-3xl relative mt-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2.5rem] opacity-30 blur-lg" />
        <div className="relative w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 min-h-[500px] flex flex-col">
            
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">{currentGameTitle}</h2>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                <motion.div
                    key={activeGame}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                >
                    {CurrentGameComponent && <CurrentGameComponent />}
                </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}