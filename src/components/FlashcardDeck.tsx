"use client";

import { useState, useEffect, useCallback } from "react";
import { CardStack } from "./CardStack";
import { useFlashcardDeck, FlashcardData } from "@/hooks/useFlashcardDeck";
import { cn } from "@/lib/utils";

interface FlashcardDeckProps {
  cards: FlashcardData[];
  className?: string;
}

export function FlashcardDeck({ cards, className }: FlashcardDeckProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    deck,
    masteredCards,
    progress,
    handleCorrect,
    handleIncorrect,
    resetDeck,
    isComplete,
  } = useFlashcardDeck({ cards });

  const handleCardSwipeLeft = useCallback((cardId: string) => {
    // Find the card and call handleIncorrect
    const card = deck.find(c => c.id === cardId);
    if (card) {
      handleIncorrect();
    }
  }, [deck, handleIncorrect]);

  const handleCardSwipeRight = useCallback((cardId: string) => {
    // Find the card and call handleCorrect  
    const card = deck.find(c => c.id === cardId);
    if (card) {
      handleCorrect();
    }
  }, [deck, handleCorrect]);

  // Don't render interactive content during SSR
  if (!isMounted) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded-full mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-green-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <CardStack
        cards={deck}
        onSwipeLeft={handleCardSwipeLeft}
        onSwipeRight={handleCardSwipeRight}
        className="mb-8"
      />

      {/* Reset Button */}
      {isComplete ? (
        <div className="text-center">
          <button
            onClick={resetDeck}
            className="px-8 py-4 bg-green-600 text-white rounded-full font-medium text-lg shadow-lg hover:bg-green-700 transition-colors"
          >
            Practice Again
          </button>
        </div>
      ) : (
        masteredCards > 0 && (
          <div className="text-center">
            <button
              onClick={resetDeck}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Reset deck to practice mastered cards
            </button>
          </div>
        )
      )}
    </div>
  );
}