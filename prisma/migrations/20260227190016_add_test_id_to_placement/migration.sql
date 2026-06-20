/*
  Warnings:

  - You are about to drop the column `level` on the `placement_questions` table. All the data in the column will be lost.
  - Added the required column `testId` to the `placement_questions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_placement_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_placement_questions" ("correctAnswer", "createdAt", "id", "optionA", "optionB", "optionC", "optionD", "questionText", "updatedAt") SELECT "correctAnswer", "createdAt", "id", "optionA", "optionB", "optionC", "optionD", "questionText", "updatedAt" FROM "placement_questions";
DROP TABLE "placement_questions";
ALTER TABLE "new_placement_questions" RENAME TO "placement_questions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
