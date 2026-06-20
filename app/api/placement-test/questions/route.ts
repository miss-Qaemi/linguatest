import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.placementQuestion.findMany({
      where: { testId: "placement_main" }
    });

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: [
        { letter: "A", text: q.optionA },
        { letter: "B", text: q.optionB },
        { letter: "C", text: q.optionC },
        { letter: "D", text: q.optionD }
      ],
      correctAnswer: q.correctAnswer
    }));

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}