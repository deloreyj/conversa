"use client";

import { useState, useCallback } from "react";

export interface FlashcardData {
  id: string;
  english: string;
  portuguese: string;
  phonetic: string;
}

export interface UseFlashcardDeckProps {
  cards: FlashcardData[];
}

export function useFlashcardDeck({ cards: initialCards }: UseFlashcardDeckProps) {
  const [deck, setDeck] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [removedCards, setRemovedCards] = useState<FlashcardData[]>([]);

  const currentCard = deck[currentIndex] || null;
  const hasNextCard = currentIndex < deck.length - 1;
  const totalCards = deck.length;
  const progress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  const handleCorrect = useCallback(() => {
    if (!currentCard) return;

    // Remove card from deck (user got it right)
    const newDeck = deck.filter((_, index) => index !== currentIndex);
    setRemovedCards(prev => [...prev, currentCard]);
    setDeck(newDeck);

    // Adjust current index if needed
    if (currentIndex >= newDeck.length) {
      setCurrentIndex(Math.max(0, newDeck.length - 1));
    }
  }, [currentCard, deck, currentIndex]);

  const handleIncorrect = useCallback(() => {
    if (!currentCard) return;

    // Move to next card but keep this one in rotation
    if (hasNextCard) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Cycle back to beginning
      setCurrentIndex(0);
    }
  }, [currentCard, hasNextCard, currentIndex]);

  const resetDeck = useCallback(() => {
    setDeck([...initialCards, ...removedCards]);
    setRemovedCards([]);
    setCurrentIndex(0);
  }, [initialCards, removedCards]);

  return {
    deck,
    currentCard,
    hasNextCard,
    totalCards,
    remainingCards: deck.length,
    masteredCards: removedCards.length,
    progress,
    handleCorrect,
    handleIncorrect,
    resetDeck,
    isComplete: deck.length === 0,
  };
}