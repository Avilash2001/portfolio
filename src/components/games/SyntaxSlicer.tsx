"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  Bug,
  Database,
  ShieldAlert,
  Binary,
} from "lucide-react";

const GRAVITY = 0.25;
const FRICTION = 0.99;
const SPAWN_RATE = 40;

type EntityType = "BUG_BASIC" | "BUG_CRITICAL" | "DATABASE" | "FEATURE";

interface Entity {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  size: number;
  color: string;
  icon: any;
  active: boolean;
  scoreVal: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface SlicePoint {
  x: number;
  y: number;
  life: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  size: number;
}

const checkCut = (p1: SlicePoint, p2: SlicePoint, c: Entity) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  const dot = ((c.x - p1.x) * dx + (c.y - p1.y) * dy) / lenSq;

  const closestX = p1.x + (dot < 0 ? 0 : dot > 1 ? 1 : dot) * dx;
  const closestY = p1.y + (dot < 0 ? 0 : dot > 1 ? 1 : dot) * dy;

  const distSq = (c.x - closestX) ** 2 + (c.y - closestY) ** 2;
  return distSq < (c.size * 1.5) ** 2;
};

export default function SyntaxSlicer() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [gameState, setGameState] = useState<"MENU" | "PLAYING" | "GAME_OVER">(
    "MENU"
  );
  const [highScore, setHighScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const frameCount = useRef(0);

  const entities = useRef<Entity[]>([]);
  const particles = useRef<Particle[]>([]);
  const sliceTrail = useRef<SlicePoint[]>([]);
  const texts = useRef<FloatingText[]>([]);
  const lastSlicePos = useRef<{ x: number; y: number } | null>(null);
  const isSlicing = useRef(false);
  const comboTimer = useRef(0);

  const spawnEntity = (w: number, h: number) => {
    const rand = Math.random();
    let type: EntityType = "BUG_BASIC";
    let color = "#ef4444";
    let size = 40;
    let scoreVal = 10;

    if (rand > 0.9) {
      type = "DATABASE";
      color = "#3b82f6";
      size = 50;
      scoreVal = 0;
    } else if (rand > 0.8) {
      type = "FEATURE";
      color = "#22c55e";
      size = 30;
      scoreVal = 50;
    } else if (rand > 0.6) {
      type = "BUG_CRITICAL";
      color = "#a855f7";
      size = 45;
      scoreVal = 25;
    }

    const x = w * 0.2 + Math.random() * (w * 0.6);
    const y = h + 50;
    const vx = (w / 2 - x) * (0.01 + Math.random() * 0.005);
    const vy = -(12 + Math.random() * 5);

    entities.current.push({
      id: Math.random(),
      type,
      x,
      y,
      vx,
      vy,
      angle: 0,
      vAngle: (Math.random() - 0.5) * 0.2,
      size,
      color,
      scoreVal,
      active: true,
      icon: null,
    });
  };

  const loop = () => {
    if (gameState === "PLAYING") update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  };

  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    frameCount.current++;

    if (frameCount.current % SPAWN_RATE === 0) {
      const count = 1 + Math.floor(score / 500);
      for (let i = 0; i < Math.min(4, count); i++) spawnEntity(w, h);
    }

    entities.current.forEach((e) => {
      e.x += e.vx;
      e.y += e.vy;
      e.vy += GRAVITY;
      e.angle += e.vAngle;

      if (e.y > h + 60 && e.active) {
        e.active = false;
        if (e.type.includes("BUG")) {
          setLives((l) => {
            const nl = l - 1;
            if (nl <= 0) setGameState("GAME_OVER");
            return nl;
          });
        }
      }
    });

    if (isSlicing.current && sliceTrail.current.length > 1) {
      const tip = sliceTrail.current[sliceTrail.current.length - 1];
      const prev = sliceTrail.current[sliceTrail.current.length - 2];

      entities.current.forEach((e) => {
        if (e.active && checkCut(prev, tip, e)) {
          handleSlice(e);
        }
      });
    }

    particles.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += GRAVITY * 0.5;
      p.life -= 0.02;
    });

    sliceTrail.current.forEach((p) => (p.life -= 0.1));

    texts.current.forEach((t) => {
      t.y -= 2;
      t.life -= 1;
    });

    entities.current = entities.current.filter(
      (e) => e.y < h + 100 && (e.active || e.type === "DATABASE")
    );
    particles.current = particles.current.filter((p) => p.life > 0);
    sliceTrail.current = sliceTrail.current.filter((p) => p.life > 0);
    texts.current = texts.current.filter((t) => t.life > 0);

    if (comboTimer.current > 0) comboTimer.current--;
    else setCombo(0);
  };

  const handleSlice = (e: Entity) => {
    e.active = false;

    if (e.type === "DATABASE") {
      createExplosion(e.x, e.y, "#ef4444", 20);
      setGameState("GAME_OVER");
      setLives(0);
      return;
    }

    setCombo((c) => c + 1);
    comboTimer.current = 60;

    const multiplier = Math.max(1, Math.floor(combo / 3));
    const points = e.scoreVal * multiplier;
    setScore((s) => s + points);

    createExplosion(e.x, e.y, e.color, 8);
    texts.current.push({
      id: Math.random(),
      x: e.x,
      y: e.y,
      text: `+${points}`,
      life: 30,
      color: "#fff",
      size: 24,
    });

    if (combo > 2) {
      texts.current.push({
        id: Math.random(),
        x: e.x,
        y: e.y - 30,
        text: `${combo}x COMBO!`,
        life: 40,
        color: "#fcd34d",
        size: 18,
      });
    }
  };

  const createExplosion = (
    x: number,
    y: number,
    color: string,
    count: number
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    entities.current.forEach((e) => {
      if (!e.active && e.type !== "DATABASE") return;

      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);

      ctx.shadowBlur = 15;
      ctx.shadowColor = e.color;
      ctx.fillStyle = e.color;

      if (e.type === "DATABASE") {
        ctx.fillRect(-20, -25, 40, 50);
        ctx.fillStyle = "#60a5fa";
        ctx.fillRect(-15, -15, 30, 5);
        ctx.fillRect(-15, 0, 30, 5);
      } else if (e.type === "FEATURE") {
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(15, 0);
        ctx.lineTo(0, 20);
        ctx.lineTo(-15, 0);
        ctx.fill();
      } else {
        ctx.fillRect(-e.size / 2, -e.size / 2, e.size, e.size);

        ctx.fillStyle = "white";
        ctx.fillRect(-10, -10, 8, 8);
        ctx.fillRect(2, -10, 8, 8);
      }

      ctx.restore();
    });

    particles.current.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (sliceTrail.current.length > 1) {
      ctx.beginPath();
      ctx.moveTo(sliceTrail.current[0].x, sliceTrail.current[0].y);
      for (let i = 1; i < sliceTrail.current.length; i++) {
        const p = sliceTrail.current[i];

        ctx.lineTo(p.x, p.y);
      }
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#06b6d4";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#fff";
      ctx.stroke();
    }

    texts.current.forEach((t) => {
      ctx.fillStyle = t.color;
      ctx.font = `bold ${t.size}px monospace`;
      ctx.shadowBlur = 0;
      ctx.fillText(t.text, t.x, t.y);
    });
  };

  const handleStart = (x: number, y: number) => {
    isSlicing.current = true;
    addPoint(x, y);
  };

  const handleMove = (x: number, y: number) => {
    if (!isSlicing.current) return;
    addPoint(x, y);
  };

  const handleEnd = () => {
    isSlicing.current = false;
    sliceTrail.current = [];
  };

  const addPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const finalX = (x - rect.left) * scaleX;
    const finalY = (y - rect.top) * scaleY;

    sliceTrail.current.push({ x: finalX, y: finalY, life: 5 });
    if (sliceTrail.current.length > 8) sliceTrail.current.shift();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      requestRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    entities.current = [];
    particles.current = [];
    texts.current = [];
    setGameState("PLAYING");
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-4 bg-gray-900 rounded-2xl shadow-2xl border border-white/10 touch-none select-none">
      <div className="flex justify-between w-full px-4 text-xl font-mono font-bold">
        <div className="text-cyan-400 drop-shadow-md">SCORE: {score}</div>
        <div className="flex gap-1 text-red-500">
          {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
            <span key={i}>❤️</span>
          ))}
        </div>
      </div>

      <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden border-4 border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <canvas
          ref={canvasRef}
          className="w-full h-full block touch-none"
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) =>
            handleStart(e.touches[0].clientX, e.touches[0].clientY)
          }
          onTouchMove={(e) =>
            handleMove(e.touches[0].clientX, e.touches[0].clientY)
          }
          onTouchEnd={handleEnd}
        />

        {gameState === "MENU" && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 mb-2 italic -skew-x-12">
              SYNTAX SLICER
            </h1>
            <p className="text-gray-400 mb-8 text-sm">
              Swipe to fix Bugs{" "}
              <span className="text-red-400 font-bold">(🟥)</span>.<br />
              Do NOT slice Databases{" "}
              <span className="text-blue-400 font-bold">(🟦)</span>.
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full text-xl hover:scale-105 transition-transform"
            >
              <Play fill="currentColor" /> START DEBUGGING
            </button>
          </div>
        )}

        {gameState === "GAME_OVER" && (
          <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-2">
              PRODUCTION DOWN
            </h2>
            <div className="text-6xl font-black text-yellow-400 mb-6 drop-shadow-md">
              {score}
            </div>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-white text-red-900 font-bold rounded-full text-lg hover:scale-105 transition-transform"
            >
              <RotateCcw /> REBOOT SERVER
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Pro Tip: Slice multiple bugs in one stroke for combos.
      </p>
    </div>
  );
}
