// app/api/student/courses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";

// GET /api/student/courses?type=enrolled|public
export const GET = withAuth(async (req: Request, context: any, user: any) => {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "public";

  try {
    if (type === "enrolled") {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id },
        include: {
          course: {
            include: {
              teacher: { select: { name: true, bio: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        enrollments.map((e) => ({
          id: e.course.id,
          name: e.course.title,
          teacherId: e.course.teacherId,
          teacherName: e.course.teacher?.name,
          teacherBio: e.course.teacher?.bio,
        }))
      );
    } else {
      // public courses (not enrolled)
      const courses = await prisma.course.findMany({
        where: {
          isPublished: true,
          enrollments: { none: { studentId: user.id } },
        },
        include: {
          teacher: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        courses.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          teacherName: c.teacher?.name,
          language: c.language,
          level: c.level,
          price: c.price,
          enrolledCount: c._count.enrollments,
        }))
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}, ["STUDENT"]);