"use client";

import { FlashcardPackMetadata } from "@/app/pages/flashcard-functions";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

interface PackModalProps {
  packs: FlashcardPackMetadata[];
  currentPackId: string;
  onPackSelect: (packId: string) => void | Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function PackModal({ 
  packs, 
  currentPackId, 
  onPackSelect, 
  isOpen, 
  onClose 
}: PackModalProps) {
  const getDifficultyColor = (difficulty: FlashcardPackMetadata['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-[var(--color-portugal-green)] bg-green-50';
      case 'intermediate': return 'text-[var(--color-tram-yellow-dark)] bg-yellow-50';
      case 'advanced': return 'text-[var(--color-portugal-red)] bg-red-50';
    }
  };

  const handlePackSelect = (packId: string) => {
    onPackSelect(packId);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-foreground">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>Choose Your Pack</DrawerTitle>
            <DrawerDescription>
              Select a flashcard pack to start practicing Portuguese
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0 max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              {packs.map((pack) => {
                const isSelected = pack.id === currentPackId;
                
                return (
                  <button
                    key={pack.id}
                    onClick={() => handlePackSelect(pack.id)}
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all duration-200",
                      "border-2 hover:scale-[1.02] active:scale-[0.98]",
                      isSelected
                        ? "border-[var(--color-portugal-green)] bg-green-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 relative">
                        <span className="text-3xl">{pack.emoji}</span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-portugal-green)] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {pack.title}
                          </h3>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium capitalize",
                            getDifficultyColor(pack.difficulty)
                          )}>
                            {pack.difficulty}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {pack.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>~{pack.estimatedMinutes} min</span>
                          <span>•</span>
                          <span className="capitalize">{pack.category}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <button className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}