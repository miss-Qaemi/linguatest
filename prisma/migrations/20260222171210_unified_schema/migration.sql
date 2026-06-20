/*
  Warnings:

  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `name` on the `courses` table. All the data in the column will be lost.
  - Added the required column `title` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `enrollments` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Exam";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "cardLast4" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exams" (
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
    "courseId" TEXT,
    "teacherId" TEXT,
    CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exams_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new__ExamAssignedStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ExamAssignedStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "exams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ExamAssignedStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__ExamAssignedStudents" ("A", "B") SELECT "A", "B" FROM "_ExamAssignedStudents";
DROP TABLE "_ExamAssignedStudents";
ALTER TABLE "new__ExamAssignedStudents" RENAME TO "_ExamAssignedStudents";
CREATE UNIQUE INDEX "_ExamAssignedStudents_AB_unique" ON "_ExamAssignedStudents"("A", "B");
CREATE INDEX "_ExamAssignedStudents_B_index" ON "_ExamAssignedStudents"("B");
CREATE TABLE "new_courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "price" REAL NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "autoEnroll" BOOLEAN NOT NULL DEFAULT true,
    "promoVideoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "materials" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "courses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_courses" ("createdAt", "description", "id", "teacherId") SELECT "createdAt", "description", "id", "teacherId" FROM "courses";
DROP TABLE "courses";
ALTER TABLE "new_courses" RENAME TO "courses";
CREATE TABLE "new_enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_enrollments" ("courseId", "createdAt", "id", "studentId") SELECT "courseId", "createdAt", "id", "studentId" FROM "enrollments";
DROP TABLE "enrollments";
ALTER TABLE "new_enrollments" RENAME TO "enrollments";
CREATE UNIQUE INDEX "enrollments_studentId_courseId_key" ON "enrollments"("studentId", "courseId");
CREATE TABLE "new_exam_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "score" REAL,
    "totalCorrect" INTEGER,
    "totalQuestions" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    CONSTRAINT "exam_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exam_sessions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_exam_sessions" ("completedAt", "examId", "id", "score", "startedAt", "status", "studentId", "totalCorrect", "totalQuestions") SELECT "completedAt", "examId", "id", "score", "startedAt", "status", "studentId", "totalCorrect", "totalQuestions" FROM "exam_sessions";
DROP TABLE "exam_sessions";
ALTER TABLE "new_exam_sessions" RENAME TO "exam_sessions";
CREATE TABLE "new_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_notes" ("content", "createdAt", "id", "title", "userId") SELECT "content", "createdAt", "id", "title", "userId" FROM "notes";
DROP TABLE "notes";
ALTER TABLE "new_notes" RENAME TO "notes";
CREATE TABLE "new_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "options" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'general',
    "order" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "explanation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_questions" ("correctAnswer", "createdAt", "difficulty", "examId", "explanation", "id", "options", "order", "questionText", "section", "type") SELECT "correctAnswer", "createdAt", "difficulty", "examId", "explanation", "id", "options", "order", "questionText", "section", "type" FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
