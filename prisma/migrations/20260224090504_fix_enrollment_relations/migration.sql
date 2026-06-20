/*
  Warnings:

  - Added the required column `teacherId` to the `enrollments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "bio" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_course_contents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "text" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "course_contents_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_course_contents" ("courseId", "createdAt", "id", "isFree", "order", "title", "type", "updatedAt", "url") SELECT "courseId", "createdAt", "id", "isFree", "order", "title", "type", "updatedAt", "url" FROM "course_contents";
DROP TABLE "course_contents";
ALTER TABLE "new_course_contents" RENAME TO "course_contents";
CREATE INDEX "course_contents_courseId_idx" ON "course_contents"("courseId");
CREATE TABLE "new_enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_enrollments" ("courseId", "createdAt", "id", "isPaid", "studentId") SELECT "courseId", "createdAt", "id", "isPaid", "studentId" FROM "enrollments";
DROP TABLE "enrollments";
ALTER TABLE "new_enrollments" RENAME TO "enrollments";
CREATE UNIQUE INDEX "enrollments_studentId_courseId_key" ON "enrollments"("studentId", "courseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
