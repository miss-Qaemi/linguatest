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
    CONSTRAINT "course_contents_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_course_contents" ("courseId", "createdAt", "id", "isFree", "order", "text", "title", "type", "updatedAt", "url") SELECT "courseId", "createdAt", "id", "isFree", "order", "text", "title", "type", "updatedAt", "url" FROM "course_contents";
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
    CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "enrollments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_enrollments" ("courseId", "createdAt", "id", "isPaid", "studentId", "teacherId") SELECT "courseId", "createdAt", "id", "isPaid", "studentId", "teacherId" FROM "enrollments";
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
    CONSTRAINT "exam_sessions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_exam_sessions" ("completedAt", "examId", "id", "score", "startedAt", "status", "studentId", "totalCorrect", "totalQuestions") SELECT "completedAt", "examId", "id", "score", "startedAt", "status", "studentId", "totalCorrect", "totalQuestions" FROM "exam_sessions";
DROP TABLE "exam_sessions";
ALTER TABLE "new_exam_sessions" RENAME TO "exam_sessions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
