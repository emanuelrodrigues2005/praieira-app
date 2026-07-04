-- CreateTable: favorites
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "tourist_user_id" TEXT NOT NULL,
    "worker_profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique per tourist + worker
CREATE UNIQUE INDEX "favorites_tourist_user_id_worker_profile_id_key" ON "favorites"("tourist_user_id", "worker_profile_id");

-- CreateIndex: lookup by tourist
CREATE INDEX "favorites_tourist_user_id_idx" ON "favorites"("tourist_user_id");
