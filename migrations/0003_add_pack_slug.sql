-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FlashcardPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "cards" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FlashcardPack" ("slug", "cards", "category", "createdAt", "description", "difficulty", "emoji", "estimatedMinutes", "id", "title", "updatedAt", "userId")
SELECT
    lower(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(
        trim(title),
        ' ', '-'),
        'ã', 'a'),
        'á', 'a'),
        'à', 'a'),
        'â', 'a'),
        'õ', 'o'),
        'ó', 'o'),
        'ô', 'o'),
        'ç', 'c'),
        'é', 'e'),
        'ê', 'e'
    )),
    "cards", "category", "createdAt", "description", "difficulty", "emoji", "estimatedMinutes", "id", "title", "updatedAt", "userId"
FROM "FlashcardPack";
DROP TABLE "FlashcardPack";
ALTER TABLE "new_FlashcardPack" RENAME TO "FlashcardPack";
CREATE UNIQUE INDEX "FlashcardPack_slug_key" ON "FlashcardPack"("slug");
CREATE INDEX "FlashcardPack_userId_idx" ON "FlashcardPack"("userId");
CREATE INDEX "FlashcardPack_category_idx" ON "FlashcardPack"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
