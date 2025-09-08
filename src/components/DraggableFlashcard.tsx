"use client";

import { animated } from "@react-spring/web";
import { Flashcard } from "./Flashcard";
import { useCardDrag } from "@/hooks/useCardDrag";
import { FlashcardData } from "@/hooks/useFlashcardDeck";
import { cn } from "@/lib/utils";

interface DraggableFlashcardProps {
  card: FlashcardData;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

export function DraggableFlashcard({ 
  card, 
  onSwipeLeft, 
  onSwipeRight, 
  style = {},
  className,
  disabled = false
}: DraggableFlashcardProps) {
  const { bind, style: dragStyle } = useCardDrag({
    onSwipeLeft,
    onSwipeRight,
    disabled,
  });

  return (
    <animated.div
      {...bind()}
      style={{
        ...dragStyle,
        ...style,
        touchAction: 'none', // Prevent scrolling while dragging
      }}
      className={cn(
        "absolute inset-0 cursor-grab active:cursor-grabbing select-none",
        disabled && "pointer-events-none",
        className
      )}
    >
      <Flashcard
        english={card.english}
        portuguese={card.portuguese}
        phonetic={card.phonetic}
        className="shadow-2xl w-full h-full"
      />
      
      {/* Drag hint overlays */}
      {!disabled && (
        <>
          {/* Left side hint */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 text-2xl font-bold opacity-0 pointer-events-none animate-pulse">
            ←
          </div>
          
          {/* Right side hint */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 text-2xl font-bold opacity-0 pointer-events-none animate-pulse">
            →
          </div>
        </>
      )}
    </animated.div>
  );
}