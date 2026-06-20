// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── استادها ──────────────────────────────────────────
  const teachers = [
    {
      name:     "Dr. Sarah Müller",
      username: "sarah_muller",
      email:    "sarah@test.com",
    },
    {
      name:     "Prof. James Carter",
      username: "james_carter",
      email:    "james@test.com",
    },
    {
      name:     "نیلوفر رضایی",
      username: "niloofar_rezaei",
      email:    "niloofar@test.com",
    },
    {
      name:     "Teacher One",
      username: "teacher1",
      email:    "teacher1@lingua.com",
    },
  ];

  for (const t of teachers) {
    await prisma.user.upsert({
      where:  { email: t.email },
      update: {},
      create: {
        name:     t.name,
        username: t.username,
        email:    t.email,
        password: await bcrypt.hash("123456", 10),
        role:     "TEACHER",
      },
    });
  }

  // ── دانشجوها ─────────────────────────────────────────
  const students = [
    {
      name:     "دانشجو نمونه",
      username: "student_test",
      email:    "student@test.com",
    },
    {
      name:     "Ali Rezaei",
      username: "ali_rezaei",
      email:    "ali@test.com",
    },
  ];

  for (const s of students) {
    await prisma.user.upsert({
      where:  { email: s.email },
      update: {},
      create: {
        name:     s.name,
        username: s.username,
        email:    s.email,
        password: await bcrypt.hash("123456", 10),
        role:     "STUDENT",
      },
    });
  }

  console.log("✅ Seed done");
  console.log("👤 Teachers:", teachers.map(t => t.email).join(", "));
  console.log("👤 Students:", students.map(s => s.email).join(", "));
  console.log("🔑 Password for all: 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
