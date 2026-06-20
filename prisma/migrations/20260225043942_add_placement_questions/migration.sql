-- CreateTable
CREATE TABLE "placement_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionText" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
