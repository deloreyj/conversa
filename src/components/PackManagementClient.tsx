"use client";

import { useState } from "react";
import { FlashcardPackWithCards } from "@/app/pages/flashcard-functions";
import { FlashcardData } from "@/hooks/useFlashcardDeck";
import { updateFlashcardPack, deleteFlashcard, updateFlashcard, generateMoreCards, deleteFlashcardPack } from "@/app/pages/manage/functions";
import { Trash2, Edit3, Plus, Save, X, Wand2 } from "lucide-react";
import { GenerateMoreCardsDrawer } from "./GenerateMoreCardsDrawer";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";

interface PackManagementClientProps {
  pack: FlashcardPackWithCards;
}

export function PackManagementClient({ pack: initialPack }: PackManagementClientProps) {
  const [pack, setPack] = useState(initialPack);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingPack, setEditingPack] = useState(false);
  const [isGenerateDrawerOpen, setIsGenerateDrawerOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    english: "",
    portuguese: "",
    phonetic: ""
  });
  const [packForm, setPackForm] = useState({
    title: pack.title,
    description: pack.description,
    emoji: pack.emoji,
    category: pack.category,
    difficulty: pack.difficulty,
    estimatedMinutes: pack.estimatedMinutes
  });

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      const success = await deleteFlashcard(pack.id, cardId);
      if (success) {
        setPack(prev => ({
          ...prev,
          cards: prev.cards.filter(card => card.id !== cardId)
        }));
      } else {
        alert("Failed to delete card");
      }
    } catch (error) {
      alert("Error deleting card");
      console.error(error);
    }
  };

  const handleEditCard = (card: FlashcardData) => {
    setEditingCard(card.id);
    setEditForm({
      english: card.english,
      portuguese: card.portuguese,
      phonetic: card.phonetic
    });
  };

  const handleSaveCard = async () => {
    if (!editingCard) return;

    try {
      const success = await updateFlashcard(pack.id, editingCard, editForm);
      if (success) {
        setPack(prev => ({
          ...prev,
          cards: prev.cards.map(card =>
            card.id === editingCard ? { ...card, ...editForm } : card
          )
        }));
        setEditingCard(null);
      } else {
        alert("Failed to save card");
      }
    } catch (error) {
      alert("Error saving card");
      console.error(error);
    }
  };

  const handleSavePack = async () => {
    try {
      const success = await updateFlashcardPack(pack.id, packForm);
      if (success) {
        setPack(prev => ({ ...prev, ...packForm }));
        setEditingPack(false);
      } else {
        alert("Failed to save pack details");
      }
    } catch (error) {
      alert("Error saving pack");
      console.error(error);
    }
  };

  const handleGenerateMoreCards = async (prompt: string) => {
    try {
      // Let the AI decide how many cards to generate, default to 5-10 range
      const success = await generateMoreCards(pack.id, 8, prompt);
      if (success) {
        alert("Card generation started! New cards will appear in a few moments.");
        // Refresh the page after a delay to show new cards
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        alert("Failed to start card generation");
      }
    } catch (error) {
      alert("Error generating cards");
      console.error(error);
    }
  };

  const handleDeletePack = async () => {
    if (!confirm(`Are you sure you want to delete the entire pack "${pack.title}"? This cannot be undone.`)) return;

    try {
      const success = await deleteFlashcardPack(pack.id);
      if (success) {
        alert("Pack deleted successfully");
        window.location.href = "/";
      } else {
        alert("Failed to delete pack");
      }
    } catch (error) {
      alert("Error deleting pack");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Flashcards
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {pack.emoji} {pack.title}
            </h1>
            <p className="text-gray-600 mb-4">{pack.description}</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="capitalize">{pack.category}</span>
              <span className="capitalize">{pack.difficulty}</span>
              <span>{pack.estimatedMinutes} minutes</span>
              <span>{pack.cards.length} cards</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-col gap-3 max-w-md mx-auto">
          <div className="flex gap-3">
            <button
              onClick={() => setEditingPack(true)}
              className="flex-1 px-6 py-3 bg-[var(--color-limestone)] text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-200 shadow-md transition-all font-medium"
            >
              Edit pack
            </button>
            <button
              onClick={handleDeletePack}
              className="flex-1 px-6 py-3 bg-[var(--color-portugal-red-dark)] text-white rounded-xl hover:bg-[var(--color-portugal-red-dark)] shadow-md transition-all font-medium"
            >
              Delete pack
            </button>
          </div>
          <button
            onClick={() => setIsGenerateDrawerOpen(true)}
            className="w-full px-6 py-3 bg-[var(--color-azulejos)] text-white rounded-xl hover:bg-[var(--color-azulejos-dark)] shadow-md transition-all font-medium"
          >
            Generate more cards
          </button>
        </div>

        {/* Cards List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Flashcards ({pack.cards.length})</h2>

          {pack.cards.map((card) => (
            <div key={card.id} className="bg-white rounded-2xl shadow-sm p-6">
              {editingCard === card.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                    <input
                      type="text"
                      value={editForm.english}
                      onChange={(e) => setEditForm(prev => ({ ...prev, english: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portuguese</label>
                    <input
                      type="text"
                      value={editForm.portuguese}
                      onChange={(e) => setEditForm(prev => ({ ...prev, portuguese: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phonetic</label>
                    <input
                      type="text"
                      value={editForm.phonetic}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phonetic: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveCard}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--color-portugal-green)] text-white rounded-full hover:bg-[var(--color-portugal-green-dark)]"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCard(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--color-limestone)] text-gray-700 border border-gray-300 rounded-full hover:bg-gray-200"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="text-gray-900">🇺🇸 {card.english}</div>
                    <div className="text-gray-700">🇵🇹 {card.portuguese}</div>
                    <div className="text-gray-500 text-sm font-mono">🗣️ {card.phonetic}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditCard(card)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                      title="Edit card"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                      title="Delete card"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {pack.cards.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-gray-500 mb-4">No cards in this pack yet.</p>
              <button
                onClick={() => setIsGenerateDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-portugal-green)] text-white rounded-full hover:bg-[var(--color-portugal-green-dark)] mx-auto"
              >
                <Plus size={16} />
                Add cards
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generate More Cards Drawer */}
      <GenerateMoreCardsDrawer
        isOpen={isGenerateDrawerOpen}
        onClose={() => setIsGenerateDrawerOpen(false)}
        onGenerateMoreCards={handleGenerateMoreCards}
        packTitle={pack.title}
        packDescription={pack.description}
      />

      {/* Edit Pack Drawer */}
      <Drawer open={editingPack} onOpenChange={(open) => !open && setEditingPack(false)} repositionInputs={false}>
        <DrawerContent className="bg-foreground">
          <div className="max-w-md w-full mx-auto overflow-auto p-4">
            <div className="font-semibold text-lg mb-2">Edit pack</div>
            <div className="text-sm text-gray-600 mb-6">
              Update pack details and settings
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={packForm.title}
                    onChange={(e) => setPackForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={packForm.emoji}
                    onChange={(e) => setPackForm(prev => ({ ...prev, emoji: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    maxLength={2}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={packForm.description}
                  onChange={(e) => setPackForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={packForm.category}
                    onChange={(e) => setPackForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="basics">Basics</option>
                    <option value="situations">Situations</option>
                    <option value="grammar">Grammar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={packForm.difficulty}
                    onChange={(e) => setPackForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
                  <input
                    type="number"
                    value={packForm.estimatedMinutes}
                    onChange={(e) => setPackForm(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSavePack}
                className="flex-1 py-3 px-4 bg-[var(--color-azulejos)] text-white rounded-lg font-medium hover:bg-[var(--color-azulejos-dark)]"
              >
                Save changes
              </button>
              <button
                onClick={() => setEditingPack(false)}
                className="flex-1 py-3 px-4 bg-[var(--color-limestone)] text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}