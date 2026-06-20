"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Clock, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

interface Question {
  id: string;
  questionText: string;
  options: { letter: string; text: string }[];
  type: string;
}

interface ExamData {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  audioUrl: string | null;
  passageText: string | null;
  questions: Question[];
}

interface ExamSession {
  attemptId: string;
  sessionId: string;
  exam: ExamData;
}

export default function TakeExamPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { t, dir } = useLanguage();
  const examId = params.examId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!examId) return;
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/exams/${examId}?action=start`);
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('exam.loadError'));
      }

      const data = await res.json();
      setExamSession(data);
      setTimeLeft(data.exam.duration * 60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, selectedOption: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    saveProgress(questionId, selectedOption);
  };

  const saveProgress = async (questionId: string, selectedOption: string) => {
    if (!examSession) return;

    try {
      await fetch(`/api/student/exams/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          attemptId: examSession.attemptId,
          answers: { [questionId]: selectedOption },
        }),
      });
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const handleSubmit = async () => {
    if (!examSession) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/exams/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          attemptId: examSession.attemptId,
          answers,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/dashboard/student/exams/${examId}/results?score=${data.score}`);
      } else {
        alert(data.error || t('exam.submitError'));
      }
    } catch (error) {
      alert(t('exam.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!examSession) return;
    
    alert(t('exam.timeExpired'));
    await handleSubmit();
  };

  const goToNextQuestion = () => {
    if (examSession && currentQuestionIndex < examSession.exam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !examSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="text-center max-w-md mx-auto bg-red-50 p-8 rounded-xl border border-red-200">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error || t('exam.notFound')}</p>
          <Link
            href="/dashboard/student/exams"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t('exam.backToExams')}
          </Link>
        </div>
      </div>
    );
  }

  const { exam } = examSession;
  const currentQuestion = exam.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* هدر با تایمر و پیشرفت */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900 truncate">{exam.title}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {answeredCount} {t('exam.of')} {totalQuestions} {t('exam.answered')}
              </span>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                <Clock size={16} />
                <span className="font-mono font-bold">{formatTime(timeLeft!)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('exam.progress')}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {exam.audioUrl && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('exam.audioFile')}</h2>
            <audio controls src={exam.audioUrl} className="w-full" />
          </div>
        )}

        {exam.passageText && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('exam.readingText')}</h2>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
              {exam.passageText}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <span className="text-sm text-blue-600 font-medium">
              {t('exam.question')} {currentQuestionIndex + 1} {t('exam.of')} {totalQuestions}
            </span>
            <h2 className="text-lg font-semibold text-gray-800 mt-2">
              {currentQuestion.questionText}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.letter}
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  answers[currentQuestion.id] === option.letter
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.letter}
                  checked={answers[currentQuestion.id] === option.letter}
                  onChange={() => handleAnswerChange(currentQuestion.id, option.letter)}
                  className="ml-3 w-4 h-4 text-blue-600"
                />
                <div>
                  <span className="font-bold ml-2">{option.letter}.</span>
                  <span className="text-gray-700">{option.text}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={goToPrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={18} />
            {t('exam.previous')}
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? t('exam.submitting') : t('exam.finishExam')}
          </button>

          <button
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {t('exam.next')}
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => alert(t('exam.tempSaved'))}
            className="text-sm text-gray-400 hover:text-blue-600 transition"
          >
            💾 {t('exam.tempSave')}
          </button>
        </div>
      </main>
    </div>
  );
}