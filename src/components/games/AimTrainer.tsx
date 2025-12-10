"use client";
import React, { useState } from "react";
import { Target, Crosshair } from "lucide-react";

export default function AimTrainer() {
  const [score, setScore] = useState(0);
  const [pos, setPos] = useState({ top: "50%", left: "50%" });
  const [playing, setPlaying] = useState(false);

  const moveTarget = () => {
    setPos({
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
    });
  };

  const hit = () => {
    setScore(s => s + 1);
    moveTarget();
  };

  return (
    <div className="relative w-full h-80 bg-black/40 rounded-xl border border-white/10 overflow-hidden">
      {!playing ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
          <p className="text-2xl font-bold mb-4">Score: {score}</p>
          <button onClick={() => { setScore(0); setPlaying(true); }} className="px-6 py-2 bg-cyan-600 rounded-full flex gap-2"><Crosshair size={20}/> Start</button>
        </div>
      ) : (
        <button 
            onClick={hit}
            style={{ top: pos.top, left: pos.left }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-red-500 hover:text-red-400 transition-colors p-2"
        >
            <Target size={40} />
        </button>
      )}
      {playing && <button onClick={() => setPlaying(false)} className="absolute top-2 right-2 text-xs text-gray-500">Stop</button>}
    </div>
  );
}