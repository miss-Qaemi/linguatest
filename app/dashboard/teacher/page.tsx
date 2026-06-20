
"use client";
import { Award } from 'lucide-react';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, BookOpen, FileText, TrendingUp, Bell, Search,
  ChevronRight, MoreVertical, Plus, Calendar,
  GraduationCap, LayoutDashboard, BarChart2,
  ClipboardList, LogOut, Loader2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Footer } from '@/app/components/layout/footer';
import { useLanguage } from '@/app/context/LanguageContext';

interface Stats {
  activeStudents: number;
  coursesTaught: number;
  activeTests: number;
  avgClassScore: number;
}

interface Course {
  id: string;
  name: string;
  description?: string;
  students: number;
  updatedAt: string;
}

interface Activity {
  studentName: string;
  examTitle: string;
  status: string;
  score: number | null;
  startedAt: string;
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, dir } = useLanguage();

  const [stats, setStats] = useState<Stats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Auth guard
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role === "STUDENT") router.push("/dashboard/student");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function load() {
      try {
        const [s, c, a] = await Promise.all([
          fetch("/api/teacher/stats").then((r) => r.ok ? r.json() : null),
          fetch("/api/teacher/courses").then((r) => r.ok ? r.json() : []),
          fetch("/api/teacher/activity").then((r) => r.ok ? r.json() : []),
        ]);
        
        setStats(s);
        setCourses(Array.isArray(c) ? c : []);
        setActivity(Array.isArray(a) ? a : []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status]);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const userName = session?.user?.name ?? "Teacher";
  const avatarLetters = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const statsConfig = [
    { label: t('teacher.activeStudents') || "Active Students", value: stats?.activeStudents ?? 0, icon: <Users size={22} className="text-blue-500" />, bg: "bg-blue-50" },
    { label: t('teacher.coursesTaught') || "Courses Taught", value: stats?.coursesTaught ?? 0, icon: <BookOpen size={22} className="text-green-500" />, bg: "bg-green-50" },
    { label: t('teacher.activeTests') || "Active Tests", value: stats?.activeTests ?? 0, icon: <FileText size={22} className="text-orange-500" />, bg: "bg-orange-50" },
    { label: t('teacher.avgClassScore') || "Avg. Class Score", value: stats ? `${stats.avgClassScore}%` : "0%", icon: <TrendingUp size={22} className="text-purple-500" />, bg: "bg-purple-50" },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <p className="text-sm text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col" dir={dir}>
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
              <GraduationCap size={22} /> LinguaTest
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
              <Link href="/dashboard/teacher" className="text-blue-600 flex items-center gap-1"><LayoutDashboard size={15} /> {t('dashboard')}</Link>
              <Link href="/courses" className="hover:text-blue-600 transition flex items-center gap-1"><BookOpen size={15} /> {t('courses')}</Link>
              <Link href="/dashboard/teacher/exams" className="hover:text-blue-600 transition flex items-center gap-1"><ClipboardList size={15} /> {t('teacher.assessments') || "Assessments"}</Link>
              <Link href="/dashboard/teacher/placement-test" className="hover:text-blue-600 transition flex items-center gap-1"><Award size={15} /> {t('teacher.placementTest') || "Placement Test"}</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{avatarLetters}</div>
              <span className="text-sm text-gray-700 font-medium hidden sm:block">{userName}</span>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-gray-400 hover:text-red-500 transition"><LogOut size={17} /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('welcome')} {userName.split(" ")[0]} 👋</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('teacher.dashboardSubtitle') || "Track your curriculum and students' progress here."}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/teacher/courses/create" className="flex items-center gap-2 text-sm bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition font-medium">
              <Plus size={15} /> {t('teacher.createNewCourse') || "Create New Course"}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsConfig.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`${s.bg} p-2 rounded-lg w-fit mb-3`}>{s.icon}</div>
              <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Left: Courses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">{t('teacher.courseManagement') || "Course Management"}</h2>
              <Link href="/courses" className="text-sm text-blue-600 hover:underline flex items-center gap-1">{t('teacher.viewAll') || "View All"} <ChevronRight size={14} /></Link>
            </div>

            <div className="space-y-3">
              {courses.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                  <BookOpen size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">{t('teacher.noCourses') || "No courses yet"}</p>
                  <Link href="/dashboard/teacher/courses/create" className="text-sm text-blue-600 hover:underline">{t('teacher.createFirstCourse') || "Create your first course"} →</Link>
                </div>
              )}

              {courses.map((c) => (
                <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-blue-200 transition">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <GraduationCap size={20} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.students} {t('teacher.students') || "Students"} • {timeAgo(c.updatedAt)}</p>
                  </div>
                  <Link href={`/dashboard/teacher/courses/${c.id}/manage`} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition">{t('teacher.manage') || "Manage"}</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Activity & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-blue-600 rounded-xl p-5 text-white shadow-lg">
              <h3 className="font-bold mb-1">{t('teacher.needAssessment') || "Need a new assessment?"}</h3>
              <p className="text-xs text-blue-100 mb-4">{t('teacher.examBuilderDesc') || "Create exams with questions, audio and timed sessions."}</p>
              <Link href="/dashboard/teacher/exams" className="block w-full text-center bg-white text-blue-600 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition">
                {t('teacher.goToExamBuilder') || "Go to Exam Builder"}
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('teacher.recentActivity') || "Recent Activity"}</p>
              <div className="space-y-4">
                {activity.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">{t('teacher.noActivity') || "No recent student activity"}</p>
                ) : (
                  activity.slice(0, 6).map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                        {a.studentName.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-bold">{a.studentName}</span> {a.status === "SUBMITTED" ? (t('teacher.completed') || "completed") : (t('teacher.started') || "started")} <span className="italic">"{a.examTitle}"</span>
                          {a.score !== null && ` (${a.score}%)`}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(a.startedAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}