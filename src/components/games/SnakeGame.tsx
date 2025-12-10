"use client";
import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw } from "lucide-react";

const GRID_SIZE = 20;
const SPEED = 100;

export default function SnakeGame() {
  const [snake, setSnake] = useState([[5, 5]]);
  const [food, setFood] = useState([10, 10]);
  const [dir, setDir] = useState([0, 1]);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const gameLoop = useRef<NodeJS.Timeout | null>(null);

  const spawnFood = () => [
    Math.floor(Math.random() * GRID_SIZE),
    Math.floor(Math.random() * GRID_SIZE),
  ];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "ArrowUp" && dir[1] !== 1) setDir([0, -1]);
      if (e.key === "ArrowDown" && dir[1] !== -1) setDir([0, 1]);
      if (e.key === "ArrowLeft" && dir[0] !== 1) setDir([-1, 0]);
      if (e.key === "ArrowRight" && dir[0] !== -1) setDir([1, 0]);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, dir]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoop.current = setInterval(() => {
        setSnake((prev) => {
          const newHead = [prev[0][0] + dir[0], prev[0][1] + dir[1]];

          if (
            newHead[0] < 0 ||
            newHead[0] >= GRID_SIZE ||
            newHead[1] < 0 ||
            newHead[1] >= GRID_SIZE ||
            prev.some((s) => s[0] === newHead[0] && s[1] === newHead[1])
          ) {
            setGameOver(true);
            setIsPlaying(false);
            return prev;
          }
          const newSnake = [newHead, ...prev];
          if (newHead[0] === food[0] && newHead[1] === food[1]) {
            setScore((s) => s + 1);
            setFood(spawnFood());
          } else {
            newSnake.pop();
          }
          return newSnake;
        });
      }, SPEED);
    } else if (gameLoop.current) clearInterval(gameLoop.current);

    return () => {
      if (gameLoop.current) clearInterval(gameLoop.current);
    };
  }, [isPlaying, dir, food, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-[300px]">
        <span className="text-cyan-400 font-bold">Score: {score}</span>
        <button
          onClick={() => {
            setSnake([[5, 5]]);
            setDir([0, 1]);
            setGameOver(false);
            setScore(0);
            setIsPlaying(true);
          }}
          className="p-1 bg-white/10 rounded hover:bg-white/20"
        >
          {gameOver ? <RotateCcw size={16} /> : <Play size={16} />}
        </button>
      </div>
      <div
        className="grid bg-black border border-white/20 relative"
        style={{
          width: 300,
          height: 300,
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-red-500 font-bold z-10">
            GAME OVER
          </div>
        )}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some((s) => s[0] === x && s[1] === y);
          const isFood = food[0] === x && food[1] === y;
          return (
            <div
              key={i}
              className={`${
                isSnake
                  ? "bg-cyan-500 rounded-sm"
                  : isFood
                  ? "bg-red-500 rounded-full scale-75"
                  : "bg-transparent"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
