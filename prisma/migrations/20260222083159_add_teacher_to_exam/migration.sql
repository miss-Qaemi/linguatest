-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exam" (
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
    CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exam_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Exam" ("audioUrl", "courseId", "createdAt", "description", "duration", "endDate", "id", "isPublic", "level", "passageText", "startDate", "title", "updatedAt") SELECT "audioUrl", "courseId", "createdAt", "description", "duration", "endDate", "id", "isPublic", "level", "passageText", "startDate", "title", "updatedAt" FROM "Exam";
DROP TABLE "Exam";
ALTER TABLE "new_Exam" RENAME TO "Exam";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
