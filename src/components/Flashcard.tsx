"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateSpeech } from "./flashcard-functions";

interface FlashcardProps {
  english: string;
  portuguese: string;
  phonetic: string;
  className?: string;
}

export function Flashcard({ english, portuguese, phonetic, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioData, setAudioData] = useState<string | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking audio button
    
    if (audioData && audioRef.current) {
      audioRef.current.play();
      return;
    }

    setIsLoadingAudio(true);
    try {
      const result = await generateSpeech(portuguese, "luna");
      
      if (result.success && result.audio) {
        const audioUrl = `data:audio/mpeg;base64,${result.audio}`;
        setAudioData(audioUrl);
        
        // Wait for state update then play
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
          }
        }, 100);
      } else {
        // Show error to user
        console.error("TTS Error:", result.error);
        alert(result.error || "Failed to generate speech. Text-to-speech may not be available in development mode.");
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      alert("An unexpected error occurred while generating speech.");
    } finally {
      setIsLoadingAudio(false);
    }
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
          <div className="text-center relative">
            <p className="text-2xl font-semibold text-gray-800 mb-2">{portuguese}</p>
            <p className="text-lg text-gray-600 mb-4 italic">/{phonetic}/</p>
            
            <button
              onClick={handlePlayAudio}
              disabled={isLoadingAudio}
              className={cn(
                "mb-3 px-4 py-2 rounded-full bg-white border border-green-300 shadow-sm",
                "hover:shadow-md hover:bg-green-50 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center gap-2 mx-auto"
              )}
            >
              {isLoadingAudio ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span className="text-sm">Play</span>
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-500 uppercase tracking-wide">🇵🇹</p>
          </div>
        </Card>
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}