import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";
import { Role } from "@prisma/client";

// GET: دریافت یک آزمون خاص برای ویرایش
export const GET = withAuth(async (req: Request, context: any, user: any) => {
  try {
    const params = await context.params;
    const examId = params.examId;

    const exam = await prisma.exam.findFirst({
      where: { 
        id: examId, 
        teacherId: user.id 
      },
      include: {
        questions: {
          orderBy: { order: "asc" }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // پردازش گزینه‌های سوالات
    const parsedExam = {
      ...exam,
      questions: exam.questions.map((q) => ({
        ...q,
        options: (() => {
          try {
            return JSON.parse(q.options as string);
          } catch {
            return [];
          }
        })(),
      })),
    };

    return NextResponse.json(parsedExam);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}, [Role.TEACHER]);

// PUT: ویرایش یک آزمون خاص
export const PUT = withAuth(async (req: Request, context: any, user: any) => {
  try {
    const params = await context.params;
    const examId = params.examId;
    const body = await req.json();

    console.log("Updating exam:", examId);
    console.log("Received data:", body);

    // بررسی مالکیت آزمون
    const existingExam = await prisma.exam.findFirst({
      where: { id: examId, teacherId: user.id },
    });

    if (!existingExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const {
      title,
      description,
      duration,
      startDate,
      endDate,
      level,
      isPublic,
      audioUrl,
      passageText,
      courseId,
      questions = [],
    } = body;

    // اعتبارسنجی اولیه
    if (!title || !duration || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // به‌روزرسانی آزمون و سوالات (با تراکنش)
    const updatedExam = await prisma.$transaction(async (tx) => {
      // 1. به‌روزرسانی اطلاعات اصلی آزمون
      const exam = await tx.exam.update({
        where: { id: examId },
        data: {
          title,
          description: description || null,
          duration: Number(duration),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          level: level ?? "MEDIUM",
          isPublic: isPublic ?? true,
          audioUrl: audioUrl ?? null,
          passageText: passageText ?? null,
          courseId: courseId ?? null,
        },
      });

      // 2. حذف سوالات قبلی
      await tx.question.deleteMany({
        where: { examId },
      });

      // 3. ایجاد سوالات جدید (اگر وجود داشته باشند)
      if (questions.length > 0) {
        await tx.question.createMany({
          data: questions.map((q: any, index: number) => ({
            examId,
            questionText: q.questionText,
            type: q.type ?? "MULTIPLE_CHOICE",
            options: JSON.stringify(q.options || []),
            correctAnswer: q.correctAnswer,
            section: q.section ?? "general",
            order: q.order ?? index,
            difficulty: q.difficulty ?? "MEDIUM",
            explanation: q.explanation ?? null,
          })),
        });
      }

      // 4. دریافت آزمون به‌روزشده با سوالات
      const updatedExamWithQuestions = await tx.exam.findUnique({
        where: { id: examId },
        include: {
          questions: {
            orderBy: { order: "asc" }
          }
        }
      });

      return updatedExamWithQuestions;
    });

    if (!updatedExam) {
      return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
    }

    // پردازش گزینه‌ها برای پاسخ
    const examWithParsedOptions = {
      ...updatedExam,
      questions: updatedExam.questions.map((q) => ({
        ...q,
        options: (() => {
          try {
            return JSON.parse(q.options as string);
          } catch {
            return [];
          }
        })(),
      })),
    };

    return NextResponse.json(examWithParsedOptions);
  } catch (err) {
    console.error("Error updating exam:", err);
    return NextResponse.json(
      { error: "Failed to update exam: " + (err instanceof Error ? err.message : "Unknown error") },
      { status: 500 }
    );
  }
}, [Role.TEACHER]);

// DELETE: حذف آزمون
export const DELETE = withAuth(async (req: Request, context: any, user: any) => {
  try {
    const params = await context.params;
    const examId = params.examId;

    // بررسی مالکیت آزمون
    const existingExam = await prisma.exam.findFirst({
      where: { id: examId, teacherId: user.id },
    });

    if (!existingExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // حذف آزمون (سوالات به صورت خودکار با Cascade حذف می‌شوند)
    await prisma.exam.delete({
      where: { id: examId },
    });

    return NextResponse.json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
  }
}, [Role.TEACHER]);