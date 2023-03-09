/*
  Warnings:

  - Made the column `updateTypeName` on table `updateTypes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `decisionsTotal` on table `updates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `timestamp` on table `updates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `caseType` on table `decisions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `count` on table `decisions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `decisions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateId` on table `decisions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `decisionMarker` on table `decisions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `institution` on table `decisions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `count` on table `statuses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `statuses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateId` on table `statuses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `institution` on table `statuses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `statuses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `code` on table `country` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `country` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `caseType` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `decisionMarker` required. This step will fail if there are existing NULL values in that column.
  - Made the column `caseType` on table `applications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `count` on table `applications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `applications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateId` on table `applications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `institution` on table `applications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `statuslist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `institution` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_updateTypes" (
    "updateTypeId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "updateTypeName" TEXT NOT NULL
);
INSERT INTO "new_updateTypes" ("updateTypeId", "updateTypeName") SELECT "updateTypeId", "updateTypeName" FROM "updateTypes";
DROP TABLE "updateTypes";
ALTER TABLE "new_updateTypes" RENAME TO "updateTypes";
CREATE TABLE "new_updates" (
    "dateId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL,
    "decisionsTotal" INTEGER NOT NULL,
    "dataUpdated" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "updates_dataUpdated_fkey" FOREIGN KEY ("dataUpdated") REFERENCES "updateTypes" ("updateTypeId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_updates" ("dataUpdated", "dateId", "decisionsTotal", "timestamp") SELECT coalesce("dataUpdated", 0) AS "dataUpdated", "dateId", "decisionsTotal", "timestamp" FROM "updates";
DROP TABLE "updates";
ALTER TABLE "new_updates" RENAME TO "updates";
CREATE TABLE "new_decisions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER NOT NULL,
    "institution" INTEGER NOT NULL,
    "country" INTEGER NOT NULL,
    "caseType" INTEGER NOT NULL,
    "decisionMarker" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    CONSTRAINT "decisions_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "updates" ("dateId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "decisions_institution_fkey" FOREIGN KEY ("institution") REFERENCES "institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "decisions_country_fkey" FOREIGN KEY ("country") REFERENCES "country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "decisions_caseType_fkey" FOREIGN KEY ("caseType") REFERENCES "caseType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "decisions_decisionMarker_fkey" FOREIGN KEY ("decisionMarker") REFERENCES "decisionMarker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_decisions" ("caseType", "count", "country", "dateId", "decisionMarker", "id", "institution") SELECT "caseType", "count", "country", "dateId", "decisionMarker", "id", "institution" FROM "decisions";
DROP TABLE "decisions";
ALTER TABLE "new_decisions" RENAME TO "decisions";
CREATE TABLE "new_statuses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER NOT NULL,
    "institution" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "country" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    CONSTRAINT "statuses_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "updates" ("dateId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "statuses_institution_fkey" FOREIGN KEY ("institution") REFERENCES "institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "statuses_status_fkey" FOREIGN KEY ("status") REFERENCES "statuslist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "statuses_country_fkey" FOREIGN KEY ("country") REFERENCES "country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_statuses" ("count", "country", "dateId", "id", "institution", "status") SELECT "count", "country", "dateId", "id", "institution", "status" FROM "statuses";
DROP TABLE "statuses";
ALTER TABLE "new_statuses" RENAME TO "statuses";
CREATE TABLE "new_country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL
);
INSERT INTO "new_country" ("code", "id", "name") SELECT "code", "id", "name" FROM "country";
DROP TABLE "country";
ALTER TABLE "new_country" RENAME TO "country";
CREATE TABLE "new_caseType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL
);
INSERT INTO "new_caseType" ("id", "type") SELECT "id", "type" FROM "caseType";
DROP TABLE "caseType";
ALTER TABLE "new_caseType" RENAME TO "caseType";
CREATE TABLE "new_decisionMarker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL
);
INSERT INTO "new_decisionMarker" ("description", "id") SELECT "description", "id" FROM "decisionMarker";
DROP TABLE "decisionMarker";
ALTER TABLE "new_decisionMarker" RENAME TO "decisionMarker";
CREATE TABLE "new_applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER NOT NULL,
    "institution" INTEGER NOT NULL,
    "country" INTEGER NOT NULL,
    "caseType" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    CONSTRAINT "applications_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "updates" ("dateId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "applications_institution_fkey" FOREIGN KEY ("institution") REFERENCES "institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "applications_country_fkey" FOREIGN KEY ("country") REFERENCES "country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "applications_caseType_fkey" FOREIGN KEY ("caseType") REFERENCES "caseType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_applications" ("caseType", "count", "country", "dateId", "id", "institution") SELECT "caseType", "count", "country", "dateId", "id", "institution" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
CREATE TABLE "new_statuslist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL
);
INSERT INTO "new_statuslist" ("id", "status") SELECT "id", "status" FROM "statuslist";
DROP TABLE "statuslist";
ALTER TABLE "new_statuslist" RENAME TO "statuslist";
CREATE TABLE "new_institution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_institution" ("id", "name") SELECT "id", "name" FROM "institution";
DROP TABLE "institution";
ALTER TABLE "new_institution" RENAME TO "institution";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
