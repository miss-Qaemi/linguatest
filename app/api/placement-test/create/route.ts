
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // بررسی احراز هویت
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "لطفاً ابتدا وارد شوید" },
        { status: 401 }
      );
    }

    // دریافت داده‌های ارسالی
    const body = await req.json();
    console.log("📥 Received data:", body);

    const { title, description, duration, questions } = body;

    // اعتبارسنجی
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "سوالات باید به صورت آرایه ارسال شوند" },
        { status: 400 }
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "حداقل یک سوال باید وجود داشته باشد" },
        { status: 400 }
      );
    }

    // شناسه ثابت برای آزمون تعیین سطح
    const testId = "placement_main";

    // حذف سوالات قبلی
    await prisma.placementQuestion.deleteMany({
      where: { testId }
    });

    // آماده‌سازی سوالات جدید
    const questionData = questions.map((q: any) => {
      // اعتبارسنجی هر سوال
      if (!q.questionText || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error("فرمت سوال نامعتبر است");
      }

      return {
        testId,
        questionText: q.questionText,
        optionA: q.options[0] || "",
        optionB: q.options[1] || "",
        optionC: q.options[2] || "",
        optionD: q.options[3] || "",
        correctAnswer: q.correctAnswer || "A"
      };
    });

    // ایجاد سوالات جدید
    const result = await prisma.placementQuestion.createMany({
      data: questionData
    });

    console.log(`✅ ${result.count} سوال با موفقیت ذخیره شد`);

    return NextResponse.json({
      success: true,
      message: "آزمون با موفقیت ذخیره شد",
      count: result.count
    });

  } catch (error) {
    // لاگ خطا برای دیباگ
    console.error("❌ Error in create placement test:", error);
    
    // برگرداندن پیام خطای مناسب
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "خطا در ذخیره آزمون",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}