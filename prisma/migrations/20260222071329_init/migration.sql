-- AlterTable
ALTER TABLE "exam_sessions" ADD COLUMN "totalCorrect" INTEGER;
ALTER TABLE "exam_sessions" ADD COLUMN "totalQuestions" INTEGER;

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "exam_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'general',
    "order" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "explanation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_questions" ("correctAnswer", "createdAt", "difficulty", "examId", "explanation", "id", "options", "questionText", "type") SELECT "correctAnswer", "createdAt", "difficulty", "examId", "explanation", "id", "options", "questionText", "type" FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
CREATE TABLE "new_teachers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_teachers" ("bio", "id", "userId") SELECT "bio", "id", "userId" FROM "teachers";
DROP TABLE "teachers";
ALTER TABLE "new_teachers" RENAME TO "teachers";
CREATE UNIQUE INDEX "teachers_userId_key" ON "teachers"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
