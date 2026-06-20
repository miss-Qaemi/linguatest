// app/api/student/exams/[examId]/result/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params;

  const examSession = await prisma.examSession.findFirst({
    where: {
      examId,
      studentId: session.user.id,
      status: { in: ["COMPLETED", "SUBMITTED"] },
    },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      },
      answers: true,
    },
    orderBy: { completedAt: "desc" },
  });

  if (!examSession) {
    return NextResponse.json({ error: "No completed session found" }, { status: 404 });
  }

  const questions = examSession.exam.questions.map((q) => {
    const answer = examSession.answers.find((a) => a.questionId === q.id);
    let options: { letter: string; text: string }[] = [];
    if (q.options) {
      try {
        options = JSON.parse(q.options);
      } catch {}
    }
    return {
      questionId: q.id,
      questionText: q.questionText,
      selectedOption: answer?.selectedOption ?? null,
      correctAnswer: q.correctAnswer,
      isCorrect: answer?.isCorrect ?? false,
      options,
    };
  });

  return NextResponse.json({
    examTitle: examSession.exam.title,
    score: examSession.score,
    totalCorrect: examSession.totalCorrect,
    totalQuestions: examSession.totalQuestions,
    completedAt: examSession.completedAt,
    answers: questions,
  });
}