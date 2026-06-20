// app/api/teacher/activity/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";
import { Role } from "@prisma/client";

export const GET = withAuth(async (req: Request, context: any, user: any) => {
  try {
    // پیدا کردن کورس‌های این استاد
    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: user.id },
      select: { id: true }
    });

    const courseIds = teacherCourses.map(c => c.id);

    const sessions = await prisma.examSession.findMany({
      where: { 
        exam: { 
          courseId: { in: courseIds } 
        } 
      },
      orderBy: { startedAt: "desc" },
      take: 10,
      include: {
        student: { select: { name: true, email: true } },
        exam: { select: { title: true } },
      },
    });

    return NextResponse.json(
      sessions.map((s) => ({
        studentName: s.student.name ?? s.student.email,
        examTitle: s.exam.title,
        status: s.status,
        score: s.score,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
      }))
    );
  } catch (error) {
    console.error("Activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}, [Role.TEACHER]);