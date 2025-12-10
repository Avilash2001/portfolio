"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Database, Globe, Cpu, Server, Terminal, RotateCcw } from "lucide-react";

const CARD_PAIRS = [
  { id: 1, icon: Code2, color: "text-cyan-400" },
  { id: 2, icon: Database, color: "text-green-400" },
  { id: 3, icon: Globe, color: "text-blue-400" },
  { id: 4, icon: Cpu, color: "text-purple-400" },
  { id: 5, icon: Server, color: "text-yellow-400" },
  { id: 6, icon: Terminal, color: "text-red-400" },
];

interface Card {
  id: number;
  pairId: number;
  icon: any;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMatch = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState<Card | null>(null);
  const [choiceTwo, setChoiceTwo] = useState<Card | null>(null);
  const [disabled, setDisabled] = useState(false);

  const shuffleCards = () => {
    const shuffled = [...CARD_PAIRS, ...CARD_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, pairId: Math.random(), isFlipped: false, isMatched: false }));

    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffled);
    setTurns(0);
  };

  const handleChoice = (card: Card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      if (choiceOne.id === choiceTwo.id) {
        setCards(prev => prev.map(card => 
          card.id === choiceOne.id ? { ...card, isMatched: true } : card
        ));
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(prev => prev + 1);
    setDisabled(false);
  };

  useEffect(() => { shuffleCards(); }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center w-full px-2">
        <span className="text-xl font-bold">Turns: <span className="text-cyan-400">{turns}</span></span>
        <button onClick={shuffleCards} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 w-full">
        {cards.map(card => (
          <div key={card.pairId} className="relative aspect-square">
            <motion.div
              className={`w-full h-full rounded-xl cursor-pointer transition-all duration-500 transform border border-white/10
                ${(card.isFlipped || card.isMatched || card === choiceOne || card === choiceTwo) ? "bg-white/10" : "bg-gradient-to-br from-cyan-900/40 to-purple-900/40"}`}
              onClick={() => !disabled && !card.isMatched && card !== choiceOne && handleChoice(card)}
              animate={{ rotateY: (card.isFlipped || card.isMatched || card === choiceOne || card === choiceTwo) ? 180 : 0 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 flex items-center justify-center backface-hidden" style={{ transform: "rotateY(180deg)" }}>
                {(card.isMatched || card === choiceOne || card === choiceTwo) && (
                  <card.icon className={`${card.color} w-8 h-8`} />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center backface-hidden">
                {!card.isMatched && card !== choiceOne && card !== choiceTwo && (
                  <div className="w-4 h-4 rounded-full bg-white/20" />
                )}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryMatch;