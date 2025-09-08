"use client";

import { useSwipeable } from "react-swipeable";
import { animated } from "@react-spring/web";
import { Flashcard } from "./Flashcard";
import { useSwipeAnimation } from "@/hooks/useSwipeAnimation";
import { FlashcardData } from "@/hooks/useFlashcardDeck";
import { cn } from "@/lib/utils";

interface SwipeableFlashcardProps {
  card: FlashcardData;
  onSwipeLeft: () => void;  // Incorrect - keep in rotation
  onSwipeRight: () => void; // Correct - remove from deck
  className?: string;
}

export function SwipeableFlashcard({ 
  card, 
  onSwipeLeft, 
  onSwipeRight, 
  className 
}: SwipeableFlashcardProps) {
  const { 
    springs, 
    isAnimating, 
    animateSwipeLeft, 
    animateSwipeRight,
    handleSwipeStart,
    handleSwipeEnd,
  } = useSwipeAnimation({
    onSwipeLeft,
    onSwipeRight,
  });

  const swipeHandlers = useSwipeable({
    onSwipedLeft: animateSwipeLeft,
    onSwipedRight: animateSwipeRight,
    onSwipeStart: handleSwipeStart,
    onSwiping: () => {}, // Could add real-time visual feedback here
    onSwiped: handleSwipeEnd,
    trackMouse: true, // For desktop testing
    preventScrollOnSwipe: true,
    delta: 80, // Minimum swipe distance
  });

  return (
    <div className={cn("relative", className)}>
      {/* Animated Flashcard */}
      <animated.div
        {...swipeHandlers}
        style={{
          transform: springs.x.to(x => 
            `translateX(${x}px) translateY(${springs.y.get()}px) rotate(${springs.rotation.get()}deg) scale(${springs.scale.get()})`
          ),
          opacity: springs.opacity,
        }}
        className={cn(
          "touch-none select-none cursor-grab active:cursor-grabbing",
          isAnimating && "pointer-events-none"
        )}
      >
        <Flashcard
          english={card.english}
          portuguese={card.portuguese}
          phonetic={card.phonetic}
          className="shadow-2xl"
        />
      </animated.div>
    </div>
  );
}