import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";

export const PATCH = withAuth(
  async (req: Request, { params }: { params: { courseId: string } }, user: any) => {
    try {
      const { isPublished } = await req.json();

      const course = await prisma.course.findFirst({
        where: { id: params.courseId, teacherId: user.id },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      // اگر می‌خواهیم منتشر کنیم، چک کنیم که حداقل یک محتوا داشته باشد
      if (isPublished === true) {
        const contentCount = await prisma.courseContent.count({
          where: { courseId: params.courseId },
        });

        if (contentCount === 0) {
          return NextResponse.json(
            { error: "برای انتشار، حداقل یک محتوا اضافه کنید" },
            { status: 400 }
          );
        }
      }

      const updated = await prisma.course.update({
        where: { id: params.courseId },
        data: { isPublished },
      });

      return NextResponse.json({
        isPublished: updated.isPublished,
        message: isPublished ? "Course published successfully!" : "Course unpublished",
      });
    } catch (error) {
      console.error("Error updating publish status:", error);
      return NextResponse.json(
        { error: "Failed to update publish status" },
        { status: 500 }
      );
    }
  },
  ["TEACHER"]
);