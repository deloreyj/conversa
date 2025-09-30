"use client";

import { useState, useEffect } from "react";
import { FlashcardDeck } from "./FlashcardDeck";
import { PackModal } from "./PackModal";
import { GeneratePackDrawer } from "./GeneratePackDrawer";
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
  const [isGenerateDrawerOpen, setIsGenerateDrawerOpen] = useState(false);
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

  const handlePackGenerated = async (packId: string) => {
    // When a new pack is generated, we could automatically switch to it
    // For now, just close the drawer - user can manually select it from Change Pack
    console.log("New pack generated with ID:", packId);
    setIsGenerateDrawerOpen(false);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Current pack indicator */}
      {currentPack && (
        <div className="px-2 pt-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-tram-yellow)] rounded-full shadow-sm justify-between">
            <div className="flex items-center gap-2">
            <span className="text-lg">{currentPack.emoji}</span>
            <span className="font-medium text-gray-900">{currentPack.title}</span>
            {isLoading && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            )}
            </div>
            <div>
              <a
                href={`/manage/${currentPackId}`}
              >
                ⚙️
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard area */}
      <div className="px-4 py-4">
        <FlashcardDeck key={currentPackId} cards={cards} />

        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-gray-500">
            <span className="text-red-600">←</span> Practice again • 👆 Tap to flip • <span className="text-green-600">→</span> Mastered
          </p>
        </div>
      </div>

      {/* Bottom CTA - Action Buttons */}
      <div className="p-4 pb-safe">
        <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={() => setIsGenerateDrawerOpen(true)}
              className="flex-1 py-3 px-6 bg-[var(--color-azulejos)] text-white rounded-2xl font-medium text-base shadow-lg hover:bg-[var(--color-azulejos-dark)] transition-colors active:scale-95"
            >
              Generate pack
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 py-3 px-6 bg-[var(--color-limestone)] text-gray-900 border border-gray-300 rounded-2xl font-medium text-base shadow-lg hover:bg-gray-200 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Change pack
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

      {/* Generate Pack Drawer */}
      <GeneratePackDrawer
        isOpen={isGenerateDrawerOpen}
        onClose={() => setIsGenerateDrawerOpen(false)}
        onPackGenerated={handlePackGenerated}
      />
    </div>
  );
}