"use client";

import { useState, useEffect } from "react";
import { SwipeableFlashcard } from "./SwipeableFlashcard";
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
    currentCard,
    totalCards,
    masteredCards,
    progress,
    handleCorrect,
    handleIncorrect,
    resetDeck,
    isComplete,
  } = useFlashcardDeck({ cards });

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

  if (isComplete) {
    return (
      <div className={cn("text-center space-y-6", className)}>
        <div className="p-8 bg-green-50 rounded-2xl border-2 border-green-200">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Congratulations!
          </h2>
          <p className="text-green-700">
            You've mastered all {totalCards} flashcards in this deck!
          </p>
        </div>
        
        <button
          onClick={resetDeck}
          className="px-8 py-4 bg-green-600 text-white rounded-full font-medium text-lg shadow-lg hover:bg-green-700 transition-colors"
        >
          Practice Again
        </button>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-gray-500">No flashcards available</p>
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

      {/* Current Flashcard */}
      <SwipeableFlashcard
        card={currentCard}
        onSwipeLeft={handleIncorrect}
        onSwipeRight={handleCorrect}
        className="relative"
      />

      {/* Reset Button */}
      {masteredCards > 0 && (
        <div className="text-center">
          <button
            onClick={resetDeck}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Reset deck to practice mastered cards
          </button>
        </div>
      )}
    </div>
  );
}