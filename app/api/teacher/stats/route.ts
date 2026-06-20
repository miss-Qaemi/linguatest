// app/api/teacher/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";
import { Role } from "@prisma/client";

export const GET = withAuth(async (req: Request, context: any, user: any) => {
  try {
    // پیدا کردن کورس‌های این استاد
    const courses = await prisma.course.findMany({
      where: { teacherId: user.id },
      include: { 
        _count: { 
          select: { 
            enrollments: true 
          } 
        } 
      },
    });

    // پیدا کردن آزمون‌های این استاد
    const exams = await prisma.exam.findMany({
      where: { 
        course: { 
          teacherId: user.id 
        } 
      },
      select: { id: true },
    });

    const examIds = exams.map(e => e.id);
    
    const totalSessions = await prisma.examSession.count({
      where: { 
        examId: { in: examIds } 
      },
    });

    const sessions = await prisma.examSession.findMany({
      where: { 
        examId: { in: examIds },
        score: { not: null }
      },
      select: { score: true }
    });

    const avgScore = sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length)
      : 0;

    return NextResponse.json({
      totalCourses: courses.length,
      totalExams: exams.length,
      totalStudents: courses.reduce((sum, c) => sum + c._count.enrollments, 0),
      totalSessions,
      avgClassScore: avgScore,
      activeStudents: courses.reduce((sum, c) => sum + c._count.enrollments, 0),
      coursesTaught: courses.length,
      activeTests: exams.length,
    });
    
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}, [Role.TEACHER]);