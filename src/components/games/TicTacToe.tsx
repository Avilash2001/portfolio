"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Circle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Player = "X" | "O" | null;

const TicTacToe = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | "Draw">(null);

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return squares.every((square) => square !== null) ? "Draw" : null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 w-full max-w-md mx-auto shadow-2xl">
      <div className="flex justify-between items-center w-full px-4">
        <h3 className="text-2xl font-bold gradient-text">Cosmic Tic-Tac-Toe</h3>
        <div className="text-sm text-gray-400">
          {winner ? (
            <span
              className={
                winner === "X"
                  ? "text-cyan-400"
                  : winner === "O"
                  ? "text-fuchsia-400"
                  : "text-yellow-400"
              }
            >
              {winner === "Draw" ? "It's a Draw!" : `${winner} Wins!`}
            </span>
          ) : (
            <span>
              Turn:{" "}
              <span className={isXNext ? "text-cyan-400" : "text-fuchsia-400"}>
                {isXNext ? "Player X" : "Player O"}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        {board.map((square, i) => (
          <motion.button
            key={i}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(i)}
            className="aspect-square bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-4xl hover:border-white/20 transition-colors"
          >
            {square === "X" && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-cyan-400"
              >
                <X size={48} strokeWidth={2.5} />
              </motion.div>
            )}
            {square === "O" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-fuchsia-400"
              >
                <Circle size={40} strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm font-medium border border-white/10 hover:border-white/30"
      >
        <RotateCcw size={16} /> Reset Game
      </button>
    </div>
  );
};

export default TicTacToe;
