import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const TIPS = [
  "Practice speaking with native speakers for at least 15 minutes a day to improve fluency and confidence. Don't be afraid to make mistakes!",
  "Watch movies or TV shows in your target language with subtitles to improve listening comprehension.",
  "Keep a journal in the language you're learning. Write at least 3 sentences every day.",
  "Listen to podcasts in your target language during commute or exercise.",
  "Try to think in the language you're learning instead of translating from your native language.",
  "Set specific, measurable goals like 'learn 10 new words per day' or 'have a 5-minute conversation'.",
  "Find a language exchange partner online to practice speaking regularly.",
  "Read children's books or news in simple language to improve reading skills.",
  "Record yourself speaking and listen back to identify areas for improvement.",
  "Learn common phrases and idioms to sound more natural in conversation."
];

// GET: دریافت نکته امروز
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // محاسبه ایندکس بر اساس روز سال
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const tipIndex = dayOfYear % TIPS.length;

    const session = await getServerSession(authOptions);
    let isSaved = false;
    let tipId = null; // ✅ اضافه شد

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (user) {
        // پیدا کردن یا ایجاد نکته امروز
        let tip = await prisma.dailyTip.findFirst({
          where: { date: today }
        });

        if (!tip) {
          tip = await prisma.dailyTip.create({
            data: {
              content: TIPS[tipIndex],
              date: today
            }
          });
        }

        tipId = tip.id; // ✅ ذخیره id

        // بررسی اینکه کاربر این نکته رو ذخیره کرده یا نه
        const save = await prisma.tipSave.findFirst({
          where: {
            userId: user.id,
            tipId: tip.id
          }
        });
        
        isSaved = !!save;
      }
    }

    // ✅ برگردوندن id همراه با پاسخ
    return NextResponse.json({
      id: tipId,
      content: TIPS[tipIndex],
      date: today.toISOString(),
      isSaved
    });

  } catch (error) {
    console.error("Daily tip error:", error);
    return NextResponse.json(
      { 
        id: null, 
        content: TIPS[0], 
        date: new Date().toISOString(), 
        isSaved: false 
      }
    );
  }
}

// POST: ذخیره نکته
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

    const { content, date } = await req.json();

    // پیدا کردن یا ایجاد نکته
    let tip = await prisma.dailyTip.findFirst({
      where: { date: new Date(date) }
    });

    if (!tip) {
      tip = await prisma.dailyTip.create({
        data: {
          content,
          date: new Date(date)
        }
      });
    }

    // ذخیره برای کاربر
    await prisma.tipSave.create({
      data: {
        userId: user.id,
        tipId: tip.id
      }
    });

    return NextResponse.json({ 
      success: true,
      tipId: tip.id // ✅ برگردوندن id
    });

  } catch (error) {
    console.error("Save tip error:", error);
    return NextResponse.json({ error: "Failed to save tip" }, { status: 500 });
  }
}

// PUT: دریافت نکات ذخیره شده
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json([], { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const savedTips = await prisma.tipSave.findMany({
      where: { userId: user.id },
      include: { tip: true },
      orderBy: { savedAt: 'desc' },
      take: 10
    });

    return NextResponse.json(savedTips.map(st => ({
      id: st.tip.id,
      content: st.tip.content,
      date: st.tip.date,
      savedAt: st.savedAt
    })));

  } catch (error) {
    console.error("Get saved tips error:", error);
    return NextResponse.json([]);
  }
}