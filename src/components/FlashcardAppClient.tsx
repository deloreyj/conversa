"use client";

import { useState, useEffect } from "react";
import { FlashcardDeck } from "./FlashcardDeck";
import { PackModal } from "./PackModal";
import { FlashcardPackMetadata } from "@/app/pages/flashcard-functions";
import { FlashcardData } from "@/hooks/useFlashcardDeck";

interface FlashcardAppClientProps {
  packs: FlashcardPackMetadata[];
  initialCards: FlashcardData[];
  initialPackId: string;
  onPackSelect: (packId: string) => Promise<FlashcardData[] | null>;
}

export function FlashcardAppClient({ 
  packs, 
  initialCards, 
  initialPackId, 
  onPackSelect 
}: FlashcardAppClientProps) {
  const [currentPackId, setCurrentPackId] = useState(initialPackId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cards, setCards] = useState<FlashcardData[]>(initialCards);
  const [isLoading, setIsLoading] = useState(false);

  const currentPack = packs.find(pack => pack.id === currentPackId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePackSelect = async (packId: string) => {
    if (packId === currentPackId) return;
    
    setIsLoading(true);
    try {
      const newCards = await onPackSelect(packId);
      if (newCards) {
        setCurrentPackId(packId);
        setCards(newCards);
      }
    } catch (error) {
      console.error("Failed to load pack:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Current pack indicator */}
      {currentPack && (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm mb-4">
          <span className="text-lg">{currentPack.emoji}</span>
          <span className="font-medium text-gray-700">{currentPack.title}</span>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Flashcard area */}
      <div className="flex-1 px-4 pb-20"> {/* Bottom padding for CTA button */}
        <div className="max-w-md mx-auto">
          <FlashcardDeck key={currentPackId} cards={cards} />
          
          <div className="text-center mt-8 space-y-2">
            <p className="text-sm text-gray-500">
              <span className="text-red-600">←</span> Practice again • 👆 Tap to flip • <span className="text-green-600">→</span> Mastered
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA - Change Pack Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 px-6 bg-green-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:bg-green-700 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              📚 Change Pack
            </button>
        </div>
      </div>

      {/* Pack Selection Modal */}
      <PackModal
        packs={packs}
        currentPackId={currentPackId}
        onPackSelect={handlePackSelect}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}