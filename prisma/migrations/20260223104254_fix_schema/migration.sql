/*
  Warnings:

  - You are about to drop the column `isPublic` on the `courses` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CourseContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CourseContent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "price" REAL NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "autoEnroll" BOOLEAN NOT NULL DEFAULT true,
    "promoVideoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "materials" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "courses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_courses" ("autoEnroll", "createdAt", "description", "id", "language", "level", "materials", "price", "promoVideoUrl", "teacherId", "thumbnailUrl", "title", "updatedAt") SELECT "autoEnroll", "createdAt", "description", "id", "language", "level", "materials", "price", "promoVideoUrl", "teacherId", "thumbnailUrl", "title", "updatedAt" FROM "courses";
DROP TABLE "courses";
ALTER TABLE "new_courses" RENAME TO "courses";
CREATE TABLE "new_enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_enrollments" ("courseId", "createdAt", "id", "studentId", "teacherId") SELECT "courseId", "createdAt", "id", "studentId", "teacherId" FROM "enrollments";
DROP TABLE "enrollments";
ALTER TABLE "new_enrollments" RENAME TO "enrollments";
CREATE UNIQUE INDEX "enrollments_studentId_courseId_key" ON "enrollments"("studentId", "courseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CourseContent_courseId_idx" ON "CourseContent"("courseId");
