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

    const { answers } = await req.json();

    // دریافت سوالات از دیتابیس
    const questions = await prisma.placementQuestion.findMany({
      where: { testId: "placement_main" }
    });

    // شمارش پاسخ‌های صحیح
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    
    // تعیین سطح بر اساس تعداد پاسخ‌های صحیح
    let level = "A1";
    let description = "";
    
    if (correctCount >= 0 && correctCount <= 5) {
      level = "A1";
      description = "شروع‌کننده - می‌توانید عبارات ساده روزمره را بفهمید و استفاده کنید";
    } else if (correctCount >= 6 && correctCount <= 13) {
      level = "A2";
      description = "ابتدایی - می‌توانید در موقعیت‌های آشنا ارتباط برقرار کنید";
    } else if (correctCount >= 14 && correctCount <= 20) {
      level = "B1";
      description = "متوسط - می‌توانید در مورد موضوعات آشنا صحبت کنید";
    } else if (correctCount >= 21 && correctCount <= 27) {
      level = "B2";
      description = "متوسط به بالا - می‌توانید با روانی نسبتاً خوب صحبت کنید";
    } else if (correctCount >= 28 && correctCount <= 29) {
      level = "C1";
      description = "پیشرفته - می‌توانید متون پیچیده را بفهمید";
    } else if (correctCount === 30) {
      level = "C2";
      description = "مسلط - می‌توانید مانند یک native speaker صحبت کنید";
    }

    // محاسبه درصد نمره
    const score = Math.round((correctCount / totalQuestions) * 100);

    // ذخیره نتیجه برای کاربر
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          bio: `سطح زبان: ${level} (${correctCount} پاسخ صحیح از ${totalQuestions})`
        }
      });
    }

    return NextResponse.json({
      success: true,
      level,
      score,
      correctCount,
      totalQuestions,
      description,
      message: `سطح زبان شما ${level} تعیین شد`
    });

  } catch (error) {
    console.error("Error submitting placement test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}