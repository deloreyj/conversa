"use server";

import { db } from "@/db";
import { requestInfo } from "rwsdk/worker";
import { sessions } from "@/session/store";
import { FlashcardData } from "@/hooks/useFlashcardDeck";
import { FlashcardPackMetadata, FlashcardPackWithCards } from "@/app/pages/flashcard-functions";
import { env } from "cloudflare:workers";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/ã/g, 'a')
    .replace(/á/g, 'a')
    .replace(/à/g, 'a')
    .replace(/â/g, 'a')
    .replace(/õ/g, 'o')
    .replace(/ó/g, 'o')
    .replace(/ô/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/é/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/[^a-z0-9-]/g, '');
}

export async function getFlashcardPackWithCards(slug: string): Promise<FlashcardPackWithCards | null> {
  // Get current user from context
  const { ctx } = requestInfo;
  const currentUserId = ctx.user?.id;

  // Build where clause: show public packs OR user's own packs
  const whereClause = currentUserId
    ? {
        slug,
        OR: [
          { isPublic: true },
          { userId: currentUserId }
        ]
      }
    : { slug, isPublic: true };

  const pack = await db.flashcardPack.findFirst({
    where: whereClause
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
  isPublic?: boolean;
}): Promise<boolean> {
  // Check if pack exists
  const existingPack = await db.flashcardPack.findFirst({
    where: { id: packId }
  });

  if (!existingPack) {
    throw new Error("Pack not found");
  }

  // Get current user from context
  const { ctx } = requestInfo;

  const updateData: any = { ...updates };

  // Convert cards array to JSON string if provided
  if (updates.cards) {
    updateData.cards = JSON.stringify(updates.cards);
  }

  // Handle isPublic update - keep userId as the creator
  if (updates.isPublic !== undefined) {
    updateData.isPublic = updates.isPublic;
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
  // Get pack by ID directly (not slug)
  const packRecord = await db.flashcardPack.findFirst({
    where: { id: packId }
  });

  if (!packRecord) {
    throw new Error("Pack not found");
  }

  // Parse cards
  let cards: FlashcardData[] = [];
  try {
    cards = JSON.parse(packRecord.cards) as FlashcardData[];
  } catch (error) {
    console.error("Failed to parse flashcard pack cards:", error);
    cards = [];
  }

  const pack = {
    ...packRecord,
    cards
  };

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