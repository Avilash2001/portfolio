"use client";
import React, { useState } from "react";

export default function ReactionTime() {
  const [status, setStatus] = useState<"idle" | "waiting" | "ready" | "early">("idle");
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState<number | null>(null);

  const start = () => {
    setStatus("waiting");
    setScore(null);
    setTimeout(() => {
      setStatus("ready");
      setStartTime(Date.now());
    }, 1000 + Math.random() * 2000);
  };

  const handleClick = () => {
    if (status === "waiting") setStatus("early");
    else if (status === "ready") {
      setScore(Date.now() - startTime);
      setStatus("idle");
    } else if (status === "idle" || status === "early") {
      start();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`w-full h-64 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors select-none
        ${status === "waiting" ? "bg-red-500/20 text-red-200" : 
          status === "ready" ? "bg-green-500 text-black font-bold" : 
          status === "early" ? "bg-yellow-500/20" : "bg-white/5 hover:bg-white/10"}`}
    >
      {status === "idle" && (score ? <span className="text-3xl font-bold">{score}ms</span> : <span className="text-xl">Click to Start</span>)}
      {status === "waiting" && <span className="text-2xl font-bold animate-pulse">WAIT FOR GREEN...</span>}
      {status === "ready" && <span className="text-4xl font-bold">CLICK!</span>}
      {status === "early" && <span>Too early! Click to try again.</span>}
    </div>
  );
}