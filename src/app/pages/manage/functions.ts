"use server";

import { db } from "@/db";
import { requestInfo } from "rwsdk/worker";
import { sessions } from "@/session/store";
import { FlashcardData } from "@/hooks/useFlashcardDeck";
import { FlashcardPackMetadata, FlashcardPackWithCards } from "@/app/pages/flashcard-functions";
import { env } from "cloudflare:workers";

export async function getFlashcardPackWithCards(id: string): Promise<FlashcardPackWithCards | null> {
  const pack = await db.flashcardPack.findFirst({
    where: {
      id,
      userId: "all" // For now, only work with global packs
    }
  });

  if (!pack) {
    return null;
  }

  let cards: FlashcardData[] = [];
  try {
    cards = JSON.parse(pack.cards) as FlashcardData[];
  } catch (error) {
    console.error("Failed to parse flashcard pack cards:", error);
    cards = [];
  }

  return {
    ...pack,
    category: pack.category as "basics" | "situations" | "grammar",
    difficulty: pack.difficulty as "beginner" | "intermediate" | "advanced",
    cards
  };
}

export async function updateFlashcardPack(packId: string, updates: {
  title?: string;
  description?: string;
  emoji?: string;
  category?: "basics" | "situations" | "grammar";
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedMinutes?: number;
  cards?: FlashcardData[];
}): Promise<boolean> {
  // Check if pack exists
  const existingPack = await db.flashcardPack.findFirst({
    where: { id: packId }
  });

  if (!existingPack) {
    throw new Error("Pack not found");
  }

  const updateData: any = { ...updates };

  // Convert cards array to JSON string if provided
  if (updates.cards) {
    updateData.cards = JSON.stringify(updates.cards);
  }

  try {
    await db.flashcardPack.update({
      where: { id: packId },
      data: updateData
    });
    return true;
  } catch (error) {
    console.error("Failed to update flashcard pack:", error);
    return false;
  }
}

export async function deleteFlashcard(packId: string, cardId: string): Promise<boolean> {
  const pack = await getFlashcardPackWithCards(packId);
  if (!pack) {
    throw new Error("Pack not found");
  }

  // Filter out the card to delete
  const updatedCards = pack.cards.filter(card => card.id !== cardId);

  return await updateFlashcardPack(packId, { cards: updatedCards });
}

export async function updateFlashcard(packId: string, cardId: string, updates: {
  english?: string;
  portuguese?: string;
  phonetic?: string;
}): Promise<boolean> {
  const pack = await getFlashcardPackWithCards(packId);
  if (!pack) {
    throw new Error("Pack not found");
  }

  // Update the specific card
  const updatedCards = pack.cards.map(card =>
    card.id === cardId ? { ...card, ...updates } : card
  );

  return await updateFlashcardPack(packId, { cards: updatedCards });
}

export async function generateMoreCards(packId: string, count: number = 5, customPrompt?: string): Promise<boolean> {
  const pack = await getFlashcardPackWithCards(packId);
  if (!pack) {
    throw new Error("Pack not found");
  }

  try {
    // Create a workflow instance to generate more cards
    const workflow = await env.FLASHCARD_PACK_GENERATOR.create({
      id: `more-cards-${packId}-${Date.now()}`,
      params: {
        packId,
        additionalCards: count,
        existingCards: pack.cards,
        customPrompt, // Pass the custom prompt to the workflow
        packDetails: {
          title: pack.title,
          description: pack.description,
          category: pack.category,
          difficulty: pack.difficulty
        }
      }
    });

    return true;
  } catch (error) {
    console.error("Failed to start card generation workflow:", error);
    return false;
  }
}

export async function deleteFlashcardPack(packId: string): Promise<boolean> {
  try {
    await db.flashcardPack.delete({
      where: { id: packId }
    });
    return true;
  } catch (error) {
    console.error("Failed to delete flashcard pack:", error);
    return false;
  }
}