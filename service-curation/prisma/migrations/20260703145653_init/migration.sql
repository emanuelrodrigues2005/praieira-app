-- CreateEnum
CREATE TYPE "CurationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'DEAD');

-- CreateTable
CREATE TABLE "curation_requests" (
    "id" TEXT NOT NULL,
    "worker_profile_id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "status" "CurationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewer_user_id" TEXT,
    "reason_code" TEXT,
    "notes" TEXT,
    "source_event_id" TEXT NOT NULL,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curation_history" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_alerts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "worker_profile_id" TEXT NOT NULL,
    "source_event_id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "moderation_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "source_event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlation_id" TEXT NOT NULL,
    "producer" TEXT NOT NULL DEFAULT 'service-curation',
    "actor" JSONB,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_at" TIMESTAMP(3),
    "locked_by" TEXT,
    "next_attempt_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "curation_requests_source_event_id_key" ON "curation_requests"("source_event_id");

-- CreateIndex
CREATE INDEX "curation_requests_status_created_at_idx" ON "curation_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "curation_requests_worker_profile_id_idx" ON "curation_requests"("worker_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_alerts_source_event_id_key" ON "moderation_alerts"("source_event_id");

-- CreateIndex
CREATE INDEX "moderation_alerts_status_severity_idx" ON "moderation_alerts"("status", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_source_event_id_key" ON "notifications"("source_event_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_user_id_read_at_created_at_idx" ON "notifications"("recipient_user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "outbox_events_status_next_attempt_at_idx" ON "outbox_events"("status", "next_attempt_at");

-- AddForeignKey
ALTER TABLE "curation_history" ADD CONSTRAINT "curation_history_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "curation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
