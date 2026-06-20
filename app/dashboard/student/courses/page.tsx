"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/app/components/layout/Header";
import { CourseCard } from "@/app/components/courses/CourseCard";
import { Footer } from "@/app/components/layout/footer";


interface PublicCourse {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  language: string;
  level: string;
  price: number;
  enrolledCount: number;
}

interface EnrolledCourse {
  id: string;
  name: string;
  teacherName: string | null;
  teacherBio?: string | null;
}

export default function StudentCoursesPage() {
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    try {
      const [publicRes, enrolledRes] = await Promise.all([
        fetch("/api/student/courses?type=public"),
        fetch("/api/student/courses?type=enrolled"),
      ]);

      const publicData = await publicRes.json();
      const enrolledData = await enrolledRes.json();

      setPublicCourses(Array.isArray(publicData) ? publicData : []);
      setEnrolledCourses(Array.isArray(enrolledData) ? enrolledData : []);
    } catch {
      setError("خطا در دریافت کورس‌ها");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/student/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "ثبت‌نام ناموفق");
      }

      setSuccess("ثبت‌نام با موفقیت انجام شد!");
      await fetchData();
    } catch (e: any) {
      setError(e.message || "خطای ناشناخته");
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10" dir="ltr">
      <Header></Header>
      <div className="max-w-6xl mx-auto space-y-10">
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3">
            ✅ {success}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">کورس‌های قابل ثبت‌نام</h1>
          <p className="text-sm text-gray-500 mt-1">کورس‌هایی که می‌توانید ثبت‌نام کنید</p>
        </div>

        {publicCourses.length === 0 ? (
          <div className="text-center py-10 text-gray-400">هیچ کورسی موجود نیست</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow p-5 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-gray-500">{course.description}</p>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  <div>👨‍🏫 استاد: {course.teacherName}</div>
                  <div>🌐 زبان: {course.language}</div>
                  <div>📊 سطح: {course.level}</div>
                  <div>
                    💰 قیمت: {course.price === 0 ? (
                      <span className="text-green-600 font-medium">رایگان</span>
                    ) : (
                      `${course.price.toLocaleString()} تومان`
                    )}
                  </div>
                </div>

                {enrolledCourses.some(e => e.id === course.id) ? (
                  <Link
                    href={`/dashboard/student/courses/${course.id}`}
                    className="mt-3 w-full rounded-lg bg-green-600 text-white py-2 text-center block hover:bg-green-700"
                  >
                    ✅ ثبت‌نام شده - مشاهده محتوا
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrollingId === course.id}
                    className="mt-3 w-full rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {enrollingId === course.id ? "در حال ثبت‌نام..." : "ثبت‌نام"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-900">کورس‌های من</h2>
          <p className="text-sm text-gray-500 mt-1">کورس‌هایی که ثبت‌نام کرده‌اید</p>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-10 text-gray-400">هنوز در کورسی ثبت‌نام نکرده‌اید</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/student/courses/${course.id}`}
                className="bg-white rounded-2xl shadow p-5 space-y-2 hover:shadow-md transition block"
              >
                <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                <p className="text-sm text-gray-500">👨‍🏫 استاد: {course.teacherName}</p>
                {course.teacherBio && <p className="text-xs text-gray-400">{course.teacherBio}</p>}
                <div className="text-xs text-blue-600 font-medium mt-2">مشاهده محتوا ←</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    <Footer/>
    </div>
  );
}