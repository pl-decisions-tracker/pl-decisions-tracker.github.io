-- CreateTable
CREATE TABLE "applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER,
    "institution" INTEGER,
    "country" INTEGER,
    "caseType" INTEGER,
    "count" INTEGER
);

-- CreateTable
CREATE TABLE "caseType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT
);

-- CreateTable
CREATE TABLE "country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "code" TEXT
);

-- CreateTable
CREATE TABLE "decisionMarker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER,
    "institution" INTEGER,
    "country" INTEGER,
    "caseType" INTEGER,
    "decisionMarker" INTEGER,
    "count" INTEGER
);

-- CreateTable
CREATE TABLE "institution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "statuses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateId" INTEGER,
    "institution" INTEGER,
    "status" INTEGER,
    "country" INTEGER,
    "count" INTEGER
);

-- CreateTable
CREATE TABLE "statuslist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT
);

-- CreateTable
CREATE TABLE "updateTypes" (
    "updateTypeId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "updateTypeName" TEXT
);

-- CreateTable
CREATE TABLE "updates" (
    "dateId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER,
    "month" INTEGER,
    "day" INTEGER,
    "hour" INTEGER,
    "minute" INTEGER,
    "decisionsTotal" INTEGER,
    "dataUpdated" INTEGER DEFAULT 0
);

