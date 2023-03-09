/*
  Warnings:

  - You are about to drop the column `day` on the `updates` table. All the data in the column will be lost.
  - You are about to drop the column `hour` on the `updates` table. All the data in the column will be lost.
  - You are about to drop the column `minute` on the `updates` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `updates` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `updates` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_updates" (
    "dateId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" INTEGER,
    "decisionsTotal" INTEGER,
    "dataUpdated" INTEGER DEFAULT 0
);
INSERT INTO "new_updates" ("dataUpdated", "dateId", "decisionsTotal", "timestamp") SELECT "dataUpdated", "dateId", "decisionsTotal", "timestamp" FROM "updates";
DROP TABLE "updates";
ALTER TABLE "new_updates" RENAME TO "updates";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
