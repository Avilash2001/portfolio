"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Zap, Shield, Crosshair, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- ENGINE CONFIGURATION ---
const FPS = 60;
const TIME_STEP = 1000 / FPS;
const ENEMY_SPAWN_RATE_INITIAL = 60; // Frames between spawns
const PLAYER_SPEED = 4;
const FRICTION = 0.92;
const MAGNET_RANGE = 150;

// --- TYPES ---
type Vector = { x: number; y: number };
type GameState = "MENU" | "PLAYING" | "PAUSED_UPGRADE" | "GAME_OVER";

interface Entity {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  markedForDeletion: boolean;
}

interface Player extends Entity {
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  xp: number;
  maxXp: number;
  level: number;
  weapons: {
    fireRate: number;
    damage: number;
    speed: number;
    projectiles: number;
    lastFired: number;
  };
  stats: {
    moveSpeed: number;
    pickupRange: number;
  };
}

interface Enemy extends Entity {
  hp: number;
  speed: number;
  damage: number;
  xpValue: number;
  type: "BASIC" | "TANK" | "RUSHER";
}

interface Bullet extends Entity {
  vx: number;
  vy: number;
  damage: number;
  life: number;
}

interface Gem extends Entity {
  value: number;
  vx: number;
  vy: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

// --- MATH UTILS ---
const distSq = (p1: Entity, p2: Entity) =>
  (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
const normalize = (v: Vector): Vector => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
};

// --- MAIN COMPONENT ---
export default function NeonSurvivor() {
  // UI State
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [xp, setXp] = useState(0);
  const [maxXp, setMaxXp] = useState(100);
  const [upgradeOptions, setUpgradeOptions] = useState<any[]>([]);

  // Engine Refs (Mutable state for performance)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const frameCount = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});

  // Game Entities Refs
  const player = useRef<Player>({
    id: 0,
    x: 400,
    y: 300,
    radius: 12,
    color: "#06b6d4",
    markedForDeletion: false,
    vx: 0,
    vy: 0,
    hp: 100,
    maxHp: 100,
    xp: 0,
    maxXp: 100,
    level: 1,
    weapons: {
      fireRate: 20,
      damage: 25,
      speed: 10,
      projectiles: 1,
      lastFired: 0,
    },
    stats: { moveSpeed: 0.5, pickupRange: 100 },
  });
  const enemies = useRef<Enemy[]>([]);
  const bullets = useRef<Bullet[]>([]);
  const gems = useRef<Gem[]>([]);
  const texts = useRef<FloatingText[]>([]);
  const camera = useRef({ x: 0, y: 0 });

  // --- INPUT HANDLING ---
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      e.preventDefault();
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      e.preventDefault();
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // --- UPGRADE SYSTEM ---
  const generateUpgrades = useCallback(() => {
    const upgrades = [
      {
        id: "dmg",
        name: "High Voltage",
        desc: "+25% Damage",
        icon: Zap,
        color: "text-yellow-400",
        apply: (p: Player) => (p.weapons.damage *= 1.25),
      },
      {
        id: "rate",
        name: "Overclock",
        desc: "+20% Fire Rate",
        icon: Crosshair,
        color: "text-red-400",
        apply: (p: Player) =>
          (p.weapons.fireRate = Math.max(5, p.weapons.fireRate * 0.8)),
      },
      {
        id: "speed",
        name: "Light Speed",
        desc: "+15% Move Speed",
        icon: Play,
        color: "text-cyan-400",
        apply: (p: Player) => (p.stats.moveSpeed *= 1.15),
      },
      {
        id: "health",
        name: "Reinforced Hull",
        desc: "Heal 50% & +20 Max HP",
        icon: Shield,
        color: "text-green-400",
        apply: (p: Player) => {
          p.maxHp += 20;
          p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.5);
        },
      },
      {
        id: "multi",
        name: "Split Threading",
        desc: "+1 Projectile",
        icon: Hexagon,
        color: "text-purple-400",
        apply: (p: Player) => (p.weapons.projectiles += 1),
      },
    ];
    // Pick 3 random
    return upgrades.sort(() => 0.5 - Math.random()).slice(0, 3);
  }, []);

