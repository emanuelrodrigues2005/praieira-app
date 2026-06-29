-- Create OutboxStatus enum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'DEAD');

-- Add new columns to outbox_events
ALTER TABLE "outbox_events"
ADD COLUMN "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "locked_at" TIMESTAMP(3),
ADD COLUMN "locked_by" TEXT,
ADD COLUMN "failed_at" TIMESTAMP(3);

-- Migrate existing: published events → PUBLISHED status
UPDATE "outbox_events" SET "status" = 'PUBLISHED' WHERE "published_at" IS NOT NULL;

-- Drop old index, create new
DROP INDEX IF EXISTS "outbox_events_published_at_next_attempt_at_idx";
CREATE INDEX "outbox_events_status_next_attempt_at_idx" ON "outbox_events"("status", "next_attempt_at");
