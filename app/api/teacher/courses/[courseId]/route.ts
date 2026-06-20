import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";

export const GET = withAuth(
  async (req: Request, context: any, user: any) => {
    try {
      // 🟢 اصلاح مهم: دریافت params از context
      const params = await context.params;
      const courseId = params.courseId;
      
      console.log("GET course:", courseId);
      
      const course = await prisma.course.findFirst({
        where: { id: courseId, teacherId: user.id },
        include: { enrollments: { select: { id: true } } },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      return NextResponse.json({
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        language: course.language,
        price: course.price,
        isPublished: course.isPublished,
        promoVideoUrl: course.promoVideoUrl,
        thumbnailUrl: course.thumbnailUrl,
        enrolledCount: course.enrollments.length,
        createdAt: course.createdAt,
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      return NextResponse.json(
        { error: "Failed to fetch course" },
        { status: 500 }
      );
    }
  },
  ["TEACHER"]
);

export const PATCH = withAuth(
  async (req: Request, context: any, user: any) => {
    try {
      // 🟢 اصلاح مهم: دریافت params از context
      const params = await context.params;
      const courseId = params.courseId;
      
      const body = await req.json();

      const existing = await prisma.course.findFirst({
        where: { id: courseId, teacherId: user.id },
      });

      if (!existing) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const updated = await prisma.course.update({
        where: { id: courseId },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.level && { level: body.level }),
          ...(body.language && { language: body.language }),
          ...(body.price !== undefined && { price: Number(body.price) }),
          ...(body.promoVideoUrl !== undefined && { promoVideoUrl: body.promoVideoUrl }),
          ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
        },
      });

      return NextResponse.json({ 
        success: true, 
        isPublished: updated.isPublished,
        message: "Course updated successfully" 
      });
    } catch (error) {
      console.error("Error updating course:", error);
      return NextResponse.json(
        { error: "Failed to update course" },
        { status: 500 }
      );
    }
  },
  ["TEACHER"]
);

export const DELETE = withAuth(
  async (req: Request, context: any, user: any) => {
    try {
      // 🟢 اصلاح مهم: دریافت params از context
      const params = await context.params;
      const courseId = params.courseId;
      
      console.log("========== DELETE COURSE API ==========");
      console.log("Course ID:", courseId);
      console.log("Teacher ID:", user.id);
      
      if (!courseId) {
        console.log("❌ Course ID is undefined!");
        return NextResponse.json(
          { error: "Course ID is required" }, 
          { status: 400 }
        );
      }
      
      // 1. بررسی وجود کورس
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          exams: {
            include: {
              questions: true,
              sessions: {
                include: {
                  answers: true
                }
              }
            }
          },
          contents: true,
          enrollments: true
        }
      });

      if (!course) {
        console.log("❌ Course not found");
        return NextResponse.json(
          { error: "Course not found" }, 
          { status: 404 }
        );
      }

      // 2. بررسی مالکیت
      if (course.teacherId !== user.id) {
        console.log("❌ Access denied");
        return NextResponse.json(
          { error: "Access denied" }, 
          { status: 403 }
        );
      }

      console.log("✅ Course found:", course.title);
      console.log("📊 Statistics:");
      console.log("   - Exams:", course.exams.length);
      console.log("   - Contents:", course.contents.length);
      console.log("   - Enrollments:", course.enrollments.length);

      // 3. غیرفعال کردن موقت foreign keys
      await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
      
      // 4. حذف answers
      for (const exam of course.exams) {
        for (const session of exam.sessions) {
          await prisma.answer.deleteMany({
            where: { sessionId: session.id }
          });
        }
      }

      // 5. حذف exam sessions
      await prisma.examSession.deleteMany({
        where: { exam: { courseId: courseId } }
      });

      // 6. حذف questions
      await prisma.question.deleteMany({
        where: { exam: { courseId: courseId } }
      });

      // 7. حذف exams
      await prisma.exam.deleteMany({
        where: { courseId: courseId }
      });

      // 8. حذف course contents
      await prisma.courseContent.deleteMany({
        where: { courseId: courseId }
      });

      // 9. حذف enrollments
      await prisma.enrollment.deleteMany({
        where: { courseId: courseId }
      });

      // 10. حذف خود کورس
      const deletedCourse = await prisma.course.delete({
        where: { id: courseId }
      });

      // 11. فعال کردن دوباره foreign keys
      await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;

      console.log("✅ Course deleted successfully");
      console.log("========== DELETE COMPLETED ==========");
      
      return NextResponse.json({ 
        success: true,
        message: "Course deleted successfully" 
      });

    } catch (error) {
      console.error("========== DELETE ERROR ==========");
      console.error("Error name:", error instanceof Error ? error.name : "Unknown");
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      console.error("==================================");
      
      // اطمینان از فعال بودن دوباره foreign keys
      try {
        await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
      } catch (e) {
        console.error("Failed to re-enable foreign keys:", e);
      }
      
      return NextResponse.json(
        { 
          error: "Failed to delete course",
          details: error instanceof Error ? error.message : String(error)
        }, 
        { status: 500 }
      );
    }
  },
  ["TEACHER"]
);