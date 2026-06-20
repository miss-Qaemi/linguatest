/*
  Warnings:

  - You are about to drop the `exams` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "exams";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'MEDIUM',
    "audioUrl" TEXT,
    "passageText" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ExamAssignedStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ExamAssignedStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ExamAssignedStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exam_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "score" REAL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    CONSTRAINT "exam_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exam_sessions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_exam_sessions" ("completedAt", "examId", "id", "score", "startedAt", "status", "studentId") SELECT "completedAt", "examId", "id", "score", "startedAt", "status", "studentId" FROM "exam_sessions";
DROP TABLE "exam_sessions";
ALTER TABLE "new_exam_sessions" RENAME TO "exam_sessions";
CREATE TABLE "new_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "explanation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_questions" ("correctAnswer", "createdAt", "difficulty", "examId", "explanation", "id", "options", "questionText", "type") SELECT "correctAnswer", "createdAt", "difficulty", "examId", "explanation", "id", "options", "questionText", "type" FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ExamAssignedStudents_AB_unique" ON "_ExamAssignedStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_ExamAssignedStudents_B_index" ON "_ExamAssignedStudents"("B");
