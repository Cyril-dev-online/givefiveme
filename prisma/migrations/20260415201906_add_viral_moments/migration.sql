-- CreateTable
CREATE TABLE "ViralMoment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "opponent" TEXT,
    "gap" INTEGER,
    "rank" INTEGER,
    "reason" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "notifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ViralMoment_dedupeKey_key" ON "ViralMoment"("dedupeKey");

-- CreateIndex
CREATE INDEX "ViralMoment_createdAt_idx" ON "ViralMoment"("createdAt");

-- CreateIndex
CREATE INDEX "ViralMoment_type_country_idx" ON "ViralMoment"("type", "country");
