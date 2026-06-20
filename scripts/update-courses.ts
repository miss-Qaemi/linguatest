// یه اسکریپت موقت برای آپدیت کورس‌ها
// فایل: scripts/update-courses.ts

import { prisma } from "@/app/lib/prisma";

async function updateCourses() {
  // همه کورس‌هایی که isPublished ندارن رو آپدیت کن
  const courses = await prisma.course.findMany({
    where: {
      isPublished: false  // یا false
    }
  });

  for (const course of courses) {
    await prisma.course.update({
      where: { id: course.id },
      data: { 
        isPublished: true,  // منتشرشون کن
        // اگه فیلد جدید داری مقدار پیش‌فرض بده
        level: course.level || "BEGINNER",
        language: course.language || "English"
      }
    });
  }

  console.log(`${courses.length} course updated`);
}

updateCourses();