import { defineScript } from "rwsdk/worker";
import { db, setupDb } from "@/db";
import { flashcardPacks } from "@/data/flashcardPacks";

export default defineScript(async ({ env }) => {
  await setupDb(env);

  // Clear credentials first (child table)
  try {
    await db.credential.deleteMany({});
  } catch (e) {
    console.log("No credential table found, skipping cleanup");
  }
  
  // Clear flashcard packs (no foreign key constraints)
  try {
    await db.flashcardPack.deleteMany({});
  } catch (e) {
    console.log("No flashcard pack table found, will create packs anyway");
  }

  // Then clear users
  try {
    await db.user.deleteMany({});
  } catch (e) {
    console.log("No user table found, skipping cleanup");
  }

  await db.user.create({
    data: {
      id: "1",
      username: "testuser",
    },
  });

  // Migrate existing flashcard packs to D1
  for (const pack of flashcardPacks) {
    console.log(`🃏 Seeding pack: ${pack.title}`);
    
    await db.flashcardPack.create({
      data: {
        id: pack.id,
        title: pack.title,
        description: pack.description,
        emoji: pack.emoji,
        category: pack.category,
        difficulty: pack.difficulty,
        estimatedMinutes: pack.estimatedMinutes,
        cards: JSON.stringify(pack.cards),
        userId: "all", // These are default packs available to all users
      }
    });
  }

  console.log("🌱 Finished seeding");
});
