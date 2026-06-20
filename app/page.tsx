import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { GraduationCap, Users, Globe, Star } from "lucide-react";
import { DailyTip } from "./components/DailyTip";
import { headers } from "next/headers";

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
  
  // تشخیص زبان از هدر (برای RTL/LTR)
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isPersian = pathname.includes('/fa') || !pathname.includes('/en');
  const dir = isPersian ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-white font-sans" dir={dir}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-blue-600 text-lg">LinguaTest</span>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-gray-600 text-sm hover:text-blue-600">
            🏠 Home
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-1 text-gray-600 text-sm hover:text-blue-600 px-3 py-2"
          >
            → Log In
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1 bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            👤 Create
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-50 mx-6 mt-4 rounded-2xl px-12 py-16 flex items-center justify-between flex-wrap">
        <div className="max-w-lg">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            Master New Languages,<br />Ace Every Test with<br />
            <span className="text-blue-600">LinguaTest</span>
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Your comprehensive platform for language learning and testing. Practice
            grammar, listening, and reading skills, get daily tips, and track your
            progress.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/placement-test"
              className="bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Start Placement Test
            </Link>
            <Link
              href="/register"
              className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors px-2"
            >
              Log In
            </Link>
          </div>
        </div>
        <div className="ml-10">
          <div className="w-72 h-56 bg-gradient-to-br from-yellow-200 via-orange-100 to-blue-100 rounded-2xl flex items-center justify-center">
            <span className="text-6xl">🌍</span>
          </div>
        </div>
      </section>

      {/* Daily Tip */}
      <DailyTip />

      {/* Exam Categories */}
      <section className="bg-blue-50 py-16 px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-12">
          Explore Our Exam Categories
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "📝",
              title: "Grammar Test",
              desc: "Assess your ability to express ideas clearly and correctly in a target language. From essays to short answers, we cover it all.",
            },
            {
              icon: "🎧",
              title: "Listening Test",
              desc: "Improve your comprehension with diverse audio materials. Understand dialogues, lectures, and announcements effectively.",
            },
            {
              icon: "📚",
              title: "Reading Test",
              desc: "Enhance your reading speed and retention. Tackle various texts, from articles to academic papers, with ease.",
            },
          ].map((cat) => (
            <div
              key={cat.title}
              className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
            >
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-3">{cat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{cat.desc}</p>
              <Link
                href="/dashboard/student/exams"
                className="bg-blue-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start Test
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-3">
            Popular Courses
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            Start learning with our most popular courses, taught by expert instructors
          </p>

          {courses.length === 0 ? (
            <p className="text-center text-gray-400">No courses available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GraduationCap size={48} className="text-blue-300" />
                    )}
                    <span className="absolute top-3 right-3 bg-white/90 text-xs font-medium px-2 py-1 rounded-full">
                      {course.price === 0 ? "Free" : `${course.price.toLocaleString()} T`}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {course.avatarLetter}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{course.title}</h3>
                        <p className="text-gray-500 text-xs">by {course.teacherName}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Globe size={12} /> {course.language}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {course.enrolledCount} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" /> {course.level}
                      </span>
                    </div>

                    <Link
                      href={`/courses/${course.id}`}
                      className="block w-full text-center border border-blue-500 text-blue-600 text-sm py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/courses"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              See All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="font-bold text-blue-600">LinguaTest</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Your comprehensive platform for language testing and daily learning.
            </p>
            <div className="flex gap-3 text-gray-400 text-sm">
              <span className="cursor-pointer hover:text-gray-600">🐙</span>
              <span className="cursor-pointer hover:text-gray-600">🐦</span>
              <span className="cursor-pointer hover:text-gray-600">💼</span>
            </div>
          </div>

          {[
            { title: "About Us", links: ["Our Story", "Team", "Careers"] },
            { title: "Support", links: ["FAQ", "Help Center", "Contact Us"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-medium text-gray-700 text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 text-sm hover:text-gray-600">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-gray-100">
          <p className="text-gray-300 text-xs">Made with ❤️ for language learners</p>
        </div>
      </footer>
    </div>
  );
}