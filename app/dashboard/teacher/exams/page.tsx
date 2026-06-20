// app/dashboard/teacher/exams/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  startDate: string;
  endDate: string;
  level: string;
  isPublic: boolean;
  _count: { questions: number };
}

export default function TeacherExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "TEACHER") router.push("/dashboard/student");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/teacher/exams");
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('exam.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/teacher/exams/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExams((prev) => prev.filter((e) => e.id !== id));
        alert(t('exam.deleteSuccess'));
      } else {
        alert(t('exam.deleteError'));
      }
    } catch {
      alert(t('exam.deleteError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">{t('loading')}</p>
        </div>
      </div>
    );
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fa-IR');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={dir}>
      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('exam.manageExams')}</h1>
          <Link
            href="/dashboard/teacher/exams/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={16} /> {t('exam.newExam')}
          </Link>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <p className="text-gray-400">{t('exam.noExams')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{exam.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{exam.description}</p>
                <div className="text-xs text-gray-600 space-y-1 mb-4">
                  <div>⏱️ {t('exam.duration')}: {exam.duration} {t('exam.minutes')}</div>
                  <div>📅 {t('exam.startDate')}: {formatDate(exam.startDate)}</div>
                  <div>📅 {t('exam.endDate')}: {formatDate(exam.endDate)}</div>
                  <div>📊 {t('exam.level')}: {exam.level}</div>
                  <div>🔢 {t('exam.questionsCount')}: {exam._count.questions}</div>
                  <div>🌐 {exam.isPublic ? t('exam.public') : t('exam.private')}</div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/teacher/exams/create?examId=${exam.id}`}
                    className="flex-1 flex items-center justify-center gap-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <Edit size={14} /> {t('exam.edit')}
                  </Link>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="flex-1 flex items-center justify-center gap-1 border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={14} /> {t('exam.delete')}
                  </button>
                  <Link
                    href={`/dashboard/teacher/exams/${exam.id}/results`}
                    className="flex-1 flex items-center justify-center gap-1 border border-blue-200 text-blue-600 py-2 rounded-lg hover:bg-blue-50"
                  >
                    <Eye size={14} /> {t('exam.results')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}