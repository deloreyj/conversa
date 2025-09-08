"use client";

import { useState, useEffect } from "react";
import { FlashcardDeck } from "./FlashcardDeck";
import { FlashcardData } from "@/hooks/useFlashcardDeck";

interface FlashcardDeckWrapperProps {
  cards: FlashcardData[];
  className?: string;
}

export function FlashcardDeckWrapper({ cards, className }: FlashcardDeckWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse space-y-4">
          <div className="w-full max-w-sm mx-auto h-64 bg-gray-200 rounded-2xl"></div>
          <div className="flex justify-center gap-4">
            <div className="w-24 h-10 bg-gray-200 rounded-full"></div>
            <div className="w-24 h-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return <FlashcardDeck cards={cards} className={className} />;
}