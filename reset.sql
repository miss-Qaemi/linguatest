DELETE FROM "answers";
DELETE FROM "exam_sessions";
DELETE FROM "questions";
DELETE FROM "exams";
/*npx prisma db execute --file ./reset.sql --schema ./prisma/schema.prisma
