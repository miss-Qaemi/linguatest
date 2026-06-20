// app/api/student/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const completedSessions = await prisma.examSession.findMany({
    where: { studentId: user.id, completedAt: { not: null } },
  });

  const completedThisMonth = completedSessions.filter(
    (s) => s.completedAt && s.completedAt > lastMonth
  ).length;
  const completedLastMonth = completedSessions.filter(
    (s) => s.completedAt && s.completedAt <= lastMonth
  ).length;

  const scores = completedSessions.map((s) => s.score ?? 0);
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  function scoreToLevel(score: number) {
    if (score >= 90) return "C2";
    if (score >= 75) return "C1";
    if (score >= 60) return "B2";
    if (score >= 45) return "B1";
    if (score >= 30) return "A2";
    return "A1";
  }

  const nextExam = await prisma.exam.findFirst({
    where: {
      startDate: { gt: now },
      course: {
        enrollments: { some: { studentId: user.id } },
      },
    },
    orderBy: { startDate: "asc" },
    include: { course: true },
  });

  return NextResponse.json({
    examsCompleted: completedSessions.length,
    completedChange: completedThisMonth - completedLastMonth,
    avgProficiency: scoreToLevel(avgScore),
    proficiencyNote: `Based on ${scores.length} completed exam${scores.length !== 1 ? "s" : ""}`,
    nextExamDate: nextExam
      ? nextExam.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "—",
    nextExamName: nextExam ? nextExam.title : "No upcoming exams",
  });
}
