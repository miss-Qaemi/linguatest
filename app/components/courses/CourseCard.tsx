// components/courses/CourseCard.tsx
"use client";

import Link from "next/link";
import { BookOpen, Users, Globe, Star, ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface CourseCardProps {
  course: {
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
    rating?: number;
  };
  variant?: "public" | "enrolled";
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  ELEMENTARY: "bg-teal-100 text-teal-700",
  INTERMEDIATE: "bg-blue-100 text-blue-700",
  UPPER_INTERMEDIATE: "bg-purple-100 text-purple-700",
  ADVANCED: "bg-orange-100 text-orange-700",
};

export function CourseCard({ course, variant = "public" }: CourseCardProps) {
  const { t } = useLanguage();
  
  const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: t('course.beginner'),
    ELEMENTARY: t('course.elementary'),
    INTERMEDIATE: t('course.intermediate'),
    UPPER_INTERMEDIATE: t('course.upperIntermediate'),
    ADVANCED: t('course.advanced'),
  };

  const href = variant === "public" 
    ? `/courses/${course.id}`
    : `/dashboard/student/courses/${course.id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={href} className="block">
        <div className="relative w-full h-44 bg-gradient-to-br from-blue-100 to-purple-100">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen size={36} className="text-blue-300" />
            </div>
          )}

          <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold ${LEVEL_COLORS[course.level] ?? "bg-gray-100 text-gray-600"}`}>
            {LEVEL_LABELS[course.level] ?? course.level}
          </span>

          <span className="absolute top-3 right-3 bg-white/90 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {course.price === 0 ? t('course.free') : `${course.price.toLocaleString()} ${t('course.toman')}`}
          </span>
        </div>
      </Link>

      <div className="p-5">
        <Link href={href}>
          <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 leading-snug hover:text-blue-600 transition">
            {course.title}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {course.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">
            {course.teacherName?.[0]?.toUpperCase()}
          </div>
          <span className="text-xs text-gray-600">{course.teacherName}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Globe size={11} /> {course.language}</span>
          <span className="flex items-center gap-1"><Users size={11} /> {course.enrolledCount} {t('course.students')}</span>
          {course.rating && (
            <span className="flex items-center gap-1">
              <Star size={11} className="text-yellow-400 fill-yellow-400" /> {course.rating.toFixed(1)}
            </span>
          )}
        </div>

        <Link
          href={href}
          className="flex items-center justify-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition"
        >
          {variant === "public" ? t('course.viewCourse') : t('course.enterCourse')} <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}