/*
  Warnings:

  - You are about to drop the `CourseContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teachers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `teacherId` on the `enrollments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CourseContent_courseId_idx";

-- DropIndex
DROP INDEX "teachers_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CourseContent";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "teachers";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "course_contents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "course_contents_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "courses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_courses" ("autoEnroll", "createdAt", "description", "id", "isPublished", "language", "level", "materials", "price", "promoVideoUrl", "teacherId", "thumbnailUrl", "title", "updatedAt") SELECT "autoEnroll", "createdAt", "description", "id", "isPublished", "language", "level", "materials", "price", "promoVideoUrl", "teacherId", "thumbnailUrl", "title", "updatedAt" FROM "courses";
DROP TABLE "courses";
ALTER TABLE "new_courses" RENAME TO "courses";
CREATE TABLE "new_enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_enrollments" ("courseId", "createdAt", "id", "isPaid", "studentId") SELECT "courseId", "createdAt", "id", "isPaid", "studentId" FROM "enrollments";
DROP TABLE "enrollments";
ALTER TABLE "new_enrollments" RENAME TO "enrollments";
CREATE UNIQUE INDEX "enrollments_studentId_courseId_key" ON "enrollments"("studentId", "courseId");
CREATE TABLE "new_exams" (
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
    CONSTRAINT "exams_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_exams" ("audioUrl", "courseId", "createdAt", "description", "duration", "endDate", "id", "isPublic", "level", "passageText", "startDate", "teacherId", "title", "updatedAt") SELECT "audioUrl", "courseId", "createdAt", "description", "duration", "endDate", "id", "isPublic", "level", "passageText", "startDate", "teacherId", "title", "updatedAt" FROM "exams";
DROP TABLE "exams";
ALTER TABLE "new_exams" RENAME TO "exams";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "course_contents_courseId_idx" ON "course_contents"("courseId");
