// app/api/student/courses/enroll/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";

export const POST = withAuth(async (req: Request, context: any, user: any) => {
  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, isPublished: true, teacherId: true, price: true },
    });

    if (!course || !course.isPublished) {
      return NextResponse.json(
        { error: "Course not available" },
        { status: 404 }
      );
    }

    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: { studentId: user.id, courseId: course.id },
      },
      update: {},
      create: {
        studentId: user.id,
        courseId: course.id,
        teacherId: course.teacherId,
        isPaid: course.price === 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}, ["STUDENT"]);