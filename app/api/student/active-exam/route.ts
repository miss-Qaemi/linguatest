// app/api/student/active-exam/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activeSession = await prisma.examSession.findFirst({
      where: {
        studentId: user.id,
        status: "IN_PROGRESS",
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            duration: true,
            _count: { select: { questions: true } },
          },
        },
        answers: { select: { id: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    if (!activeSession) {
      return NextResponse.json(null);
    }

    const timeElapsed = Math.floor(
      (Date.now() - activeSession.startedAt.getTime()) / 60000
    );
    const timeLeft = Math.max(0, activeSession.exam.duration - timeElapsed);

    return NextResponse.json({
      id: activeSession.exam.id,
      sessionId: activeSession.id,
      title: activeSession.exam.title,
      timeLeft,
      answeredQuestions: activeSession.answers.length,
      totalQuestions: activeSession.exam._count.questions,
    });
  } catch (error) {
    console.error("ACTIVE EXAM ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
