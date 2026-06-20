-- CreateTable
CREATE TABLE "saved_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "examTitle" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "totalCorrect" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL,
    "answers" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_results_userId_examId_key" ON "saved_results"("userId", "examId");
