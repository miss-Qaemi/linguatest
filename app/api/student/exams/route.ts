import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json([], { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json([]);

    const now = new Date();

    const exams = await prisma.exam.findMany({
      where: {
        OR: [
          { isPublic: true },
          { assignedStudents: { some: { id: user.id } } },
        ],
      },
      include: {
        _count: { select: { questions: true } },
        course: { select: { title: true } },
        sessions: {
          where: { studentId: user.id },
          select: { status: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    const result = exams.map((exam) => {
      const session = exam.sessions[0];
      let status: "available" | "in_progress" | "past" = "available";
      if (exam.endDate < now) status = "past";
      else if (session?.status === "IN_PROGRESS") status = "in_progress";
      else if (session?.status === "SUBMITTED") status = "past";

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description ?? "",
        level: exam.level,
        duration: exam.duration,
        questionCount: exam._count.questions,
        startDate: exam.startDate.toISOString(),
        endDate: exam.endDate.toISOString(),
        status,
        courseName: exam.course?.title ?? "General",
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("EXAMS LIST ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
