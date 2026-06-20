"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";

interface Content {
  id: string;
  title: string;
  type: string;
  order: number;
  isFree?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  level?: string;
  language?: string;
  price?: number;
  isPublished: boolean;
  createdAt: string;
  teacher: { id: string; name: string | null; email: string };
  contents: Content[];
  _count?: { enrollments: number };
}

export default function CourseDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { t, dir } = useLanguage();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnroll, setCheckingEnroll] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (session && course) {
      checkEnrollment();
    }
  }, [session, course]);

  const fetchCourse = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(t('course.courseNotFound'));
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || t('course.fetchError'));
        }
      }
      
      const data = await res.json();
      setCourse(data);
      
    } catch (err: any) {
      console.error("Error fetching course:", err);
      setError(err.message || t('course.courseNotFound'));
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!session) return;
    
    setCheckingEnroll(true);
    try {
      const res = await fetch("/api/student/courses?type=enrolled");
      if (res.ok) {
        const data = await res.json();
        const isEnrolled = data.some((e: any) => e.id === courseId);
        setEnrolled(isEnrolled);
      }
    } catch (err) {
      console.error("Error checking enrollment:", err);
    } finally {
      setCheckingEnroll(false);
    }
  };

  const handleEnroll = async () => {
    if (!session) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch("/api/student/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        setEnrolled(true);
        alert(t('course.enrollSuccess'));
      } else {
        const data = await res.json();
        alert(data.error || t('course.enrollError'));
      }
    } catch {
      alert(t('course.enrollError'));
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 bg-red-50 p-8 rounded-xl border border-red-200">
          <div className="text-red-500 text-6xl mb-4">😕</div>
          <p className="text-red-500 text-xl mb-4">{error || t('course.courseNotFound')}</p>
          <p className="text-gray-500 text-sm mb-6">{t('course.courseId')}: {courseId}</p>
          <Link 
            href="/courses" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {t('course.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>

          {course.description && (
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">{course.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="bg-blue-50 px-3 py-1.5 rounded-full">👨‍🏫 {course.teacher?.name || course.teacher?.email}</span>
            <span className="bg-gray-50 px-3 py-1.5 rounded-full">📅 {new Date(course.createdAt).toLocaleDateString(faIRLocale())}</span>
            <span className="bg-gray-50 px-3 py-1.5 rounded-full">📚 {course.contents?.length ?? 0} {t('course.contents')}</span>
            {course._count && (
              <span className="bg-gray-50 px-3 py-1.5 rounded-full">👥 {course._count.enrollments} {t('course.students')}</span>
            )}
          </div>

          {course.price !== undefined && (
            <div className="mb-6">
              <span className={`text-lg font-bold px-4 py-2 rounded-lg ${
                course.price === 0 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}>
                {course.price === 0 ? `🎁 ${t('course.free')}` : `💰 ${course.price.toLocaleString()} ${t('course.toman')}`}
              </span>
            </div>
          )}

          {checkingEnroll ? (
            <div className="text-gray-400 text-sm">{t('course.checkingEnrollment')}</div>
          ) : enrolled ? (
            <div className="flex gap-4 flex-wrap">
              <span className="bg-green-100 text-green-700 px-6 py-3 rounded-lg font-medium">
                ✅ {t('course.enrolled')}
              </span>
              <Link
                href={`/dashboard/student/courses/${courseId}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {t('course.viewContent')} →
              </Link>
            </div>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrolling ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {t('course.enrolling')}
                </span>
              ) : (
                `${t('course.enrollInCourse')} 🚀`
              )}
            </button>
          )}
        </div>

        {course.contents && course.contents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📋</span> {t('course.courseSyllabus')}
            </h2>
            <div className="space-y-3">
              {course.contents.sort((a, b) => a.order - b.order).map((content, index) => (
                <div key={content.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <span className="text-gray-400 text-sm w-6 text-center">{index + 1}</span>
                  <span className="text-xl">
                    {content.type === "VIDEO" ? "🎥" : content.type === "FILE" ? "📄" : "📝"}
                  </span>
                  <span className="text-gray-700 flex-1 font-medium">{content.title}</span>
                  {content.isFree ? (
                    <span className="text-xs text-green-600 bg-green-100 px-3 py-1.5 rounded-full font-medium">
                      🔓 {t('course.free')}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1.5 rounded-full font-medium">
                      🔒 {t('course.enrollRequired')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// تابع کمکی برای فرمت تاریخ بر اساس زبان
function faIRLocale() {
  // می‌توانید بر اساس زبان کاربر تاریخ را فرمت کنید
  return 'fa-IR';
}