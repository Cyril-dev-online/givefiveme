/*
  Warnings:

  - You are about to drop the column `city` on the `Order` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "country" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "stripeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isFirstCountry" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Order" ("amount", "country", "createdAt", "id", "latitude", "longitude", "stripeId") SELECT "amount", "country", "createdAt", "id", "latitude", "longitude", "stripeId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_stripeId_key" ON "Order"("stripeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
