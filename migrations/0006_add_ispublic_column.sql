-- Add isPublic column to FlashcardPack table
ALTER TABLE FlashcardPack ADD COLUMN isPublic INTEGER NOT NULL DEFAULT 1;

-- Create index on isPublic
CREATE INDEX FlashcardPack_isPublic_idx ON FlashcardPack(isPublic);

-- Update existing packs: set isPublic based on userId
-- If userId is "all", it's public (isPublic = 1)
-- Otherwise it's private (isPublic = 0)
UPDATE FlashcardPack SET isPublic = CASE WHEN userId = 'all' THEN 1 ELSE 0 END;
