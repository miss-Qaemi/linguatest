'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Users, Globe, Star } from "lucide-react";
import { DailyTip } from "./DailyTip";
import { useLanguage } from "@/app/context/LanguageContext";

interface Course {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  language: string;
  level: string;
  price: number;
  thumbnailUrl: string | null;
  enrolledCount: number;
  avatarLetter: string;
}

export function HomePageContent({ courses }: { courses: Course[] }) {
  const { t, dir, language } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  // ✅ برای جلوگیری از Hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ تابع فرمت قیمت با هماهنگی سرور و کلاینت
  const formatPrice = (price: number) => {
    if (!isMounted) {
      // در سرور: از فرمت انگلیسی استفاده کن
      return price.toLocaleString('en-US');
    }
    // در کلاینت: بر اساس زبان کاربر
    const locales: Record<string, string> = {
      fa: 'fa-IR',
      en: 'en-US',
      de: 'de-DE',
    };
    return price.toLocaleString(locales[language] || 'en-US');
  };

  return (
    <div dir={dir}>
      {/* Hero Section */}
      <section className="bg-blue-50 mx-6 mt-4 rounded-2xl px-12 py-16 flex items-center justify-between flex-wrap">
        <div className="max-w-lg">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {t('home.hero.title')}
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/placement-test"
              className="bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              {t('home.hero.startPlacement')}
            </Link>
            <Link
              href="/register"
              className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {t('home.hero.createAccount')}
            </Link>
            <Link
              href="/login"
              className="text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors px-2"
            >
              {t('home.hero.login')}
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
          {t('home.examCategories.title')}
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "📝",
              key: "grammar",
              title: t('home.examCategories.grammar.title'),
              desc: t('home.examCategories.grammar.desc'),
            },
            {
              icon: "🎧",
              key: "listening",
              title: t('home.examCategories.listening.title'),
              desc: t('home.examCategories.listening.desc'),
            },
            {
              icon: "📚",
              key: "reading",
              title: t('home.examCategories.reading.title'),
              desc: t('home.examCategories.reading.desc'),
            },
          ].map((cat) => (
            <div
              key={cat.key}
              className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-sm"
            >
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-3">{cat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{cat.desc}</p>
              <Link
                href="/dashboard/student/exams"
                className="bg-blue-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('home.examCategories.startTest')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-3">
            {t('home.popularCourses.title')}
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            {t('home.popularCourses.subtitle')}
          </p>

          {courses.length === 0 ? (
            <p className="text-center text-gray-400">{t('home.popularCourses.noCourses')}</p>
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
                      {course.price === 0 
                        ? t('course.free') 
                        : `${formatPrice(course.price)} ${t('course.toman')}`
                      }
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {course.avatarLetter}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{course.title}</h3>
                        <p className="text-gray-500 text-xs">{t('home.popularCourses.by')} {course.teacherName}</p>
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
                        <Users size={12} /> {course.enrolledCount} {t('course.students')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" /> {course.level}
                      </span>
                    </div>

                    <Link
                      href={`/courses/${course.id}`}
                      className="block w-full text-center border border-blue-500 text-blue-600 text-sm py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {t('home.popularCourses.viewCourse')}
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
              {t('home.popularCourses.seeAll')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}