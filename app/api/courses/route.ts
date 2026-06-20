// app/api/courses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // اول چک کن که پرزیما کار می‌کنه
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        teacher: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // فیلتر کردن توی جاوااسکریپت
    const validCourses = courses.filter(c => c.teacher !== null);
    
    const result = validCourses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description ?? "",
      teacherName: c.teacher?.name ?? "مشخص نشده",
      language: c.language,
      level: c.level,
      price: c.price,
      promoVideoUrl: c.promoVideoUrl,
      thumbnailUrl: c.thumbnailUrl,
      enrolledCount: c._count.enrollments,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    // خطا رو به صورت readable برگردون
    return NextResponse.json(
      { error: "خطا در دریافت لیست کورس‌ها", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}