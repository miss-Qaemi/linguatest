"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Award, Home, BookOpen, LayoutDashboard, CheckCircle } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function PlacementResultPage() {
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();
  const level = searchParams.get("level") || "A1";
  const score = searchParams.get("score") || "0";
  const correctCount = searchParams.get("correctCount") || "0";
  const totalQuestions = searchParams.get("totalQuestions") || "30";

  const levelDescriptions: Record<string, { title: string; desc: string; color: string }> = {
    A1: {
      title: t('level.A1.title'),
      desc: t('level.A1.desc'),
      color: "bg-green-100 text-green-700"
    },
    A2: {
      title: t('level.A2.title'),
      desc: t('level.A2.desc'),
      color: "bg-blue-100 text-blue-700"
    },
    B1: {
      title: t('level.B1.title'),
      desc: t('level.B1.desc'),
      color: "bg-purple-100 text-purple-700"
    },
    B2: {
      title: t('level.B2.title'),
      desc: t('level.B2.desc'),
      color: "bg-orange-100 text-orange-700"
    },
    C1: {
      title: t('level.C1.title'),
      desc: t('level.C1.desc'),
      color: "bg-red-100 text-red-700"
    },
    C2: {
      title: t('level.C2.title'),
      desc: t('level.C2.desc'),
      color: "bg-gray-900 text-white"
    }
  };

  const levelData = levelDescriptions[level as keyof typeof levelDescriptions] || levelDescriptions.A1;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={dir}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={40} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('placementResult.title')}
          </h1>

          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <CheckCircle size={18} />
              <span className="text-sm">{t('placementResult.correctAnswers')}: {correctCount} {t('placementResult.of')} {totalQuestions}</span>
            </div>
          </div>

          <div className="my-6">
            <div className={`text-5xl font-bold ${levelData.color} mb-2 p-4 rounded-xl`}>
              {level}
            </div>
            <p className="text-gray-500 mt-2">{t('placementResult.yourLevel')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('placementResult.score')}: {score}%</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">{levelData.title}</h3>
            <p className="text-blue-700 text-sm">
              {levelData.desc}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/courses"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              <BookOpen size={18} />
              {t('placementResult.viewCourses')}
            </Link>
            
            <Link
              href="/dashboard/student"
              className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              <LayoutDashboard size={18} />
              {t('placementResult.goToDashboard')}
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full text-gray-500 py-2 hover:text-blue-600 transition"
            >
              <Home size={16} />
              {t('placementResult.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}