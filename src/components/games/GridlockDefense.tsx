"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  MousePointer2,
  Zap,
  Shield,
  Ban,
  Pause,
  Plane,
  Skull,
} from "lucide-react";

const GRID_W = 20;
const GRID_H = 15;
const CELL_SIZE = 30;

type NodeType =
  | "EMPTY"
  | "WALL"
  | "START"
  | "END"
  | "TOWER_BASIC"
  | "TOWER_SNIPER"
  | "TOWER_RAPID";
type EnemyType = "BASIC" | "SWARM" | "TANK" | "AIR";

interface Node {
  x: number;
  y: number;
  type: NodeType;
  f: number;
  g: number;
  h: number;
  parent: Node | null;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  type: EnemyType;
  shield: number;
  maxShield: number;
  armor: number;
  path: Node[];
  color: string;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId: number;
  damage: number;
  speed: number;
  color: string;
  type: "KINETIC" | "ENERGY" | "EXPLOSIVE";
}

interface TowerStats {
  range: number;
  damage: number;
  cooldown: number;
  cost: number;
  color: string;
  name: string;
  type: Projectile["type"];
  desc: string;
}

const TOWERS: Record<string, TowerStats> = {
  TOWER_BASIC: {
    range: 4,
    damage: 25,
    cooldown: 40,
    cost: 60,
    color: "#06b6d4",
    name: "Turret",
    type: "KINETIC",
    desc: "Balanced. Good vs Basic.",
  },
  TOWER_SNIPER: {
    range: 9,
    damage: 150,
    cooldown: 150,
    cost: 150,
    color: "#ef4444",
    name: "Sniper",
    type: "EXPLOSIVE",
    desc: "Crushes Armor. Slow.",
  },
  TOWER_RAPID: {
    range: 3.5,
    damage: 6,
    cooldown: 6,
    cost: 220,
    color: "#eab308",
    name: "Blaster",
    type: "ENERGY",
    desc: "Shreds Shields. Weak vs Armor.",
  },
};

const getPath = (
  grid: Node[][],
  start: Node,
  end: Node,
  ignoreWalls: boolean = false
): Node[] => {
  for (let row of grid)
    for (let node of row) {
      node.f = 0;
      node.g = 0;
      node.h = 0;
      node.parent = null;
    }

  const openList: Node[] = [start];
  const closedList: Set<Node> = new Set();

  while (openList.length > 0) {
    let lowInd = 0;
    for (let i = 0; i < openList.length; i++)
      if (openList[i].f < openList[lowInd].f) lowInd = i;
    const current = openList[lowInd];

    if (current === end) {
      const path: Node[] = [];
      let curr: Node | null = current;
      while (curr) {
        path.push(curr);
        curr = curr.parent;
      }
      return path.reverse();
    }

    openList.splice(lowInd, 1);
    closedList.add(current);

    const neighbors = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    for (let n of neighbors) {
      const ny = current.y + n.y;
      const nx = current.x + n.x;

      if (ny >= 0 && ny < GRID_H && nx >= 0 && nx < GRID_W) {
        const neighbor = grid[ny][nx];

        if (closedList.has(neighbor)) continue;
        if (
          !ignoreWalls &&
          (neighbor.type === "WALL" || neighbor.type.includes("TOWER"))
        )
          continue;

        const gScore = current.g + 1;
        let gScoreIsBest = false;

        if (!openList.includes(neighbor)) {
          gScoreIsBest = true;
          neighbor.h =
            Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
          openList.push(neighbor);
        } else if (gScore < neighbor.g) {
          gScoreIsBest = true;
        }

        if (gScoreIsBest) {
          neighbor.parent = current;
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
        }
      }
    }
  }
  return [];
};

