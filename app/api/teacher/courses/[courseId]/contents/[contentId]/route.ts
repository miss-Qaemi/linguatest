import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";

export const DELETE = withAuth(
  async (
    req: Request,
    { params }: { params: { courseId: string; contentId: string } },
    user: any
  ) => {
    try {
      // بررسی اینکه کورس متعلق به این استاد هست
      const course = await prisma.course.findFirst({
        where: {
          id: params.courseId,
          teacherId: user.id,
        },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found or access denied" },
          { status: 404 }
        );
      }

      // حذف محتوا
      await prisma.courseContent.delete({
        where: {
          id: params.contentId,
        },
      });

      return NextResponse.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting content:", error);
      return NextResponse.json(
        { error: "Failed to delete content" },
        { status: 500 }
      );
    }
  },
  ["TEACHER"]
);