-- CreateTable
CREATE TABLE "daily_tips" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tip_saves" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tipId" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "tip_saves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tip_saves_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "daily_tips" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_tips_date_key" ON "daily_tips"("date");

-- CreateIndex
CREATE UNIQUE INDEX "tip_saves_userId_tipId_key" ON "tip_saves"("userId", "tipId");
