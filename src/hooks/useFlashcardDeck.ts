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
    if (deck.length === 0) return;

    const [topCard, ...remainingCards] = deck;
    
    // Remove top card from deck (user got it right)
    setRemovedCards(prev => [...prev, topCard]);
    setDeck(remainingCards);
    
    // Always reset to first card since we're shifting the array
    setCurrentIndex(0);
  }, [deck]);

  const handleIncorrect = useCallback(() => {
    if (deck.length === 0) return;

    const [topCard, ...remainingCards] = deck;
    
    // Move top card to back of deck (practice again)
    setDeck([...remainingCards, topCard]);
    
    // Always reset to first card since we're shifting the array
    setCurrentIndex(0);
  }, [deck]);

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