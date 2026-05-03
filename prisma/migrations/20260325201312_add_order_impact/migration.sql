/*
  Warnings:

  - You are about to alter the column `amount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - Made the column `country` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "isFirstCountry" BOOLEAN NOT NULL DEFAULT false,
    "impactType" TEXT,
    "impactData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Order" ("amount", "country", "createdAt", "id", "isFirstCountry", "latitude", "longitude", "stripeId") SELECT "amount", "country", "createdAt", "id", "isFirstCountry", "latitude", "longitude", "stripeId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_stripeId_key" ON "Order"("stripeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
