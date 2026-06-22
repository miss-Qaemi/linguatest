import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { GraduationCap, Users, Globe, Star } from "lucide-react";
import { DailyTip } from "./components/DailyTip";
import { Header } from "./components/layout/Header";
import { HomePageContent } from "./components/HomePageContent";

// دریافت کورس‌ها از دیتابیس
async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        teacher: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description ?? "",
      teacherName: c.teacher?.name ?? "Unknown",
      language: c.language,
      level: c.level,
      price: c.price,
      thumbnailUrl: c.thumbnailUrl,
      enrolledCount: c._count.enrollments,
      avatarLetter: c.teacher?.name?.[0]?.toUpperCase() ?? "?",
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-white font-sans">
     
      <HomePageContent courses={courses} />
    </div>
  );
}