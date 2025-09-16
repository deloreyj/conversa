"use client";

import { useState } from "react";
import { GeneratePackDrawer } from "./GeneratePackDrawer";

interface EmptyPackStateProps {
  onPackGenerated?: (packId: string) => void;
}

export function EmptyPackState({ onPackGenerated }: EmptyPackStateProps) {
  const [isGenerateDrawerOpen, setIsGenerateDrawerOpen] = useState(false);

  const handlePackGenerated = (packId: string) => {
    setIsGenerateDrawerOpen(false);
    onPackGenerated?.(packId);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="max-w-sm mx-auto">
        {/* Empty state illustration */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">📚</span>
        </div>
        
        {/* Empty state messaging */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          No Flashcard Packs Yet
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Get started learning Portuguese by generating your first custom flashcard pack. 
          Our AI will create personalized content based on what you want to learn.
        </p>
        
        {/* Primary CTA */}
        <button 
          onClick={() => setIsGenerateDrawerOpen(true)}
          className="w-full py-4 px-6 bg-green-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:bg-green-700 transition-all duration-200 active:scale-95 mb-4"
        >
          🤖 Generate Your First Pack
        </button>
        
        {/* Secondary information */}
        <div className="space-y-3 text-sm text-gray-500">
          <p>
            🎯 Popular topics: Food & Dining, Medical Phrases, Transportation
          </p>
          <p>
            ⚡ Takes 30-60 seconds to generate
          </p>
        </div>
      </div>

      {/* Generate Pack Drawer */}
      <GeneratePackDrawer
        isOpen={isGenerateDrawerOpen}
        onClose={() => setIsGenerateDrawerOpen(false)}
        onPackGenerated={handlePackGenerated}
      />
    </div>
  );
}