"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic"; // 1. Import dynamic
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  BrainCircuit,
  Scissors,
  Ghost,
  Bug,
  Lightbulb,
  Keyboard,
  Zap,
  Crosshair,
  DollarSign,
  Box,
  Rocket,
  Barrel,
} from "lucide-react";

// --- IMPORTS ---

// Simple games can be imported normally
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
import NeonSurvivor from "@/components/games/NeonSurvivor";
import GridlockDefense from "@/components/games/GridlockDefense";

// 2. HEAVY GAMES MUST BE DYNAMIC IMPORTED (Disable SSR)
// This fixes the "reading 'S'" and "window is undefined" errors
const CyberVoid = dynamic(() => import("@/components/games/CyberVoid"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center text-cyan-500">
      Loading 3D Engine...
    </div>
  ),
});

const NebulaRaiders = dynamic(
  () => import("@/components/games/NebulaRaiders"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full flex items-center justify-center text-cyan-500">
        Loading Physics...
      </div>
    ),
  }
);

// --- CONFIG ---

const games = [
  // { id: "cybervoid", title: "Cyber Void 3D", icon: Box, component: CyberVoid },
  {
    id: "survivor",
    title: "Neon Survivor",
    icon: Zap,
    component: NeonSurvivor,
  },
  {
    id: "gridlock",
    title: "Gridlock Defense",
    icon: Barrel,
    component: GridlockDefense,
  },
  {
    id: "nebula",
    title: "Nebula Raiders",
    icon: Rocket,
    component: NebulaRaiders,
  },
  { id: "snake", title: "Cyber Snake", icon: Ghost, component: SnakeGame },
  {
    id: "tictactoe",
    title: "Cosmic Tac Toe",
    icon: Gamepad2,
    component: TicTacToe,
  },
  {
    id: "memory",
    title: "Memory Stack",
    icon: BrainCircuit,
    component: MemoryMatch,
  },
  {
    id: "rps",
    title: "R.P.S. Galaxy",
    icon: Scissors,
    component: RockPaperScissors,
  },
  {
    id: "simon",
    title: "Simon Sequence",
    icon: Lightbulb,
    component: SimonSays,
  },
  { id: "whack", title: "Bug Zapper", icon: Bug, component: WhackAMole },
  {
    id: "typing",
    title: "Speed Typer",
    icon: Keyboard,
    component: TypingSpeed,
  },
  {
    id: "reaction",
    title: "Reaction Void",
    icon: Zap,
    component: ReactionTime,
  },
  { id: "aim", title: "Aim Lab", icon: Crosshair, component: AimTrainer },
  // {
  //   id: "slots",
  //   title: "Lucky Slots",
  //   icon: DollarSign,
  //   component: SlotMachine,
  // },
];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState(games[0].id);

  const CurrentGameComponent = games.find(
    (g) => g.id === activeGame
  )?.component;
  const currentGameTitle = games.find((g) => g.id === activeGame)?.title;

  return (
    <div className="flex flex-col h-full gap-8 items-center">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold">
          <span className="gradient-text">Arcade</span> Zone
        </h1>
        <p className="text-gray-400">Select a cartridge to play</p>
      </div>

      {/* Game Selector Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 w-full max-w-5xl">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2
              ${
                activeGame === game.id
                  ? "bg-cyan-500/20 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-105"
                  : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 hover:scale-105"
              }`}
          >
            <game.icon size={20} />
            <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">
              {game.title}
            </span>
          </button>
        ))}
      </div>

      {/* Game Console */}
      <div className="w-full max-w-4xl relative mt-4">
        {/* Glow effect behind console */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2.5rem] opacity-20 blur-xl transition-all duration-500" />

        <div className="relative w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 sm:p-8 min-h-[500px] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {games.find((g) => g.id === activeGame)?.icon &&
                React.createElement(
                  games.find((g) => g.id === activeGame)!.icon,
                  { className: "text-cyan-400" }
                )}
              {currentGameTitle}
            </h2>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGame}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center"
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