  const selectUpgrade = (upgrade: any) => {
    upgrade.apply(player.current);
    // Sync React State for UI
    setMaxHp(player.current.maxHp);
    setHp(player.current.hp);
    setGameState("PLAYING");
  };

  // --- SPAWN LOGIC ---
  const spawnEnemy = (canvasW: number, canvasH: number) => {
    // Spawn outside camera view
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(canvasW, canvasH) / 2 + 100;
    const x = player.current.x + Math.cos(angle) * dist;
    const y = player.current.y + Math.sin(angle) * dist;

    // Difficulty Scaling
    const difficulty = 1 + player.current.level * 0.1;
    const rand = Math.random();
    let type: Enemy["type"] = "BASIC";
    let stats = { hp: 20, speed: 1.5, radius: 10, color: "#ef4444", xp: 1 };

    if (rand > 0.95) {
      type = "TANK";
      stats = {
        hp: 100 * difficulty,
        speed: 0.8,
        radius: 20,
        color: "#a855f7",
        xp: 10,
      };
    } else if (rand > 0.8) {
      type = "RUSHER";
      stats = {
        hp: 10 * difficulty,
        speed: 3.5,
        radius: 8,
        color: "#f97316",
        xp: 3,
      };
    } else {
      stats.hp *= difficulty;
    }

    enemies.current.push({
      id: Math.random(),
      x,
      y,
      damage: 10,
      xpValue: stats.xp,
      markedForDeletion: false,
      type,
      ...stats,
    });
  };

