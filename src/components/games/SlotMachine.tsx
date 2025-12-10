"use client";
import React, { useState } from "react";
import { DollarSign, Star, Zap, Heart, Anchor, Music } from "lucide-react";
import { motion } from "framer-motion";

const ICONS = [DollarSign, Star, Zap, Heart, Anchor, Music];

export default function SlotMachine() {
  const [reels, setReels] = useState([0, 1, 2]);
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState("");

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setMsg("");
    
    const interval = setInterval(() => {
        setReels([Math.floor(Math.random()*6), Math.floor(Math.random()*6), Math.floor(Math.random()*6)]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const res = [Math.floor(Math.random()*6), Math.floor(Math.random()*6), Math.floor(Math.random()*6)];
      setReels(res);
      setSpinning(false);
      if (res[0] === res[1] && res[1] === res[2]) setMsg("JACKPOT! 🎉");
      else if (res[0] === res[1] || res[1] === res[2] || res[0] === res[2]) setMsg("Nice Pair!");
      else setMsg("Try Again");
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4 p-6 bg-black border-4 border-yellow-600 rounded-xl shadow-2xl">
        {reels.map((r, i) => {
            const Icon = ICONS[r];
            return (
                <div key={i} className="w-16 h-24 bg-white text-black flex items-center justify-center text-4xl rounded overflow-hidden">
                   <motion.div key={spinning ? Math.random() : i} initial={{ y: -50 }} animate={{ y: 0 }}>
                     <Icon size={40} className="text-yellow-600" />
                   </motion.div>
                </div>
            );
        })}
      </div>
      <div className="h-8 text-xl font-bold text-yellow-400">{msg}</div>
      <button onClick={spin} disabled={spinning} className="px-8 py-3 bg-gradient-to-b from-red-500 to-red-700 rounded-full font-bold shadow-lg active:translate-y-1">
        SPIN
      </button>
    </div>
  );
}