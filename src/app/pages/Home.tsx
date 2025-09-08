"use client";

import { RequestInfo } from "rwsdk/worker";
import { FlashcardData } from "@/hooks/useFlashcardDeck";
import { FlashcardDeckWrapper } from "@/components/FlashcardDeckWrapper";

// Sample flashcard data - this would typically come from your database
const sampleCards: FlashcardData[] = [
  {
    id: "1",
    english: "Good morning",
    portuguese: "Bom dia",
    phonetic: "bohm DEE-ah"
  },
  {
    id: "2",
    english: "Thank you",
    portuguese: "Obrigado",
    phonetic: "oh-bree-GAH-doo"
  },
  {
    id: "3",
    english: "Excuse me",
    portuguese: "Com licença",
    phonetic: "kohm lee-SEN-sah"
  },
  {
    id: "4",
    english: "Where is the bathroom?",
    portuguese: "Onde fica a casa de banho?",
    phonetic: "OHN-deh FEE-kah ah KAH-zah deh BAHN-yoo"
  },
  {
    id: "5",
    english: "How much does it cost?",
    portuguese: "Quanto custa?",
    phonetic: "KWAN-too KOOSH-tah"
  }
];

export function Home({ ctx }: RequestInfo) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Conversa
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Learn Portuguese (Portugal) with flashcards
        </p>
        
        {ctx.user?.username && (
          <p className="text-center text-sm text-gray-500 mb-6">
            Welcome back, {ctx.user.username}!
          </p>
        )}
        
        <FlashcardDeckWrapper cards={sampleCards} />
        
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-gray-500">
            <span className="text-red-600">←</span> Practice again • 👆 Tap to flip •  <span className="text-green-600">→</span> Mastered
          </p>
        </div>
      </div>
    </div>
  );
}
