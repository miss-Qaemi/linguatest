"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight, ChevronLeft, Clock, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface Question {
  id: string;
  questionText: string;
  options: { letter: string; text: string }[];
  correctAnswer: string;
  level: string;
}

export default function PlacementTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, dir } = useLanguage();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/placement-test/questions');
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!session) {
      router.push('/login?redirect=/placement-test/result');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/placement-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      const data = await res.json();
      
      if (res.ok) {
        router.push(
          `/placement-test/result?level=${data.level}&score=${data.score}&correctCount=${data.correctCount}&totalQuestions=${data.totalQuestions}`
        );
      } else {
        alert(data.error || t('placement.submitError'));
      }
    } catch (error) {
      alert(t('placement.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">{t('placement.title')}</h1>
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg">
            <Clock size={18} />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{t('placement.question')} {currentIndex + 1} {t('placement.of')} {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {currentQuestion && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="mb-2 text-sm text-blue-600 font-medium">
              {t('placement.level')}: {currentQuestion.level}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.questionText}
            </h2>

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
                    onChange={() => handleAnswer(currentQuestion.id, option.letter)}
                    className="ml-3 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={18} />
                {t('placement.previous')}
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? t('placement.submitting') : t('placement.finish')}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  {t('placement.next')}
                  <ChevronLeft size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}