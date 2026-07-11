"use client";

import { useState, useEffect } from "react";
import { Search, Filter, BookOpen, Loader2 } from "lucide-react";
import { CourseCard } from "../components/courses/CourseCard";
import { useLanguage } from "@/app/context/LanguageContext";

interface Course {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  language: string;
  level: string;
  price: number;
  promoVideoUrl?: string;
  thumbnailUrl?: string;
  enrolledCount: number;
}

export default function CoursesPage() {
  const { t, dir } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [langFilter, setLangFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        console.log("Courses data:", data);
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || 
      c.title?.toLowerCase().includes(q) || 
      c.teacherName?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q);
    const matchLevel = levelFilter === "ALL" || c.level === levelFilter;
    const matchLang = langFilter === "ALL" || c.language === langFilter;
    return matchSearch && matchLevel && matchLang;
  });

  const languages = ["ALL", ...Array.from(new Set(courses.map((c) => c.language).filter(Boolean)))];

  // ✅ نگاشت سطوح برای نمایش (استفاده از coursesPage)
  const getLevelLabel = (level: string): string => {
    const levelMap: Record<string, string> = {
      "ALL": t('coursesPage.allLevels'),
      "BEGINNER": t('coursesPage.beginner'),
      "ELEMENTARY": t('coursesPage.elementary'),
      "INTERMEDIATE": t('coursesPage.intermediate'),
      "UPPER_INTERMEDIATE": t('coursesPage.upperIntermediate'),
      "ADVANCED": t('coursesPage.advanced'),
    };
    return levelMap[level] || level;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]" dir={dir}>
      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-14">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{t('coursesPage.title')}</h1>
          <p className="text-blue-100 text-base mb-8 max-w-xl mx-auto">
            {t('coursesPage.subtitle')}
          </p>

          <div className="max-w-lg mx-auto relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('coursesPage.searchPlaceholder')}
              className="w-full pr-10 pl-4 py-3 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Filter size={14} /> {t('coursesPage.filter')}:
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", "BEGINNER", "ELEMENTARY", "INTERMEDIATE", "UPPER_INTERMEDIATE", "ADVANCED"].map((l) => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  levelFilter === l 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
                }`}
              >
                {getLevelLabel(l)}
              </button>
            ))}
          </div>

          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white focus:outline-none mr-auto"
          >
            {languages.map((l) => (
              <option key={l} value={l}>{l === "ALL" ? t('coursesPage.allLanguages') : l}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          {t('coursesPage.showing')} <strong className="text-gray-700">{filtered.length}</strong> {t('coursesPage.courses')}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">{t('coursesPage.noCoursesFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} variant="public" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}