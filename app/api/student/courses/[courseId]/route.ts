import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";

export const GET = withAuth(
  async (req: Request, context: any, user: any) => {
    try {
      // 🟢 اصلاح مهم: دریافت params از context
      const params = await context.params;
      const courseId = params.courseId;

      console.log("Fetching student course content:", courseId);
      console.log("Student ID:", user.id);

      if (!courseId) {
        return NextResponse.json(
          { error: "Course ID is required" },
          { status: 400 }
        );
      }

      // دریافت اطلاعات کورس
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          description: true,
          isPublished: true,
          price: true
        },
      });

      if (!course || !course.isPublished) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      // بررسی ثبت‌نام دانشجو
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId: user.id, courseId: courseId },
        },
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: "شما در این کورس ثبت‌نام نکرده‌اید" },
          { status: 403 }
        );
      }

      // دریافت محتوای کورس
      const contents = await prisma.courseContent.findMany({
        where: { courseId: courseId },
        orderBy: { order: "asc" },
      });

      const isPaid = enrollment.isPaid ?? false;

      const safeContents = contents.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        order: c.order,
        isFree: c.isFree,
        locked: !(c.isFree || isPaid),
        url: c.isFree || isPaid ? c.url : "",
        text: c.isFree || isPaid ? c.text : null,
      }));

      console.log("Content count:", contents.length);

      return NextResponse.json({
        course: {
          id: course.id,
          title: course.title,
          description: course.description
        },
        contents: safeContents,
        isPaid,
      });

    } catch (error) {
      console.error("Error fetching student course:", error);
      return NextResponse.json(
        { error: "Failed to fetch course content" },
        { status: 500 }
      );
    }
  },
  ["STUDENT"]
);