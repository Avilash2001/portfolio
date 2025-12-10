"use client";

import React, { useEffect, useRef, useState } from "react";
import { RotateCcw, Database, Cpu, Save, AlertTriangle } from "lucide-react";

// --- CONFIG ---
const GRAVITY = 0.5;
const FRICTION = 0.98; // Air resistance
const BOUNCE = 0.4; // Restitution
const WALL_BOUNCE = 0.5;
const CONTAINER_WIDTH = 340; // Mobile friendly width
const CONTAINER_HEIGHT = 500;
const SPAWN_Y = 50;

// --- TYPES ---
// 0:Bit, 1:Nibble, 2:Byte, 3:KB, 4:MB, 5:GB, 6:TB, 7:PB
const SIZES = [
  { r: 15, color: "#94a3b8", label: "bit", score: 2 }, // Slate
  { r: 25, color: "#38bdf8", label: "4b", score: 4 }, // Sky
  { r: 35, color: "#4ade80", label: "1B", score: 8 }, // Green
  { r: 45, color: "#facc15", label: "1KB", score: 16 }, // Yellow
  { r: 60, color: "#fb923c", label: "1MB", score: 32 }, // Orange
  { r: 75, color: "#f87171", label: "1GB", score: 64 }, // Red
  { r: 90, color: "#c084fc", label: "1TB", score: 128 }, // Purple
  { r: 105, color: "#e879f9", label: "1PB", score: 256 }, // Pink
];

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tier: number; // Index in SIZES
  radius: number;
  mass: number;
  merging: boolean; // Prevent double merges
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

