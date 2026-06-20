"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Loader2, CheckCircle, XCircle, ArrowLeft, Home, 
  Save, BookmarkCheck, AlertCircle, Trash2
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface QuestionResult {
  questionId: string;
  questionText: string;
  selectedOption: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  options: { letter: string; text: string }[];
}

interface ExamResult {
  examTitle: string;
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  completedAt: string;
  answers: QuestionResult[];
}

export default function ExamResultPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { t, dir } = useLanguage();
  const examId = params.examId as string;

  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsaving, setUnsaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (!examId) return;
    fetchResult();
  }, [examId]);

  useEffect(() => {
    if (result) {
      checkIfSaved();
    }
  }, [result]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/exams/${examId}/result`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(t('examResult.notFound'));
        }
        const data = await res.json();
        throw new Error(data.error || t('examResult.fetchError'));
      }
      
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const res = await fetch('/api/student/test-result');
      if (res.ok) {
        const savedResults = await res.json();
        const isSaved = savedResults.some((r: any) => r.examId === examId);
        setSaved(isSaved);
        console.log("Check saved result:", isSaved);
      }
    } catch (error) {
      console.error("Error checking saved results:", error);
    }
  };

  const handleSaveResult = async () => {
    if (!result) return;
    
    setSaving(true);
    try {
      console.log("Saving result for exam:", examId);
      
      const res = await fetch('/api/student/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          result: {
            examTitle: result.examTitle,
            score: result.score,
            totalCorrect: result.totalCorrect,
            totalQuestions: result.totalQuestions,
            completedAt: result.completedAt,
            answers: result.answers
          }
        })
      });

      const data = await res.json();
      console.log("Save response:", data);

      if (res.ok) {
        setSaved(true);
        alert(t('examResult.saveSuccess'));
      } else {
        alert(data.error || t('examResult.saveError'));
        await checkIfSaved();
      }
    } catch (error) {
      console.error("Error saving result:", error);
      alert(t('examResult.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleUnsaveResult = async () => {
    if (!confirm(t('examResult.confirmUnsave'))) return;
    
    setUnsaving(true);
    try {
      const res = await fetch('/api/student/unsave-result', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId })
      });

      const data = await res.json();
      console.log("Unsave response:", data);

      if (res.ok) {
        setSaved(false);
        alert(t('examResult.unsaveSuccess'));
      } else {
        alert(data.error || t('examResult.unsaveError'));
        await checkIfSaved();
      }
    } catch (error) {
      console.error("Error unsaving result:", error);
      alert(t('examResult.unsaveError'));
    } finally {
      setUnsaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="text-center max-w-md mx-auto bg-red-50 p-8 rounded-xl border border-red-200">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error || t('examResult.notFound')}</p>
          <Link 
            href="/dashboard/student/exams" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t('examResult.backToExams')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* کارت نتیجه کلی */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{result.examTitle}</h1>
              <p className="text-gray-500">
                {t('examResult.date')}: {new Date(result.completedAt).toLocaleDateString(faLocale())}
              </p>
            </div>
            
            {/* دکمه‌های ذخیره/حذف نتیجه */}
            {!saved ? (
              <button
                onClick={handleSaveResult}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? t('examResult.saving') : t('examResult.saveToDashboard')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUnsaveResult}
                  disabled={unsaving}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-xl hover:bg-red-100 transition disabled:opacity-50 border border-red-200"
                >
                  {unsaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                  {unsaving ? t('examResult.removing') : t('examResult.removeFromDashboard')}
                </button>
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-xl">
                  <BookmarkCheck size={18} />
                  <span className="font-medium">{t('examResult.saved')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600 mb-1">{t('examResult.score')}</p>
              <p className="text-3xl font-bold text-blue-700">{result.score}%</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-green-600 mb-1">{t('examResult.correct')}</p>
              <p className="text-3xl font-bold text-green-700">
                {result.totalCorrect} {t('examResult.of')} {result.totalQuestions}
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-sm text-orange-600 mb-1">{t('examResult.wrong')}</p>
              <p className="text-3xl font-bold text-orange-700">
                {result.totalQuestions - result.totalCorrect}
              </p>
            </div>
          </div>
        </div>

        {/* بررسی سوالات */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('examResult.reviewAnswers')}</h2>
          
          {result.answers.map((ans, idx) => (
            <div key={ans.questionId} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex gap-3">
                <div className="mt-1">
                  {ans.isCorrect ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <XCircle size={20} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    {idx + 1}. {ans.questionText}
                  </p>
                  
                  {/* گزینه‌ها با هایلایت رنگی */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {ans.options.map((opt) => {
                      let bgColor = "bg-gray-50";
                      let textColor = "text-gray-600";
                      let borderColor = "border-gray-200";
                      let badge = null;
                      
                      if (opt.letter === ans.correctAnswer) {
                        bgColor = "bg-green-100";
                        textColor = "text-green-700";
                        borderColor = "border-green-300";
                        badge = t('examResult.correctAnswer');
                      }
                      
                      if (opt.letter === ans.selectedOption) {
                        if (opt.letter === ans.correctAnswer) {
                          badge = "✓ " + t('examResult.correctAnswer');
                        } else {
                          bgColor = "bg-red-100";
                          textColor = "text-red-700";
                          borderColor = "border-red-300";
                          badge = t('examResult.yourAnswer');
                        }
                      }
                      
                      return (
                        <div
                          key={opt.letter}
                          className={`p-3 rounded-lg border ${bgColor} ${textColor} ${borderColor}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold ml-1">{opt.letter}.</span> {opt.text}
                            </div>
                            {badge && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                opt.letter === ans.correctAnswer 
                                  ? 'bg-green-200 text-green-800' 
                                  : 'bg-red-200 text-red-800'
                              }`}>
                                {badge}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-xs text-gray-400 border-t pt-2 flex gap-4">
                    <span>{t('examResult.yourAnswer')}: <span className="font-mono font-bold">{ans.selectedOption || '—'}</span></span>
                    <span>{t('examResult.correctAnswer')}: <span className="font-mono font-bold text-green-600">{ans.correctAnswer}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* دکمه بازگشت */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard/student/exams"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            {t('examResult.backToExams')}
          </Link>
        </div>
      </main>
    </div>
  );
}

// تابع کمکی برای فرمت تاریخ بر اساس زبان
function faLocale() {
  return 'fa-IR';
}