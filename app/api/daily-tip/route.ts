import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ✅ نکات به سه زبان
const TIPS = {
  fa: [
    "هر روز حداقل ۱۵ دقیقه با افراد بومی زبان صحبت کنید تا روانی و اعتماد به نفس خود را افزایش دهید. از اشتباه کردن نترسید!",
    "فیلم یا سریال به زبان مورد نظر با زیرنویس تماشا کنید تا مهارت شنیداری خود را بهبود بخشید.",
    "هر روز حداقل ۳ جمله در دفترچه یادداشت خود به زبان مورد نظر بنویسید.",
    "در زمان رفت و آمد یا ورزش به پادکست‌های زبان مورد نظر گوش دهید.",
    "سعی کنید به زبان مورد نظر فکر کنید، نه اینکه از زبان مادری ترجمه کنید.",
    "اهداف مشخص و قابل اندازه‌گیری تعیین کنید مانند 'روزی ۱۰ کلمه جدید یاد بگیرم' یا 'یک مکالمه ۵ دقیقه‌ای داشته باشم'.",
    "یک شریک تبادل زبان آنلاین پیدا کنید تا به طور منظم تمرین کنید.",
    "کتاب‌های کودکان یا اخبار ساده را بخوانید تا مهارت خواندن خود را بهبود بخشید.",
    "صدای خود را هنگام صحبت ضبط کنید و به آن گوش دهید تا نقاط ضعف خود را شناسایی کنید.",
    "عبارات و اصطلاحات رایج را یاد بگیرید تا در مکالمه طبیعی‌تر به نظر برسید."
  ],
  en: [
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
  ],
  de: [
    "Üben Sie jeden Tag mindestens 15 Minuten mit Muttersprachlern, um Ihre Sprachgewandtheit und Ihr Selbstvertrauen zu verbessern. Haben Sie keine Angst, Fehler zu machen!",
    "Sehen Sie Filme oder Serien in Ihrer Zielsprache mit Untertiteln, um Ihr Hörverständnis zu verbessern.",
    "Führen Sie ein Tagebuch in der Sprache, die Sie lernen. Schreiben Sie jeden Tag mindestens 3 Sätze.",
    "Hören Sie beim Pendeln oder beim Sport Podcasts in Ihrer Zielsprache.",
    "Versuchen Sie, in der Sprache zu denken, die Sie lernen, anstatt aus Ihrer Muttersprache zu übersetzen.",
    "Setzen Sie sich spezifische, messbare Ziele wie 'lernen Sie 10 neue Wörter pro Tag' oder 'führen Sie ein 5-minütiges Gespräch'.",
    "Finden Sie einen Online-Sprachpartner, um regelmäßig zu sprechen.",
    "Lesen Sie Kinderbücher oder Nachrichten in einfacher Sprache, um Ihre Lesefähigkeiten zu verbessern.",
    "Nehmen Sie sich beim Sprechen auf und hören Sie zu, um Verbesserungsbereiche zu identifizieren.",
    "Lernen Sie gebräuchliche Redewendungen und Redewendungen, um im Gespräch natürlicher zu klingen."
  ]
};

// GET: دریافت نکته امروز
export async function GET(req: Request) {
  try {
    // ✅ دریافت زبان از هدر درخواست
    const url = new URL(req.url);
    const lang = url.searchParams.get('lang') || 'en';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // محاسبه ایندکس بر اساس روز سال
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const tips = TIPS[lang as keyof typeof TIPS] || TIPS.en;
    const tipIndex = dayOfYear % tips.length;

    const session = await getServerSession(authOptions);
    let isSaved = false;
    let tipId = null;

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
              content: tips[tipIndex],
              date: today
            }
          });
        }

        tipId = tip.id;

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

    // ✅ برگرداندن نکته به زبان درخواستی
    return NextResponse.json({
      id: tipId,
      content: tips[tipIndex],
      date: today.toISOString(),
      isSaved
    });

  } catch (error) {
    console.error("Daily tip error:", error);
    return NextResponse.json(
      { 
        id: null, 
        content: TIPS.en[0], 
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
      tipId: tip.id
    });

  } catch (error) {
    console.error("Save tip error:", error);
    return NextResponse.json({ error: "Failed to save tip" }, { status: 500 });
  }
}

// PUT: دریافت نکات ذخیره شده
export async function PUT(req: Request) {
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