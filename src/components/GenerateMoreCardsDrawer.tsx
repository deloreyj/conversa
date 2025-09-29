"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { X, Wand2 } from "lucide-react";

interface GenerateMoreCardsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateMoreCards: (prompt: string) => void;
  packTitle: string;
  packDescription: string;
}

export function GenerateMoreCardsDrawer({
  isOpen,
  onClose,
  onGenerateMoreCards,
  packTitle,
  packDescription
}: GenerateMoreCardsDrawerProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      await onGenerateMoreCards(prompt);
      setPrompt("");
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setPrompt("");
      onClose();
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && handleClose()} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] mt-24 fixed bottom-0 left-0 right-0 z-50">
          <div className="flex-1 rounded-t-[20px] p-6">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />

            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add More Cards</h2>
                <button
                  onClick={handleClose}
                  disabled={isGenerating}
                  className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What additional phrases would you like to add?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Common restaurant phrases for ordering food' or 'Emergency medical situations' or 'Numbers and counting'"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                    rows={4}
                    disabled={isGenerating}
                    required
                  />
                </div>


                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 px-6 bg-[var(--color-azulejos)] text-white rounded-lg font-medium text-base shadow-lg hover:bg-[var(--color-azulejos-dark)] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "Generating..." : "Generate cards"}
                </button>
              </form>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}