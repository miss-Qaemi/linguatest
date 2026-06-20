import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(
  request: Request,
  context: any  // 🟢 تغییر: از params به context
) {
  try {
    // 🟢 اصلاح مهم: دریافت courseId از context
    const params = await context.params;
    const courseId = params.courseId;
    
    console.log("Fetching course with ID:", courseId);
    
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }
    
    const user = await getCurrentUser();
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: { 
          select: { id: true, name: true, email: true } 
        },
        contents: {
          select: { 
            id: true, 
            title: true, 
            type: true, 
            order: true, 
            isFree: true 
          },
          orderBy: { order: "asc" },
        },
        _count: { 
          select: { enrollments: true } 
        },
      },
    });

    if (!course) {
      console.log("Course not found:", courseId);
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // اگر کورس منتشر نشده، فقط استاد خودش می‌تونه ببینه
    if (!course.isPublished) {
      if (!user || user.id !== course.teacherId) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }
    }

    console.log("Course found:", course.title);
    return NextResponse.json(course);
    
  } catch (error) {
    console.error("Error in GET /api/courses/[courseId]:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}