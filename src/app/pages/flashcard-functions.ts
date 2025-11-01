"use server";

import { db } from "@/db";
import { requestInfo } from "rwsdk/worker";
import { FlashcardData } from "@/hooks/useFlashcardDeck";

export interface FlashcardPackMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  category: "basics" | "situations" | "grammar";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardPackWithCards extends FlashcardPackMetadata {
  cards: FlashcardData[];
}

export async function getFlashcardPacksMetadata(): Promise<FlashcardPackMetadata[]> {
  // Get current user from context
  const { ctx } = requestInfo;
  const currentUserId = ctx.user?.id;

  // Build where clause: show public packs OR user's own packs
  const whereClause = currentUserId
    ? {
        OR: [
          { isPublic: true },
          { userId: currentUserId }
        ]
      }
    : { isPublic: true };

  const packs = await db.flashcardPack.findMany({
    where: whereClause,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      emoji: true,
      category: true,
      difficulty: true,
      estimatedMinutes: true,
      userId: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { createdAt: "desc" } // Most recently created first
    ]
  });

  // Sort by difficulty order (beginner -> intermediate -> advanced), then by most recent
  const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
  
  return packs
    .map(pack => ({
      ...pack,
      category: pack.category as "basics" | "situations" | "grammar",
      difficulty: pack.difficulty as "beginner" | "intermediate" | "advanced"
    }))
    .sort((a, b) => {
      // First sort by difficulty
      const diffA = difficultyOrder[a.difficulty];
      const diffB = difficultyOrder[b.difficulty];
      if (diffA !== diffB) {
        return diffA - diffB;
      }
      // Then by most recent (descending)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
}

export async function getFlashcardPackById(id: string): Promise<FlashcardData[] | null> {
  // Get current user from context
  const { ctx } = requestInfo;
  const currentUserId = ctx.user?.id;

  // Build where clause: show public packs OR user's own packs
  const whereClause = currentUserId
    ? {
        id,
        OR: [
          { isPublic: true },
          { userId: currentUserId }
        ]
      }
    : { id, isPublic: true };

  const pack = await db.flashcardPack.findFirst({
    where: whereClause,
    select: {
      cards: true
    }
  });

  if (!pack) {
    return null;
  }

  try {
    const cards = JSON.parse(pack.cards) as FlashcardData[];
    // Randomize card order using Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  } catch (error) {
    console.error("Failed to parse flashcard pack cards:", error);
    return null;
  }
}

// Client-callable function wrapper for fetching pack cards
export async function fetchPackCards(packId: string): Promise<FlashcardData[] | null> {
  return await getFlashcardPackById(packId);
}