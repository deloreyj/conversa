"use client";

import { DraggableFlashcard } from "./DraggableFlashcard";
import { FlashcardData } from "@/hooks/useFlashcardDeck";
import { cn } from "@/lib/utils";

interface CardStackProps {
  cards: FlashcardData[];
  onSwipeLeft: (cardId: string) => void;
  onSwipeRight: (cardId: string) => void;
  className?: string;
}

export function CardStack({ cards, onSwipeLeft, onSwipeRight, className }: CardStackProps) {
  // Show max 3 cards in the stack for performance
  const visibleCards = cards.slice(0, 3);

  if (cards.length === 0) {
    return (
      <div className={cn("relative w-full h-64 flex items-center justify-center", className)}>
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">All Done!</h3>
          <p className="text-green-700">You've completed all the cards!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-64", className)}>
      {visibleCards.map((card, index) => {
        const isTopCard = index === 0;
        const zIndex = visibleCards.length - index;
        
        // Calculate offset and scale for stacked effect
        const offset = index * 4;
        const scale = 1 - index * 0.05;
        const opacity = 1 - index * 0.2;
        
        return (
          <DraggableFlashcard
            key={card.id}
            card={card}
            onSwipeLeft={() => onSwipeLeft(card.id)}
            onSwipeRight={() => onSwipeRight(card.id)}
            disabled={!isTopCard}
            style={{
              zIndex,
              transform: `translateY(${offset}px) scale(${scale})`,
              opacity: opacity,
            }}
            className="w-full h-full"
          />
        );
      })}
    </div>
  );
}