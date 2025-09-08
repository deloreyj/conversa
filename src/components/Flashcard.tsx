"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  english: string;
  portuguese: string;
  phonetic: string;
  className?: string;
}

export function Flashcard({ english, portuguese, phonetic, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={cn("perspective-1000 w-full max-w-sm mx-auto", className)}>
      <div
        className={cn(
          "relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
        onClick={handleFlip}
      >
        {/* English Side (Front) */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
          )}
        >
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-800 mb-4">{english}</p>
            <p className="text-sm text-gray-500 uppercase tracking-wide">🇺🇸</p>
          </div>
        </Card>

        {/* Portuguese Side (Back) */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
          )}
        >
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-800 mb-2">{portuguese}</p>
            <p className="text-lg text-gray-600 mb-4 italic">/{phonetic}/</p>
            <p className="text-sm text-gray-500 uppercase tracking-wide">🇵🇹</p>
          </div>
        </Card>
      </div>
    </div>
  );
}