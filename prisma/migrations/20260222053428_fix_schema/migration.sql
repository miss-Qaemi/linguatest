/*
  Warnings:

  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExamSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Enrollment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Exam";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ExamResult";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ExamSession";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Note";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Question";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Teacher";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "courses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "level" TEXT,
    "duration" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "explanation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "score" REAL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    CONSTRAINT "exam_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exam_sessions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_userId_key" ON "teachers"("userId");
