// app/dashboard/student/exams/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

interface Exam {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  questionCount: number;
  startDate: string;
  endDate: string;
  status: "available" | "in_progress" | "past";
  courseName: string;
}

interface Stats {
  examsCompleted: number;
  completedChange: number;
  avgProficiency: string;
  proficiencyNote: string;
  nextExamDate: string;
  nextExamName: string;
}

export default function ExamsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, dir } = useLanguage();

  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchExams();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/student/stats");
      if (res.ok) setStats(await res.json());
    } catch {}
  }

  async function fetchExams() {
    try {
      setLoading(true);
      const res = await fetch("/api/student/exams");
      if (res.ok) setExams(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  const filtered = exams.filter((exam) => {
    const matchSearch =
      !search ||
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      exam.courseName.toLowerCase().includes(search.toLowerCase()) ||
      exam.level.toLowerCase().includes(search.toLowerCase());

    const matchTab =
      activeTab === "all" ||
      (activeTab === "available" && exam.status === "available") ||
      (activeTab === "in_progress" && exam.status === "in_progress") ||
      (activeTab === "past" && exam.status === "past");

    return matchSearch && matchTab;
  });

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function getLevelLabel(level: string): string {
    const levelMap: Record<string, string> = {
      'A1': t('examLevel.A1') || 'A1',
      'A2': t('examLevel.A2') || 'A2',
      'B1': t('examLevel.B1') || 'B1',
      'B2': t('examLevel.B2') || 'B2',
      'C1': t('examLevel.C1') || 'C1',
      'C2': t('examLevel.C2') || 'C2',
    };
    return levelMap[level] || level;
  }

  function ExamCard({ exam }: { exam: Exam }) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-600">
            {getLevelLabel(exam.level)}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            exam.status === "available" ? "bg-green-100 text-green-600" :
            exam.status === "in_progress" ? "bg-blue-100 text-blue-600" :
            "bg-gray-100 text-gray-500"
          }`}>
            {exam.status === "available" ? t('exam.available') :
             exam.status === "in_progress" ? t('exam.inProgress') :
             t('exam.past')}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 text-base leading-snug">{exam.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{exam.courseName}</p>
        </div>

        <div className="flex flex-col gap-1 text-xs text-gray-500">
          <div className="flex gap-4">
            <span>📅 {t('exam.starts')}: {formatDate(exam.startDate)}</span>
            <span>🕐 {exam.duration} {t('exam.mins')}</span>
          </div>
          <div className="flex gap-4">
            <span>📅 {t('exam.ends')}: {formatDate(exam.endDate)}</span>
            <span>📄 {exam.questionCount} {t('exam.questions')}</span>
          </div>
        </div>

        <div className="mt-1">
          {exam.status === "in_progress" && (
            <button
              onClick={() => router.push(`/dashboard/student/exams/${exam.id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {t('exam.continueExam')} →
            </button>
          )}
          {exam.status === "available" && (
            <button
              onClick={() => router.push(`/dashboard/student/exams/${exam.id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              {t('exam.startExam')}
            </button>
          )}
          {exam.status === "past" && (
            <button
              onClick={() => router.push(`/dashboard/student/exams/${exam.id}/results`)}
              className="w-full border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
            >
              {t('exam.viewResults')}
            </button>
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "all", label: t('exam.allExams') },
    { key: "available", label: t('exam.available') },
    { key: "in_progress", label: t('exam.inProgress') },
    { key: "past", label: t('exam.pastResults') },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('exam.welcomeBack')}, {session?.user?.name?.split(" ")[0] || t('exam.student')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('exam.subtitle')}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{t('exam.examsCompleted')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.examsCompleted}</p>
              <p className="text-xs text-green-600 mt-1">+{stats.completedChange} {t('exam.fromLastMonth')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{t('exam.avgProficiency')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgProficiency}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.proficiencyNote}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{t('exam.nextScheduled')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.nextExamDate}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.nextExamName}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-400 flex-1">
            <span>🔍</span>
            <input
              type="text"
              placeholder={t('exam.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button className="flex items-center gap-1 hover:text-gray-700">
              ⚙️ {t('exam.advancedFilters')}
            </button>
            <span>{t('exam.sortBy')}:</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg font-medium">{t('exam.noExamsFound')}</p>
            <p className="text-sm mt-1">{t('exam.tryAdjusting')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}