export default function GridlockDefense() {
  const [money, setMoney] = useState(200);
  const [lives, setLives] = useState(10);
  const [wave, setWave] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTool, setSelectedTool] = useState<NodeType | "WALL">("WALL");
  const [message, setMessage] = useState("");
  const [nextWaveInfo, setNextWaveInfo] = useState("Wave 1: Basic Grunts");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const frameCount = useRef(0);
  const isPlayingRef = useRef(false);

  const grid = useRef<Node[][]>([]);
  const enemies = useRef<Enemy[]>([]);
  const projectiles = useRef<Projectile[]>([]);
  const towers = useRef<
    { x: number; y: number; type: string; lastShot: number }[]
  >([]);
  const startNode = useRef({ x: 0, y: 7 });
  const endNode = useRef({ x: 19, y: 7 });
  const cachedPath = useRef<Node[]>([]);

  const waveState = useRef({
    enemiesSpawned: 0,
    enemiesToSpawn: 0,
    spawnCooldown: 0,
    currentType: "BASIC" as EnemyType,
  });

  const initGrid = () => {
    const newGrid: Node[][] = [];
    for (let y = 0; y < GRID_H; y++) {
      const row: Node[] = [];
      for (let x = 0; x < GRID_W; x++) {
        let type: NodeType = "EMPTY";
        if (x === 0 && y === 7) type = "START";
        if (x === 19 && y === 7) type = "END";
        row.push({ x, y, type, f: 0, g: 0, h: 0, parent: null });
      }
      newGrid.push(row);
    }
    grid.current = newGrid;
    recalcPathCache();
  };

  useEffect(() => {
    initGrid();
    setupWave(1);
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const togglePlay = () => {
    if (
      enemies.current.length === 0 &&
      waveState.current.enemiesSpawned >= waveState.current.enemiesToSpawn
    ) {
      setupWave(wave);
    }
    setIsPlaying(!isPlaying);
    isPlayingRef.current = !isPlaying;
  };

  const setupWave = (w: number) => {
    let count = 5 + Math.floor(w * 1.5);
    let type: EnemyType = "BASIC";
    let spawnRate = 60;

    if (w % 5 === 0) {
      type = "TANK";
      count = 3 + Math.floor(w / 5);
      spawnRate = 120;
      setNextWaveInfo(`Wave ${w}: HEAVY ARMOR (Need Snipers)`);
    } else if (w % 3 === 0) {
      type = "AIR";
      count = 5 + w;
      spawnRate = 50;
      setNextWaveInfo(`Wave ${w}: AIR RAID (Ignore Walls!)`);
    } else if (w % 2 === 0) {
      type = "SWARM";
      count = 10 + w * 2;
      spawnRate = 25;
      setNextWaveInfo(`Wave ${w}: SWARM (Need Rapid Fire)`);
    } else {
      setNextWaveInfo(`Wave ${w}: Basic Infantry`);
    }

    waveState.current = {
      enemiesSpawned: 0,
      enemiesToSpawn: count,
      spawnCooldown: spawnRate,
      currentType: type,
    };
  };

  const loop = () => {
    if (isPlayingRef.current && !gameOver) update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  };

  const update = () => {
    frameCount.current++;
    const g = grid.current;

    if (waveState.current.enemiesSpawned < waveState.current.enemiesToSpawn) {
      if (frameCount.current % waveState.current.spawnCooldown === 0) {
        spawnEnemy(waveState.current.currentType);
        waveState.current.enemiesSpawned++;
      }
    } else if (enemies.current.length === 0) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setWave((w) => w + 1);
      setMoney((m) => m + 50 + wave * 10);
      setupWave(wave + 1);
      return;
    }

    for (let i = enemies.current.length - 1; i >= 0; i--) {
      const e = enemies.current[i];

      if (e.path.length > 0) {
        const target = e.path[0];
        const tx = target.x * CELL_SIZE + CELL_SIZE / 2;
        const ty = target.y * CELL_SIZE + CELL_SIZE / 2;
        const dist = Math.hypot(tx - e.x, ty - e.y);

        if (dist < e.speed) {
          e.x = tx;
          e.y = ty;
          e.path.shift();
        } else {
          e.x += ((tx - e.x) / dist) * e.speed;
          e.y += ((ty - e.y) / dist) * e.speed;
        }
      } else {
        setLives((l) => {
          const nl = l - 1;
          if (nl <= 0) {
            setGameOver(true);
            setIsPlaying(false);
            isPlayingRef.current = false;
          }
          return nl;
        });
        enemies.current.splice(i, 1);
      }
    }

    towers.current.forEach((t) => {
      const stats = TOWERS[t.type];
      if (frameCount.current - t.lastShot > stats.cooldown) {
        const target = enemies.current.find(
          (e) =>
            Math.hypot(
              e.x - (t.x * CELL_SIZE + CELL_SIZE / 2),
              e.y - (t.y * CELL_SIZE + CELL_SIZE / 2)
            ) <
            stats.range * CELL_SIZE
        );
        if (target) {
          projectiles.current.push({
            id: Math.random(),
            x: t.x * CELL_SIZE + CELL_SIZE / 2,
            y: t.y * CELL_SIZE + CELL_SIZE / 2,
            targetId: target.id,
            damage: stats.damage,
            speed: 12,
            color: stats.color,
            type: stats.type,
          });
          t.lastShot = frameCount.current;
        }
      }
    });

    for (let i = projectiles.current.length - 1; i >= 0; i--) {
      const p = projectiles.current[i];
      const target = enemies.current.find((e) => e.id === p.targetId);
      if (!target) {
        projectiles.current.splice(i, 1);
        continue;
      }

      const dist = Math.hypot(target.x - p.x, target.y - p.y);
      if (dist < p.speed) {
        let actualDmg = p.damage;

        if (target.shield > 0) {
          if (p.type === "ENERGY") {
            target.shield = Math.max(0, target.shield - 5);
            actualDmg = p.damage;
          } else {
            target.shield -= 1;
            actualDmg = 0;
          }
        }

        if (actualDmg > 0 && target.armor > 0) {
          if (p.type === "EXPLOSIVE") {
          } else if (p.type === "ENERGY") {
            actualDmg = Math.max(1, actualDmg - target.armor);
          } else {
            actualDmg = Math.max(1, actualDmg - target.armor / 2);
          }
        }

        target.hp -= actualDmg;

        if (target.hp <= 0) {
          const idx = enemies.current.indexOf(target);
          if (idx > -1) {
            enemies.current.splice(idx, 1);
            setMoney((m) => m + (target.type === "TANK" ? 15 : 5));
          }
        }
        projectiles.current.splice(i, 1);
      } else {
        p.x += ((target.x - p.x) / dist) * p.speed;
        p.y += ((target.y - p.y) / dist) * p.speed;
      }
    }
  };

  const spawnEnemy = (type: EnemyType) => {
    const g = grid.current;
    const start = g[startNode.current.y][startNode.current.x];
    const end = g[endNode.current.y][endNode.current.x];

    const path = getPath(g, start, end, type === "AIR");
    if (path.length === 0 && type !== "AIR") return;

    let stats = {
      hp: 50,
      maxHp: 50,
      speed: 1.5,
      shield: 0,
      maxShield: 0,
      armor: 0,
      color: "#fff",
    };
    const scaling = 1 + wave * 0.2;

    switch (type) {
      case "SWARM":
        stats = {
          hp: 20 * scaling,
          maxHp: 20 * scaling,
          speed: 2.5,
          shield: 2,
          maxShield: 2,
          armor: 0,
          color: "#eab308",
        };
        break;
      case "TANK":
        stats = {
          hp: 300 * scaling,
          maxHp: 300 * scaling,
          speed: 0.8,
          shield: 0,
          maxShield: 0,
          armor: 20,
          color: "#a855f7",
        };
        break;
      case "AIR":
        stats = {
          hp: 60 * scaling,
          maxHp: 60 * scaling,
          speed: 2.0,
          shield: 0,
          maxShield: 0,
          armor: 0,
          color: "#fff",
        };
        break;
      default:
        stats = {
          hp: 60 * scaling,
          maxHp: 60 * scaling,
          speed: 1.5,
          shield: 0,
          maxShield: 0,
          armor: 2,
          color: "#ef4444",
        };
    }

    enemies.current.push({
      id: Math.random(),
      x: startNode.current.x * CELL_SIZE + CELL_SIZE / 2,
      y: startNode.current.y * CELL_SIZE + CELL_SIZE / 2,
      path,
      type,
      ...stats,
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const g = grid.current;
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const cell = g[y][x];
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;

        ctx.strokeStyle = "#222";
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);

        if (cell.type === "WALL") {
          ctx.fillStyle = "#334155";
          ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);

          ctx.fillStyle = "#1e293b";
          ctx.fillRect(px + 4, py + 4, CELL_SIZE - 8, CELL_SIZE - 8);
        } else if (cell.type.includes("TOWER")) {
          ctx.fillStyle = TOWERS[cell.type].color;
          ctx.beginPath();
          ctx.arc(
            px + CELL_SIZE / 2,
            py + CELL_SIZE / 2,
            CELL_SIZE / 2 - 4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (cell.type === "START") {
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        } else if (cell.type === "END") {
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    if (cachedPath.current.length > 0) {
      ctx.strokeStyle = "rgba(6, 182, 212, 0.1)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      const start = cachedPath.current[0];
      if (start) {
        ctx.moveTo(
          start.x * CELL_SIZE + CELL_SIZE / 2,
          start.y * CELL_SIZE + CELL_SIZE / 2
        );
        for (let i = 1; i < cachedPath.current.length; i++) {
          const node = cachedPath.current[i];
          ctx.lineTo(
            node.x * CELL_SIZE + CELL_SIZE / 2,
            node.y * CELL_SIZE + CELL_SIZE / 2
          );
        }
        ctx.stroke();
      }
    }

    enemies.current.forEach((e) => {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      if (e.type === "TANK") ctx.rect(e.x - 10, e.y - 10, 20, 20);
      else if (e.type === "AIR") {
        ctx.moveTo(e.x, e.y - 10);
        ctx.lineTo(e.x - 10, e.y + 10);
        ctx.lineTo(e.x + 10, e.y + 10);
      } else ctx.arc(e.x, e.y, e.type === "SWARM" ? 6 : 9, 0, Math.PI * 2);
      ctx.fill();

      if (e.shield > 0) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      const hpPercent = e.hp / e.maxHp;
      ctx.fillStyle = "red";
      ctx.fillRect(e.x - 10, e.y - 16, 20, 4);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(e.x - 10, e.y - 16, 20 * hpPercent, 4);
    });

    projectiles.current.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (gameOver || isPlaying) {
      if (isPlaying) setMessage("Cannot build during wave!");
      setTimeout(() => setMessage(""), 1000);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return;
    const cell = grid.current[y][x];

    if (cell.type === "WALL" || cell.type.includes("TOWER")) {
      if (cell.type.includes("TOWER"))
        towers.current = towers.current.filter((t) => t.x !== x || t.y !== y);
      const refund = cell.type === "WALL" ? 5 : TOWERS[cell.type].cost;
      setMoney((m) => m + Math.floor(refund * 0.8));
      cell.type = "EMPTY";
      recalcPaths();
      return;
    }

    if (cell.type !== "EMPTY") return;

    let cost = selectedTool === "WALL" ? 5 : TOWERS[selectedTool].cost;
    if (money >= cost) {
      const originalType = cell.type;
      cell.type = selectedTool;

      const g = grid.current;
      const path = getPath(
        g,
        g[startNode.current.y][startNode.current.x],
        g[endNode.current.y][endNode.current.x]
      );

      if (path.length > 0) {
        setMoney((m) => m - cost);
        if (selectedTool !== "WALL")
          towers.current.push({ x, y, type: selectedTool, lastShot: 0 });
        recalcPaths();
      } else {
        cell.type = originalType;
        setMessage("Cannot block path!");
        setTimeout(() => setMessage(""), 1000);
      }
    } else {
      setMessage("Insufficient Credits!");
      setTimeout(() => setMessage(""), 1000);
    }
  };

  const recalcPathCache = () => {
    const g = grid.current;
    cachedPath.current = getPath(
      g,
      g[startNode.current.y][startNode.current.x],
      g[endNode.current.y][endNode.current.x]
    );
  };

  const recalcPaths = () => {
    recalcPathCache();
    const g = grid.current;
    const end = g[endNode.current.y][endNode.current.x];

    enemies.current.forEach((e) => {
      const currentGridNode =
        g[Math.floor(e.y / CELL_SIZE)][Math.floor(e.x / CELL_SIZE)];

      const newPath = getPath(g, currentGridNode, end, e.type === "AIR");

      if (newPath.length > 0) {
        e.path = newPath;
      }
    });
  };

  const restart = () => {
    initGrid();
    enemies.current = [];
    projectiles.current = [];
    towers.current = [];
    setMoney(200);
    setLives(10);
    setWave(1);
    setupWave(1);
    setGameOver(false);
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto p-4 bg-gray-900 rounded-2xl shadow-2xl border border-white/10">
      <div className="flex flex-col w-full px-4 gap-2">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-cyan-400" /> Gridlock: Hardcore
          </h2>
          <div className="flex gap-6 text-xl font-mono font-bold">
            <span className="text-yellow-400 drop-shadow-md">CR: {money}</span>
            <span className="text-red-400 drop-shadow-md">HP: {lives}</span>
            <span className="text-blue-400 drop-shadow-md">WAVE: {wave}</span>
          </div>
        </div>
        <div className="w-full bg-black/40 p-2 rounded text-center text-sm font-mono text-cyan-200 border border-white/10">
          NEXT: {nextWaveInfo}
        </div>
      </div>

      <div className="relative border-4 border-gray-800 rounded-xl overflow-hidden bg-[#0a0a0a] group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <canvas
          ref={canvasRef}
          width={GRID_W * CELL_SIZE}
          height={GRID_H * CELL_SIZE}
          onClick={handleCanvasClick}
          className="cursor-crosshair block"
        />

        {message && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 px-6 py-2 bg-red-600/90 text-white font-bold rounded-full animate-bounce pointer-events-none shadow-lg whitespace-nowrap z-20">
            {message}
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center z-30">
            <h3 className="text-5xl font-black text-white mb-2 tracking-tighter">
              MISSION FAILED
            </h3>
            <p className="text-red-200 mb-8 text-xl">
              System Overrun at Wave {wave}
            </p>
            <button
              onClick={restart}
              className="px-8 py-3 bg-white text-red-900 font-bold rounded-full flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
            >
              <RotateCcw size={20} /> REBOOT SYSTEM
            </button>
          </div>
        )}
      </div>

      
      <div className="flex flex-wrap items-center justify-center gap-4 w-full bg-gray-800/80 backdrop-blur p-4 rounded-xl border border-white/5">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg min-w-[180px] justify-center
                ${
                  isPlaying
                    ? "bg-gray-600 text-gray-300"
                    : "bg-green-600 hover:bg-green-500 text-white animate-pulse"
                } 
             `}
        >
          {isPlaying ? (
            <>
              <Pause fill="currentColor" /> IN PROGRESS
            </>
          ) : (
            <>
              <Play fill="currentColor" /> START WAVE
            </>
          )}
        </button>

        <div className="w-px h-12 bg-white/20 mx-2 hidden sm:block" />

        <ToolButton
          active={selectedTool === "WALL"}
          onClick={() => setSelectedTool("WALL")}
          icon={Ban}
          label="Wall"
          cost={5}
          color="bg-slate-600"
          desc="Block Path"
        />
        <ToolButton
          active={selectedTool === "TOWER_BASIC"}
          onClick={() => setSelectedTool("TOWER_BASIC")}
          icon={Zap}
          label="Turret"
          cost={60}
          color="bg-cyan-600"
          desc="Balanced"
        />
        <ToolButton
          active={selectedTool === "TOWER_RAPID"}
          onClick={() => setSelectedTool("TOWER_RAPID")}
          icon={Shield}
          label="Blaster"
          cost={220}
          color="bg-yellow-600"
          desc="Anti-Shield"
        />
        <ToolButton
          active={selectedTool === "TOWER_SNIPER"}
          onClick={() => setSelectedTool("TOWER_SNIPER")}
          icon={MousePointer2}
          label="Sniper"
          cost={150}
          color="bg-red-600"
          desc="Anti-Armor"
        />
      </div>

      <p className="text-xs text-gray-500 max-w-2xl text-center">
        TIP: Check the NEXT wave info. Use Blasters for yellow Shields, Snipers
        for purple Armor. Air units ignore walls.
      </p>
    </div>
  );
}

const ToolButton = ({
  active,
  onClick,
  icon: Icon,
  label,
  cost,
  color,
  desc,
}: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-20 h-24 rounded-xl border-2 transition-all relative overflow-hidden group
            ${
              active
                ? "border-white scale-110 shadow-lg z-10 ring-2 ring-white/20"
                : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
            }
            ${color}
        `}
  >
    <Icon className="text-white mb-1 relative z-10" size={24} />
    <span className="text-[10px] font-bold text-white uppercase relative z-10">
      {label}
    </span>
    <span className="text-xs text-white/90 relative z-10 font-mono">
      ${cost}
    </span>
    <span className="text-[9px] text-white/70 relative z-10 mt-1">{desc}</span>
    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
  </button>
);
