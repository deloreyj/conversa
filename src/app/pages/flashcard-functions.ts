"use server";

import { db } from "@/db";
import { requestInfo } from "rwsdk/worker";
import { sessions } from "@/session/store";
import { FlashcardData } from "@/hooks/useFlashcardDeck";

export interface FlashcardPackMetadata {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: "basics" | "situations" | "grammar";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardPackWithCards extends FlashcardPackMetadata {
  cards: FlashcardData[];
}

export async function getFlashcardPacksMetadata(): Promise<FlashcardPackMetadata[]> {
  const packs = await db.flashcardPack.findMany({
    where: {
      userId: "all" // For now, only show global packs
    },
    select: {
      id: true,
      title: true,
      description: true,
      emoji: true,
      category: true,
      difficulty: true,
      estimatedMinutes: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { userId: "asc" }, // Show "all" packs first
      { category: "asc" },
      { difficulty: "asc" }
    ]
  });

  return packs.map(pack => ({
    ...pack,
    category: pack.category as "basics" | "situations" | "grammar",
    difficulty: pack.difficulty as "beginner" | "intermediate" | "advanced"
  }));
}

export async function getFlashcardPackById(id: string): Promise<FlashcardData[] | null> {
  const pack = await db.flashcardPack.findFirst({
    where: {
      id,
      userId: "all" // For now, only show global packs
    },
    select: {
      cards: true
    }
  });

  if (!pack) {
    return null;
  }

  try {
    return JSON.parse(pack.cards) as FlashcardData[];
  } catch (error) {
    console.error("Failed to parse flashcard pack cards:", error);
    return null;
  }
}

// Client-callable function wrapper for fetching pack cards
export async function fetchPackCards(packId: string): Promise<FlashcardData[] | null> {
  return await getFlashcardPackById(packId);
}