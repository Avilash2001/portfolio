"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trophy, MousePointer2 } from "lucide-react";
import { motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
}
interface Velocity {
  x: number;
  y: number;
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.color = color;
    this.size = Math.random() * 2 + 1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.02;
    this.size *= 0.95;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    const speed = 15;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#06b6d4";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class Enemy {
  x: number;
  y: number;
  speed: number;
  size: number;
  hp: number;
  color: string;
  constructor(w: number, h: number, difficulty: number) {
    if (Math.random() < 0.5) {
      this.x = Math.random() < 0.5 ? -20 : w + 20;
      this.y = Math.random() * h;
    } else {
      this.x = Math.random() * w;
      this.y = Math.random() < 0.5 ? -20 : h + 20;
    }
    this.size = 15 + Math.random() * 10;
    this.speed = (1 + Math.random()) * (1 + difficulty * 0.1);
    this.hp = Math.ceil(this.size / 10);
    this.color = Math.random() > 0.8 ? "#d946ef" : "#ef4444";
  }
  update(playerPos: Point) {
    const angle = Math.atan2(playerPos.y - this.y, playerPos.x - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      this.x + this.size * Math.cos(0),
      this.y + this.size * Math.sin(0)
    );
    for (let i = 1; i <= 5; i++) {
      ctx.lineTo(
        this.x + this.size * Math.cos((i * 2 * Math.PI) / 5),
        this.y + this.size * Math.sin((i * 2 * Math.PI) / 5)
      );
    }
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

export default function NebulaRaiders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const mouse = useRef<Point>({ x: 0, y: 0 });
  const player = useRef({ x: 0, y: 0, angle: 0 });
  const bullets = useRef<Bullet[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const particles = useRef<Particle[]>([]);
  const frameId = useRef<number>(0);
  const lastShot = useRef(0);
  const difficulty = useRef(1);
  const scoreRef = useRef(0);
  const shake = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("nebula-highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;

    player.current = { x: width / 2, y: height / 2, angle: 0 };
    bullets.current = [];
    enemies.current = [];
    particles.current = [];
    scoreRef.current = 0;
    difficulty.current = 1;
    shake.current = 0;

    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const spawnParticles = (
    x: number,
    y: number,
    color: string,
    count: number
  ) => {
    for (let i = 0; i < count; i++) {
      particles.current.push(new Particle(x, y, color));
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = 500;

    const loop = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let shakeX = 0,
        shakeY = 0;
      if (shake.current > 0) {
        shakeX = Math.random() * shake.current - shake.current / 2;
        shakeY = Math.random() * shake.current - shake.current / 2;
        shake.current *= 0.9;
        if (shake.current < 0.5) shake.current = 0;
      }
      ctx.save();
      ctx.translate(shakeX, shakeY);

      const dx = mouse.current.x - player.current.x;
      const dy = mouse.current.y - player.current.y;
      player.current.angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(player.current.x, player.current.y);
      ctx.rotate(player.current.angle);
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#06b6d4";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, 10);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-10, -10);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      const now = Date.now();
      if (now - lastShot.current > 10) {
        bullets.current.push(
          new Bullet(player.current.x, player.current.y, player.current.angle)
        );
        lastShot.current = now;
      }

      bullets.current.forEach((b, i) => {
        b.update();
        b.draw(ctx);
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
          bullets.current.splice(i, 1);
        }
      });

      if (Math.random() < 0.015 * difficulty.current) {
        enemies.current.push(
          new Enemy(canvas.width, canvas.height, difficulty.current)
        );
      }

      enemies.current.forEach((enemy, i) => {
        enemy.update(player.current);
        enemy.draw(ctx);

        const distToPlayer = Math.hypot(
          player.current.x - enemy.x,
          player.current.y - enemy.y
        );
        if (distToPlayer < enemy.size + 10) {
          setIsPlaying(false);
          setGameOver(true);
          if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem(
              "nebula-highscore",
              scoreRef.current.toString()
            );
          }
        }

        bullets.current.forEach((bullet, bIndex) => {
          const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
          if (dist < enemy.size) {
            enemy.hp = enemy.hp - 100;

            bullets.current.splice(bIndex, 1);
            spawnParticles(enemy.x, enemy.y, enemy.color, 3);

            if (enemy.hp <= 0) {
              enemies.current.splice(i, 1);
              spawnParticles(enemy.x, enemy.y, enemy.color, 15);
              shake.current = 5;
              scoreRef.current += 100;
              setScore(scoreRef.current);

              difficulty.current += 0.05;
            }
          }
        });
      });

      particles.current.forEach((p, i) => {
        p.update();
        p.draw(ctx);
        if (p.life <= 0) particles.current.splice(i, 1);
      });

      ctx.restore();
      frameId.current = requestAnimationFrame(loop);
    };

    frameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId.current);
  }, [isPlaying, highScore]);

  return (
    <div className="relative w-full max-w-4xl h-[500px] bg-black rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)] mx-auto group cursor-crosshair">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        className="block w-full h-full relative z-10"
      />

      <div className="absolute top-4 left-6 z-20 pointer-events-none flex gap-6 text-xl font-bold font-mono">
        <div className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
          SCORE: {score.toString().padStart(6, "0")}
        </div>
        <div className="text-yellow-500 flex items-center gap-2">
          <Trophy size={20} /> HI: {highScore.toString().padStart(6, "0")}
        </div>
      </div>

      {(!isPlaying || gameOver) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/80 border border-white/20 p-8 rounded-2xl text-center shadow-2xl max-w-sm"
          >
            <h2 className="text-4xl font-bold gradient-text mb-2">
              {gameOver ? "SYSTEM FAILURE" : "NEBULA RAIDERS"}
            </h2>
            <p className="text-gray-400 mb-6">
              {gameOver
                ? `Final Score: ${score}`
                : "Protect the core. Aim with mouse. Survive."}
            </p>

            <button
              onClick={startGame}
              className="flex items-center justify-center gap-2 w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              {gameOver ? <RotateCcw /> : <Play />}
              {gameOver ? "REBOOT SYSTEM" : "INITIATE LAUNCH"}
            </button>

            {!gameOver && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <MousePointer2 size={14} /> Mouse to Aim
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
