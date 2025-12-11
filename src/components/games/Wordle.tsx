"use client";

import React, { useEffect, useState } from "react";
import { RotateCcw, Type } from "lucide-react";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const KEYS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

export default function Wordle() {
  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [usedKeys, setUsedKeys] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState(""); // Replaces toast

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  const fetchWord = async () => {
    try {
      const res = await fetch("https://api.datamuse.com/words?sp=?????&max=50");
      const data = await res.json();
      const words = data
        .map((w: { word: string }) => w.word.toUpperCase())
        .filter((w: string) => /^[A-Z]{5}$/.test(w));
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setWord(randomWord || "REACT"); // Fallback
    } catch (e) {
      setWord("REACT");
    }
  };

  const validateWord = async (guess: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `https://api.datamuse.com/words?sp=${guess.toLowerCase()}&max=1`
      );
      const data = await res.json();
      return data.length > 0 && data[0].word.toUpperCase() === guess;
    } catch (e) {
      return true; // Offline fallback
    }
  };

  const handleGuess = async () => {
    if (currentGuess.length !== WORD_LENGTH) {
      showToast("Too short!");
      return;
    }

    const isValid = await validateWord(currentGuess);
    if (!isValid) {
      showToast("Not a valid word");
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    const updatedKeys = { ...usedKeys };
    currentGuess.split("").forEach((char, idx) => {
      if (word[idx] === char) {
        updatedKeys[char] = "bg-green-600 border-green-600";
      } else if (word.includes(char)) {
        if (updatedKeys[char] !== "bg-green-600 border-green-600")
          updatedKeys[char] = "bg-yellow-600 border-yellow-600";
      } else {
        if (!updatedKeys[char]) updatedKeys[char] = "bg-slate-700 opacity-50";
      }
    });
    setUsedKeys(updatedKeys);

    if (currentGuess === word) {
      setStatus("won");
      setGameOver(true);
      showToast("Genius!");
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setStatus("lost");
      setGameOver(true);
      showToast(`Word was: ${word}`);
    }
  };

  const handleReset = () => {
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setStatus("playing");
    setUsedKeys({});
    fetchWord();
  };

  const handleVirtualKey = (key: string) => {
    if (gameOver) return;
    if (key === "ENTER") {
      handleGuess();
    } else if (key === "BACK") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const getBoxStyle = (char: string, index: number) => {
    if (!char) return "border-slate-700 bg-transparent";
    // Active typing state
    if (!guesses.flat().includes(char) && guesses.length === index)
      return "border-slate-400 bg-slate-800";

    if (word[index] === char) return "bg-green-600 border-green-600";
    if (word.includes(char)) return "bg-yellow-600 border-yellow-600";
    return "bg-slate-700 border-slate-700";
  };

  // Determine style for specific row/col in the grid
  const getCellStyle = (rowIndex: number, colIndex: number, char: string) => {
    // If this is the current row being typed
    if (rowIndex === guesses.length) {
      return "border-slate-500 text-white";
    }
    // If this is a future empty row
    if (rowIndex > guesses.length) {
      return "border-slate-800 text-slate-500";
    }
    // Past guesses (Completed rows)
    const guess = guesses[rowIndex];
    const guessChar = guess[colIndex];

    if (word[colIndex] === guessChar)
      return "bg-green-600 border-green-600 text-white";
    if (word.includes(guessChar))
      return "bg-yellow-600 border-yellow-600 text-white";
    return "bg-slate-700 border-slate-700 text-white";
  };

  useEffect(() => {
    fetchWord();
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (gameOver) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER") {
        handleGuess();
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (
        /^[A-Z]$/.test(key) &&
        key.length === 1 &&
        currentGuess.length < WORD_LENGTH
      ) {
        setCurrentGuess((prev) => prev + key);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [currentGuess, gameOver]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto p-4 bg-gray-900 rounded-2xl shadow-2xl border border-white/10 select-none">
      {/* HEADER */}
      <div className="flex justify-between w-full items-center px-2">
        <div className="flex items-center gap-2 text-xl font-bold text-white">
          <Type className="text-green-500" /> Wordle
        </div>
        <button
          onClick={handleReset}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <RotateCcw size={18} className="text-white" />
        </button>
      </div>

      {/* MESSAGE TOAST */}
      <div className="h-6">
        {message && (
          <span className="px-4 py-1 bg-white text-black font-bold rounded-full text-sm animate-pulse">
            {message}
          </span>
        )}
      </div>

      {/* GRID */}
      <div className="grid gap-1.5 p-4 bg-black/40 rounded-xl border border-white/5">
        {[...Array(MAX_ATTEMPTS)].map((_, rowIdx) => {
          const guess =
            guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess : "");
          return (
            <div key={rowIdx} className="flex gap-1.5">
              {[...Array(WORD_LENGTH)].map((_, colIdx) => {
                const char = guess[colIdx] || "";
                return (
                  <div
                    key={colIdx}
                    className={`w-10 h-10 sm:w-12 sm:h-12 border-2 rounded font-bold text-2xl flex items-center justify-center transition-all duration-300
                      ${getCellStyle(rowIdx, colIdx, char)}
                    `}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* KEYBOARD */}
      <div className="flex flex-col gap-2 w-full">
        {KEYS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleVirtualKey(key)}
                className={`
                  text-xs sm:text-sm py-3 px-1 sm:px-3 rounded font-bold transition-all active:scale-95
                  ${
                    key === "ENTER" || key === "BACK"
                      ? "w-12 sm:w-16 text-[10px] sm:text-xs"
                      : "w-7 sm:w-10"
                  }
                  ${
                    usedKeys[key] ||
                    "bg-slate-600 hover:bg-slate-500 text-white"
                  }
                `}
              >
                {key === "BACK" ? "⌫" : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-2xl z-10">
          <h2 className="text-4xl font-bold text-white mb-2">
            {status === "won" ? "VICTORY" : "GAME OVER"}
          </h2>
          <p className="text-gray-400 mb-6">
            The word was:{" "}
            <span className="text-cyan-400 font-bold">{word}</span>
          </p>
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