export default function MemoryLeak() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [nextTier, setNextTier] = useState(0); // Next ball to drop

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Game State
  const balls = useRef<Ball[]>([]);
  const particles = useRef<Particle[]>([]);
  const mouseX = useRef(CONTAINER_WIDTH / 2);
  const isDropping = useRef(false);
  const dropCooldown = useRef(false);

  // --- PHYSICS ENGINE ---
  const update = () => {
    if (gameOver) return;

    // 1. Update Balls (Gravity & Wall Collision)
    for (let i = 0; i < balls.current.length; i++) {
      const b = balls.current[i];

      // Apply Forces
      b.vy += GRAVITY;
      b.vx *= FRICTION;
      b.vy *= FRICTION;

      // Move
      b.x += b.vx;
      b.y += b.vy;

      // Floor Collision
      if (b.y + b.radius > CONTAINER_HEIGHT) {
        b.y = CONTAINER_HEIGHT - b.radius;
        b.vy *= -BOUNCE;
      }

      // Wall Collision
      if (b.x - b.radius < 0) {
        b.x = b.radius;
        b.vx *= -WALL_BOUNCE;
      } else if (b.x + b.radius > CONTAINER_WIDTH) {
        b.x = CONTAINER_WIDTH - b.radius;
        b.vx *= -WALL_BOUNCE;
      }
    }

    // 2. Ball vs Ball Collision (The hard part)
    // Multiple iterations for stability
    for (let iter = 0; iter < 8; iter++) {
      for (let i = 0; i < balls.current.length; i++) {
        for (let j = i + 1; j < balls.current.length; j++) {
          const b1 = balls.current[i];
          const b2 = balls.current[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const distSq = dx * dx + dy * dy;
          const minDist = b1.radius + b2.radius;

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);

            // Check Merge
            if (
              b1.tier === b2.tier &&
              b1.tier < SIZES.length - 1 &&
              !b1.merging &&
              !b2.merging
            ) {
              handleMerge(b1, b2);
              continue;
            }

            // Resolve Overlap (Positional Correction)
            if (dist === 0) continue; // Avoid NaN
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Move apart based on inverse mass (smaller moves more)
            const totalMass = b1.mass + b2.mass;
            const m1Ratio = b2.mass / totalMass;
            const m2Ratio = b1.mass / totalMass;

            b1.x -= nx * overlap * m1Ratio;
            b1.y -= ny * overlap * m1Ratio;
            b2.x += nx * overlap * m2Ratio;
            b2.y += ny * overlap * m2Ratio;

            // Resolve Velocity (Impulse)
            // Relative velocity along normal
            const rvx = b2.vx - b1.vx;
            const rvy = b2.vy - b1.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal > 0) continue; // Moving apart

            const restitution = 0.2; // Low bounce between balls
            let jVal = -(1 + restitution) * velAlongNormal;
            jVal /= 1 / b1.mass + 1 / b2.mass;

            const impulseX = jVal * nx;
            const impulseY = jVal * ny;

            b1.vx -= impulseX / b1.mass;
            b1.vy -= impulseY / b1.mass;
            b2.vx += impulseX / b2.mass;
            b2.vy += impulseY / b2.mass;

            // Friction/Roll helper (prevent stacking jitter)
            const tx = -ny;
            const ty = nx;
            const dpTan = rvx * tx + rvy * ty;
            const jt = -(dpTan * 0.1) / (1 / b1.mass + 1 / b2.mass); // simple friction

            b1.vx -= (tx * jt) / b1.mass;
            b1.vy -= (ty * jt) / b1.mass;
            b2.vx += (tx * jt) / b2.mass;
            b2.vy += (ty * jt) / b2.mass;
          }
        }
      }
    }

    // 3. Game Over Check
    // If any ball stays above the "Deadline" line for too long?
    // Simplified: If a ball is settled above Y=100
    for (const b of balls.current) {
      if (
        b.y - b.radius < 100 &&
        Math.abs(b.vy) < 0.1 &&
        Math.abs(b.vx) < 0.1 &&
        !b.merging
      ) {
        setGameOver(true);
      }
    }

    // 4. Update Particles
    particles.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
    });
    particles.current = particles.current.filter((p) => p.life > 0);
    balls.current = balls.current.filter((b) => !b.merging);
  };

  const handleMerge = (b1: Ball, b2: Ball) => {
    b1.merging = true;
    b2.merging = true;

    const newTier = b1.tier + 1;
    const midX = (b1.x + b2.x) / 2;
    const midY = (b1.y + b2.y) / 2;

    // Add Score
    setScore((s) => s + SIZES[newTier].score);

    // Explosion FX
    createParticles(midX, midY, SIZES[newTier].color);

    // Create new Ball
    const r = SIZES[newTier].r;
    balls.current.push({
      id: Math.random(),
      x: midX,
      y: midY,
      vx: 0,
      vy: 0,
      tier: newTier,
      radius: r,
      mass: r * r, // Mass proportional to area
      merging: false,
    });
  };

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1.0,
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

    // 1. Draw "Danger Zone" Line
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(CONTAINER_WIDTH, 100);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Aim Line (if not game over)
    if (!gameOver && !dropCooldown.current) {
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mouseX.current, SPAWN_Y);
      ctx.lineTo(mouseX.current, CONTAINER_HEIGHT);
      ctx.stroke();

      // Draw Next Ball Preview
      const previewR = SIZES[nextTier].r;
      ctx.fillStyle = SIZES[nextTier].color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(mouseX.current, SPAWN_Y, previewR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // 3. Draw Balls
    balls.current.forEach((b) => {
      const style = SIZES[b.tier];
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner shine/border
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${10 + b.tier * 2}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(style.label, b.x, b.y);
    });

    // 4. Draw Particles
    particles.current.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  };

  const loop = () => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = CONTAINER_WIDTH;
      canvas.height = CONTAINER_HEIGHT;
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameOver]);

  // --- INPUTS ---
  const handleInput = (clientX: number) => {
    if (gameOver || dropCooldown.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    let x = clientX - rect.left;
    // Clamp to bounds
    const r = SIZES[nextTier].r;
    if (x < r) x = r;
    if (x > CONTAINER_WIDTH - r) x = CONTAINER_WIDTH - r;

    mouseX.current = x;
  };

  const handleDrop = () => {
    if (gameOver || dropCooldown.current) return;

    const r = SIZES[nextTier].r;
    balls.current.push({
      id: Math.random(),
      x: mouseX.current,
      y: SPAWN_Y,
      vx: 0,
      vy: 0,
      tier: nextTier,
      radius: r,
      mass: r * r,
      merging: false,
    });

    // Cooldown to prevent spam
    dropCooldown.current = true;
    setTimeout(() => {
      dropCooldown.current = false;
      // Random next ball (only small ones)
      setNextTier(Math.floor(Math.random() * 3)); // 0, 1, or 2
    }, 600);
  };

  const restart = () => {
    balls.current = [];
    particles.current = [];
    setScore(0);
    setGameOver(false);
    dropCooldown.current = false;
    setNextTier(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto select-none touch-none">
      {/* HEADER */}
      <div className="flex justify-between w-full px-4 items-center bg-gray-900/50 p-3 rounded-xl border border-white/10">
        <div className="text-cyan-400 font-mono font-bold text-xl">
          HEAP: {score}
        </div>
        <div className="flex gap-2 text-xs text-gray-400 items-center">
          <Database size={16} />
          <span>HI: {highScore}</span>
        </div>
        <button
          onClick={restart}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20"
        >
          <RotateCcw size={18} className="text-white" />
        </button>
      </div>

      {/* GAME CONTAINER */}
      <div
        className="relative bg-gray-900 rounded-b-xl border-x-4 border-b-4 border-gray-700 shadow-2xl overflow-hidden cursor-crosshair"
        style={{ width: CONTAINER_WIDTH + 8, height: CONTAINER_HEIGHT + 4 }}
        onMouseMove={(e) => handleInput(e.clientX)}
        onClick={handleDrop}
        onTouchMove={(e) => handleInput(e.touches[0].clientX)}
        onTouchEnd={handleDrop}
      >
        <canvas ref={canvasRef} className="block bg-[#0f172a]" />

        {/* GAME OVER OVERLAY */}
        {gameOver && (
          <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-10">
            <AlertTriangle
              size={64}
              className="text-white mb-4 animate-bounce"
            />
            <h2 className="text-4xl font-black text-white mb-2">OVERFLOW</h2>
            <p className="text-red-200 mb-6">Memory Heap Exceeded</p>
            <button
              onClick={restart}
              className="px-8 py-3 bg-white text-red-900 font-bold rounded-full text-xl shadow-xl hover:scale-105 transition-transform"
            >
              FLUSH MEMORY
            </button>
          </div>
        )}
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap justify-center gap-2 px-4 opacity-50 text-[10px] text-gray-400">
        {SIZES.map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
