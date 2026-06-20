import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const authSession = await getServerSession(authOptions);

  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params; // ✅ await اضافه شد
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "start") {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const existing = await prisma.examSession.findFirst({
      where: {
        examId,
        studentId: authSession.user.id,
        status: "IN_PROGRESS",
      },
    });

    let examSession = existing;
    if (!examSession) {
      examSession = await prisma.examSession.create({
        data: {
          examId,
          studentId: authSession.user.id,
          startedAt: new Date(),
          status: "IN_PROGRESS",
          totalQuestions: exam.questions.length,
        },
      });
    }

    const questions = exam.questions.map((q) => {
      let parsedOptions: { letter: string; text: string }[] = [];

      if (q.options) {
        try {
          const raw = JSON.parse(q.options);

          if (Array.isArray(raw)) {
            if (raw.length > 0 && typeof raw[0] === "object" && "letter" in raw[0]) {
              parsedOptions = raw;
            } else if (raw.length > 0 && typeof raw[0] === "string") {
              const letters = ["A", "B", "C", "D"];
              parsedOptions = raw.map((text: string, i: number) => ({
                letter: letters[i] ?? String(i + 1),
                text,
              }));
            }
          } else if (typeof raw === "object" && raw !== null) {
            const letters = ["A", "B", "C", "D"];
            parsedOptions = letters
              .filter((l) => raw[l])
              .map((l) => ({ letter: l, text: raw[l] as string }));
          }
        } catch {
          parsedOptions = [];
        }
      }

      return {
        id: q.id,
        questionText: q.questionText,
        order: q.order,
        section: q.section ?? "general",
        options: parsedOptions,
        correctAnswer: q.correctAnswer,
        type: q.type ?? "MULTIPLE_CHOICE",
      };
    });

    return NextResponse.json({
      attemptId: examSession.id,
      sessionId: examSession.id,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        audioUrl: exam.audioUrl ?? null,
        passageText: exam.passageText ?? null,
        questions,
      },
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const authSession = await getServerSession(authOptions);

  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params; // ✅ await اضافه شد
  const body = await request.json();
  const { action } = body;

  // ─── SAVE ─────────────────────────────────────────────────────
  if (action === "save") {
    const { attemptId, answers } = body as {
      attemptId: string;
      answers: Record<string, string>;
    };

    if (!attemptId) {
      return NextResponse.json(
        { error: "attemptId is required" },
        { status: 400 }
      );
    }

    const examSession = await prisma.examSession.findUnique({
      where: { id: attemptId },
    });

    if (!examSession || examSession.studentId !== authSession.user.id) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (answers && typeof answers === "object") {
      for (const [questionId, selectedOption] of Object.entries(answers)) {
        await prisma.answer.upsert({
          where: {
            id: `${attemptId}_${questionId}`,
          },
          update: {
            selectedOption: String(selectedOption),
          },
          create: {
            id: `${attemptId}_${questionId}`,
            sessionId: attemptId,
            questionId,
            selectedOption: String(selectedOption),
            isCorrect: false,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  }

  // ─── SUBMIT ───────────────────────────────────────────────────
  if (action === "submit") {
    const { attemptId, answers } = body as {
      attemptId: string;
      answers: Record<string, string>;
    };

    if (!attemptId) {
      return NextResponse.json(
        { error: "attemptId is required" },
        { status: 400 }
      );
    }

    const examSession = await prisma.examSession.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: { questions: true },
        },
      },
    });

    if (!examSession || examSession.studentId !== authSession.user.id) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (examSession.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Already submitted" },
        { status: 400 }
      );
    }

    const questions = examSession.exam.questions;
    let correctCount = 0;

    if (answers && typeof answers === "object") {
      for (const q of questions) {
        const selectedOption = answers[q.id] ?? null;
        const isCorrect = selectedOption === q.correctAnswer;

        if (isCorrect) correctCount++;

        await prisma.answer.upsert({
          where: {
            id: `${attemptId}_${q.id}`,
          },
          update: {
            selectedOption,
            isCorrect,
          },
          create: {
            id: `${attemptId}_${q.id}`,
            sessionId: attemptId,
            questionId: q.id,
            selectedOption,
            isCorrect,
          },
        });
      }
    }

    const score =
      questions.length > 0
        ? Math.round((correctCount / questions.length) * 100)
        : 0;

    await prisma.examSession.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        score,
        totalCorrect: correctCount,
      },
    });

    return NextResponse.json({
      success: true,
      score,
      correctCount,
      totalQuestions: questions.length,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
