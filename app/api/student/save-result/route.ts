import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { examId, result } = await req.json();

    // بررسی تکراری نبودن
    const existing = await prisma.savedResult.findFirst({
      where: {
        userId: user.id,
        examId
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Result already saved" }, { status: 400 });
    }

    // ذخیره نتیجه
    const savedResult = await prisma.savedResult.create({
      data: {
        userId: user.id,
        examId,
        examTitle: result.examTitle,
        score: result.score,
        totalCorrect: result.totalCorrect,
        totalQuestions: result.totalQuestions,
        completedAt: new Date(result.completedAt),
        answers: JSON.stringify(result.answers)
      }
    });

    // به‌روزرسانی وضعیت آزمون
    await prisma.examSession.updateMany({
      where: {
        examId,
        studentId: user.id
      },
      data: {
        status: "COMPLETED"
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "نتیجه با موفقیت ذخیره شد",
      savedResult 
    });

  } catch (error) {
    console.error("Error saving result:", error);
    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 }
    );
  }
}