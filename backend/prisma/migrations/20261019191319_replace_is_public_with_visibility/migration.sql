-- Create the visibility enum
CREATE TYPE "FeedbackVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- Add the new column temporarily with a default
ALTER TABLE "Feedback"
ADD COLUMN "visibility" "FeedbackVisibility" NOT NULL DEFAULT 'PRIVATE';

-- Preserve the existing visibility values
UPDATE "Feedback"
SET "visibility" = CASE
    WHEN "isPublic" = true THEN 'PUBLIC'::"FeedbackVisibility"
    ELSE 'PRIVATE'::"FeedbackVisibility"
END;

-- Remove the old column after copying its values
ALTER TABLE "Feedback"
DROP COLUMN "isPublic";