/*
  Warnings:

  - You are about to alter the column `timestamp` on the `updates` table. The data in that column could be lost. The data in that column will be cast from `Int` to `DateTime`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_updates" (
    "dateId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME,
    "decisionsTotal" INTEGER,
    "dataUpdated" INTEGER DEFAULT 0
);
INSERT INTO "new_updates" ("dataUpdated", "dateId", "decisionsTotal", "timestamp") SELECT "dataUpdated", "dateId", "decisionsTotal", "timestamp" FROM "updates";
DROP TABLE "updates";
ALTER TABLE "new_updates" RENAME TO "updates";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
