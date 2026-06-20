import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // تلاش برای خوندن از دیتابیس
    const questions = await prisma.placementQuestion.findMany({
      orderBy: { level: "asc" }
    });

    // اگه دیتابیس خالی بود، از آرایه پیش‌فرض استفاده کن
    if (questions.length === 0) {
      const defaultQuestions = [
        {
          id: "1",
          questionText: "What is your name?",
          options: [
            { letter: "A", text: "My name is John" },
            { letter: "B", text: "I am 20 years old" },
            { letter: "C", text: "I live in London" },
            { letter: "D", text: "I am a student" }
          ],
          correctAnswer: "A",
          level: "A1"
        },
        {
          id: "2",
          questionText: "How are you?",
          options: [
            { letter: "A", text: "I am fine" },
            { letter: "B", text: "I am 25" },
            { letter: "C", text: "I am a teacher" },
            { letter: "D", text: "I am from France" }
          ],
          correctAnswer: "A",
          level: "A1"
        },
        {
          id: "3",
          questionText: "What did you do yesterday?",
          options: [
            { letter: "A", text: "I will go to school" },
            { letter: "B", text: "I went to the cinema" },
            { letter: "C", text: "I am eating dinner" },
            { letter: "D", text: "I have eaten" }
          ],
          correctAnswer: "B",
          level: "A2"
        }
      ];
      return NextResponse.json(defaultQuestions);
    }

    // تبدیل فرمت دیتابیس به فرمت مورد نیاز فرانت‌اند
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: [
        { letter: "A", text: q.optionA },
        { letter: "B", text: q.optionB },
        { letter: "C", text: q.optionC },
        { letter: "D", text: q.optionD }
      ],
      correctAnswer: q.correctAnswer,
      level: q.level
    }));

    return NextResponse.json(formattedQuestions);
    
  } catch (error) {
    console.error("Error fetching placement questions:", error);
    
    // در صورت خطا، آرایه پیش‌فرض رو برگردون
    const fallbackQuestions = [
      {
        id: "1",
        questionText: "What is your name?",
        options: [
          { letter: "A", text: "My name is John" },
          { letter: "B", text: "I am 20 years old" },
          { letter: "C", text: "I live in London" },
          { letter: "D", text: "I am a student" }
        ],
        correctAnswer: "A",
        level: "A1"
      },
      // ... بقیه سوالات
    ];
    
    return NextResponse.json(fallbackQuestions);
  }
}