  // --- GAME LOOP ---
  const loop = useCallback(() => {
    if (gameState !== "PLAYING") {
      // Still draw if paused, but don't update
      if (gameState === "PAUSED_UPGRADE" || gameState === "GAME_OVER") {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) draw(ctx);
      }
      requestRef.current = requestAnimationFrame(loop);
      return;
    }

    update();
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  }, [gameState]);

  // --- PHYSICS UPDATE ---
  const update = () => {
    const p = player.current;
    frameCount.current++;

    // 1. Player Movement (Acceleration based)
    if (keys.current["ArrowUp"] || keys.current["KeyW"])
      p.vy -= p.stats.moveSpeed;
    if (keys.current["ArrowDown"] || keys.current["KeyS"])
      p.vy += p.stats.moveSpeed;
    if (keys.current["ArrowLeft"] || keys.current["KeyA"])
      p.vx -= p.stats.moveSpeed;
    if (keys.current["ArrowRight"] || keys.current["KeyD"])
      p.vx += p.stats.moveSpeed;

    p.vx *= FRICTION;
    p.vy *= FRICTION;
    p.x += p.vx;
    p.y += p.vy;

    // 2. Camera Follow
    const canvas = canvasRef.current;
    if (canvas) {
      camera.current.x = p.x - canvas.width / 2;
      camera.current.y = p.y - canvas.height / 2;
    }

    // 3. Weapons (Auto-fire closest)
    if (frameCount.current - p.weapons.lastFired > p.weapons.fireRate) {
      let closest: Enemy | null = null;
      let minDst = Infinity;

      // Find closest enemy
      for (const e of enemies.current) {
        const d = distSq(p, e);
        if (d < minDst) {
          minDst = d;
          closest = e;
        }
      }

      if (closest && minDst < 400000) {
        // Range check
        const angle = Math.atan2(closest.y - p.y, closest.x - p.x);
        // Multi-shot logic
        for (let i = 0; i < p.weapons.projectiles; i++) {
          const spread = (i - (p.weapons.projectiles - 1) / 2) * 0.2;
          bullets.current.push({
            id: Math.random(),
            x: p.x,
            y: p.y,
            radius: 4,
            color: "#fcd34d",
            vx: Math.cos(angle + spread) * p.weapons.speed,
            vy: Math.sin(angle + spread) * p.weapons.speed,
            damage: p.weapons.damage,
            life: 60,
            markedForDeletion: false,
          });
        }
        p.weapons.lastFired = frameCount.current;
      }
    }

    // 4. Update Bullets
    for (const b of bullets.current) {
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0) b.markedForDeletion = true;
    }

    // 5. Update Enemies (Swarm Logic)
    for (const e of enemies.current) {
      // Move towards player
      const angle = Math.atan2(p.y - e.y, p.x - e.x);
      e.x += Math.cos(angle) * e.speed;
      e.y += Math.sin(angle) * e.speed;

      // Soft Collision (Separation) - Boids Lite
      for (const other of enemies.current) {
        if (e === other) continue;
        const d = distSq(e, other);
        const minDist = e.radius + other.radius;
        if (d < minDist * minDist) {
          const pushAngle = Math.atan2(e.y - other.y, e.x - other.x);
          e.x += Math.cos(pushAngle) * 0.5;
          e.y += Math.sin(pushAngle) * 0.5;
        }
      }

      // Hit Player
      if (distSq(e, p) < (e.radius + p.radius) ** 2) {
        if (frameCount.current % 30 === 0) {
          // i-frames
          p.hp -= 10;
          texts.current.push({
            id: Math.random(),
            x: p.x,
            y: p.y - 20,
            text: "-10",
            life: 30,
            color: "red",
          });
          setHp(Math.max(0, Math.floor(p.hp))); // Sync UI
          if (p.hp <= 0) setGameState("GAME_OVER");
        }
      }

      // Hit by Bullet
      for (const b of bullets.current) {
        if (b.markedForDeletion) continue;
        if (distSq(e, b) < (e.radius + b.radius + 10) ** 2) {
          e.hp -= b.damage;
          b.markedForDeletion = true;
          texts.current.push({
            id: Math.random(),
            x: e.x,
            y: e.y,
            text: Math.floor(b.damage).toString(),
            life: 20,
            color: "white",
          });

          if (e.hp <= 0) {
            e.markedForDeletion = true;
            // Drop Gem
            gems.current.push({
              id: Math.random(),
              x: e.x,
              y: e.y,
              radius: 4,
              color: "#34d399",
              value: e.xpValue,
              vx: 0,
              vy: 0,
              markedForDeletion: false,
            });
            setScore((s) => s + e.xpValue * 10);
          }
        }
      }
    }

    // 6. Update Gems (Magnet)
    for (const g of gems.current) {
      const d = distSq(g, p);
      if (d < MAGNET_RANGE * MAGNET_RANGE) {
        g.x += (p.x - g.x) * 0.15;
        g.y += (p.y - g.y) * 0.15;
        if (d < (p.radius + g.radius) ** 2) {
          g.markedForDeletion = true;
          p.xp += g.value;
          setXp(Math.floor(p.xp)); // Sync UI
          if (p.xp >= p.maxXp) {
            // LEVEL UP
            p.level++;
            p.xp = 0;
            p.maxXp = Math.floor(p.maxXp * 1.5);
            setLevel(p.level);
            setXp(0);
            setMaxXp(p.maxXp);
            setUpgradeOptions(generateUpgrades());
            setGameState("PAUSED_UPGRADE");
          }
        }
      }
    }

    // 7. Spawner
    if (
      frameCount.current % Math.max(10, ENEMY_SPAWN_RATE_INITIAL - p.level) ===
      0
    ) {
      if (canvas) spawnEnemy(canvas.width, canvas.height);
    }

    // 8. Cleanup
    bullets.current = bullets.current.filter((b) => !b.markedForDeletion);
    enemies.current = enemies.current.filter((e) => !e.markedForDeletion);
    gems.current = gems.current.filter((g) => !g.markedForDeletion);
    texts.current = texts.current.filter((t) => t.life > 0);
    texts.current.forEach((t) => {
      t.y -= 1;
      t.life--;
    });
  };

  // --- RENDERER ---
  const draw = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background Grid (Simulates movement)
    const gridSize = 50;
    const offX = -camera.current.x % gridSize;
    const offY = -camera.current.y % gridSize;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = offX; x < canvas.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = offY; y < canvas.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    ctx.save();
    // Move world relative to player (center screen)
    ctx.translate(-camera.current.x, -camera.current.y);

    // Draw Gems
    gems.current.forEach((g) => {
      ctx.shadowBlur = 5;
      ctx.shadowColor = g.color;
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Player
    const p = player.current;
    ctx.shadowBlur = 15;
    ctx.shadowColor = p.color;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw Bullets
    bullets.current.forEach((b) => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = b.color;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Enemies
    enemies.current.forEach((e) => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = e.color;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 2;
      ctx.fillStyle = "black";
      ctx.beginPath();
      if (e.type === "BASIC")
        ctx.rect(e.x - e.radius, e.y - e.radius, e.radius * 2, e.radius * 2);
      else if (e.type === "RUSHER") {
        ctx.moveTo(e.x, e.y - e.radius);
        ctx.lineTo(e.x - e.radius, e.y + e.radius);
        ctx.lineTo(e.x + e.radius, e.y + e.radius);
        ctx.closePath();
      } else {
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
    });

    // Draw Texts
    texts.current.forEach((t) => {
      ctx.fillStyle = t.color;
      ctx.font = "bold 14px monospace";
      ctx.shadowBlur = 0;
      ctx.fillText(t.text, t.x, t.y);
    });

    ctx.restore();
  };

  // --- LIFECYCLE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = 600;
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [loop]);

  const restart = () => {
    // Reset Everything
    setScore(0);
    setLevel(1);
    setHp(100);
    setMaxHp(100);
    setXp(0);
    setMaxXp(100);
    player.current = {
      ...player.current,
      x: 400,
      y: 300,
      hp: 100,
      maxHp: 100,
      xp: 0,
      maxXp: 100,
      level: 1,
      weapons: {
        fireRate: 20,
        damage: 25,
        speed: 10,
        projectiles: 1,
        lastFired: 0,
      },
      stats: { moveSpeed: 4, pickupRange: 100 },
    };
    enemies.current = [];
    bullets.current = [];
    gems.current = [];
    texts.current = [];
    setGameState("PLAYING");
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl font-mono select-none group">
      {/* GAME CANVAS */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair bg-[#050505]"
      />

      {/* HUD LAYER */}
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            {/* HP BAR */}
            <div className="w-48 h-6 bg-gray-800 rounded-full border border-white/20 overflow-hidden relative">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(hp / maxHp) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white shadow-black drop-shadow-md">
                {Math.ceil(hp)} / {maxHp}
              </span>
            </div>
            {/* XP BAR */}
            <div className="w-48 h-4 bg-gray-800 rounded-full border border-white/20 overflow-hidden relative">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${(xp / maxXp) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black">
                LVL {level}
              </span>
            </div>
          </div>
          <div className="text-cyan-400 font-bold text-xl drop-shadow-md">
            SCORE: {score}
          </div>
        </div>
      </div>

      {/* START SCREEN */}
      {gameState === "MENU" && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4 tracking-tighter">
            NEON SURVIVOR
          </h1>
          <p className="text-gray-400 mb-8">WASD to Move. Auto-Aim Enabled.</p>
          <button
            onClick={restart}
            className="flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            <Play fill="currentColor" /> INITIATE RUN
          </button>
        </div>
      )}

      {/* LEVEL UP MODAL */}
      {gameState === "PAUSED_UPGRADE" && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <h2 className="text-4xl font-bold text-yellow-400 mb-2">
            SYSTEM UPGRADE
          </h2>
          <p className="text-gray-400 mb-8">Choose a patch module</p>
          <div className="flex gap-4">
            {upgradeOptions.map((up, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => selectUpgrade(up)}
                className="w-48 h-64 bg-gray-800 border-2 border-white/10 hover:border-cyan-400 rounded-2xl p-6 flex flex-col items-center text-center gap-4 transition-colors"
              >
                <div className={`p-4 rounded-full bg-white/5 ${up.color}`}>
                  <up.icon size={40} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${up.color}`}>{up.name}</h3>
                  <p className="text-sm text-gray-400 mt-2">{up.desc}</p>
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">
                  Select
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === "GAME_OVER" && (
        <div className="absolute inset-0 bg-red-900/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <h2 className="text-5xl font-bold text-white mb-2">
            CRITICAL FAILURE
          </h2>
          <p className="text-xl text-red-200 mb-8">Survived to Level {level}</p>
          <button
            onClick={restart}
            className="flex items-center gap-2 px-8 py-4 bg-white text-red-900 font-bold rounded-xl transition-all hover:scale-105"
          >
            <RotateCcw /> REBOOT SYSTEM
          </button>
        </div>
      )}
    </div>
  );
}
