-- CreateEnums
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'REMOVED');
CREATE TYPE "InteractionType" AS ENUM ('CONTACT');
CREATE TYPE "ContactChannel" AS ENUM ('WHATSAPP', 'PHONE');
CREATE TYPE "ReportReason" AS ENUM ('ABUSIVE_CONTENT', 'SPAM', 'FALSE_INFORMATION', 'OTHER');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- CreateTable: reviews
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "worker_profile_id" TEXT NOT NULL,
    "tourist_user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(1000),
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "deleted_at" TIMESTAMP(3),
    "moderation_reason" VARCHAR(500),
    "moderated_by_user_id" TEXT,
    "moderated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);

-- CreateTable: interactions
CREATE TABLE "interactions" (
    "id" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL DEFAULT 'CONTACT',
    "channel" "ContactChannel" NOT NULL,
    "source" VARCHAR(50),
    "worker_profile_id" TEXT NOT NULL,
    "tourist_user_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: reports
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" VARCHAR(500),
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable: outbox_events
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlation_id" TEXT NOT NULL,
    "producer" TEXT NOT NULL DEFAULT 'service-reviews',
    "actor" JSONB,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: reviews unique
CREATE UNIQUE INDEX "reviews_worker_profile_id_tourist_user_id_key" ON "reviews"("worker_profile_id", "tourist_user_id");

-- CreateIndex: reviews listing
CREATE INDEX "reviews_worker_profile_id_status_created_at_idx" ON "reviews"("worker_profile_id", "status", "created_at");

-- CreateIndex: interactions lookup
CREATE INDEX "interactions_worker_profile_id_type_created_at_idx" ON "interactions"("worker_profile_id", "type", "created_at");

-- CreateIndex: reports unique
CREATE UNIQUE INDEX "reports_review_id_user_id_key" ON "reports"("review_id", "user_id");

-- CreateIndex: reports status
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- CreateIndex: outbox polling
CREATE INDEX "outbox_events_published_at_next_attempt_at_idx" ON "outbox_events"("published_at", "next_attempt_at");
