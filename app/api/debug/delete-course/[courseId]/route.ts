import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // حذف مستقیم با SQL
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
    
    // حذف answers
    await prisma.$executeRaw`
      DELETE FROM answers 
      WHERE sessionId IN (
        SELECT id FROM exam_sessions 
        WHERE examId IN (
          SELECT id FROM exams 
          WHERE courseId = ${params.courseId}
        )
      )
    `;

    // حذف exam sessions
    await prisma.$executeRaw`
      DELETE FROM exam_sessions 
      WHERE examId IN (
        SELECT id FROM exams 
        WHERE courseId = ${params.courseId}
      )
    `;

    // حذف questions
    await prisma.$executeRaw`
      DELETE FROM questions 
      WHERE examId IN (
        SELECT id FROM exams 
        WHERE courseId = ${params.courseId}
      )
    `;

    // حذف exams
    await prisma.$executeRaw`
      DELETE FROM exams 
      WHERE courseId = ${params.courseId}
    `;

    // حذف course contents
    await prisma.$executeRaw`
      DELETE FROM course_contents 
      WHERE courseId = ${params.courseId}
    `;

    // حذف enrollments
    await prisma.$executeRaw`
      DELETE FROM enrollments 
      WHERE courseId = ${params.courseId}
    `;

    // حذف خود کورس
    const result = await prisma.$executeRaw`
      DELETE FROM courses 
      WHERE id = ${params.courseId}
    `;

    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;

    if (result === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Course deleted successfully" });

  } catch (error) {
    console.error("Debug delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete course", details: String(error) },
      { status: 500 }
    );
  }
}