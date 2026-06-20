-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bio" TEXT,
    "videoUrl" TEXT,
    CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exam_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "examId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "examId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");
