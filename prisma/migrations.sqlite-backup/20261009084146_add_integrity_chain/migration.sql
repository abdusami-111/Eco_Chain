/*
  Warnings:

  - Added the required column `integrityHash` to the `TokenTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TokenTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "recyclingEventId" TEXT,
    "redemptionId" TEXT,
    "prevHash" TEXT,
    "integrityHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TokenTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TokenTransaction_recyclingEventId_fkey" FOREIGN KEY ("recyclingEventId") REFERENCES "RecyclingEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TokenTransaction_redemptionId_fkey" FOREIGN KEY ("redemptionId") REFERENCES "Redemption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TokenTransaction" ("amount", "balanceAfter", "createdAt", "description", "direction", "id", "reason", "recyclingEventId", "redemptionId", "userId") SELECT "amount", "balanceAfter", "createdAt", "description", "direction", "id", "reason", "recyclingEventId", "redemptionId", "userId" FROM "TokenTransaction";
DROP TABLE "TokenTransaction";
ALTER TABLE "new_TokenTransaction" RENAME TO "TokenTransaction";
CREATE UNIQUE INDEX "TokenTransaction_recyclingEventId_key" ON "TokenTransaction"("recyclingEventId");
CREATE UNIQUE INDEX "TokenTransaction_redemptionId_key" ON "TokenTransaction"("redemptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
