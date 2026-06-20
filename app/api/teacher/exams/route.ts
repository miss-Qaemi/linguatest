// app/api/teacher/exams/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";
import { Role } from "@prisma/client";

// GET: دریافت لیست آزمون‌ها
export const GET = withAuth(async (req: Request, context: any, user: any) => {
  try {
    const exams = await prisma.exam.findMany({
      where: { teacherId: user.id },
      include: {
        questions: true,
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}, [Role.TEACHER]);

// POST: ایجاد آزمون جدید
export const POST = withAuth(async (req: Request, context: any, user: any) => {
  try {
    const body = await req.json();
    console.log("📥 Creating exam with data:", body);

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

    // اعتبارسنجی
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // ایجاد آزمون
    const exam = await prisma.exam.create({
      data: {
        title,
        description: description || null,
        duration: Number(duration),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        level: level || "MEDIUM",
        isPublic: isPublic ?? true,
        audioUrl: audioUrl || null,
        passageText: passageText || null,
        courseId: courseId || null,
        teacherId: user.id,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionText: q.questionText,
            type: "MULTIPLE_CHOICE",
            options: JSON.stringify(q.options || []),
            correctAnswer: q.correctAnswer,
            section: "general",
            order: index,
            difficulty: level || "MEDIUM",
          })),
        },
      },
      include: { questions: true },
    });

    console.log("✅ Exam created successfully:", exam.id);
    return NextResponse.json(exam, { status: 201 });
    
  } catch (error) {
    console.error("❌ Error creating exam:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create exam" },
      { status: 500 }
    );
  }
}, [Role.TEACHER]);