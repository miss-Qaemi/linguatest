"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type Content = {
  id: string;
  title: string;
  type: "VIDEO" | "FILE" | "TEXT";
  url: string | null;
  text: string | null;
  isFree: boolean;
  locked: boolean;
  order: number;
};

export default function StudentCourseContentPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { t, dir } = useLanguage();
  const courseId = params.courseId as string;

  const [contents, setContents] = useState<Content[]>([]);
  const [course, setCourse] = useState<{ id: string; title: string; description: string | null } | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "STUDENT") {
      router.push("/dashboard/teacher");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (!courseId || status !== "authenticated") return;
    fetchContent();
  }, [courseId, status]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Fetching content for course:", courseId);
      
      const res = await fetch(`/api/student/courses/${courseId}`);

      console.log("Response status:", res.status);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t('course.contentError'));
        return;
      }

      const data = await res.json();
      console.log("Content data:", data);
      
      setContents(data.contents || []);
      setIsPaid(data.isPaid || false);
      setCourse(data.course);
      
    } catch (err) {
      console.error("Fetch error:", err);
      setError(t('course.connectionError'));
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="text-center max-w-md mx-auto bg-red-50 p-8 rounded-xl border border-red-200">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <Link href="/dashboard/student/courses" className="text-blue-500 hover:underline">
            {t('course.backToMyCourses')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={dir}>
      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <Link href="/dashboard/student/courses" className="text-blue-500 hover:underline text-sm">
            ← {t('course.backToMyCourses')}
          </Link>
        </div>

        {course && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
            {course.description && <p className="text-gray-500 mt-2">{course.description}</p>}
          </div>
        )}

        {!isPaid && course?.title && (
          <div className="mb-6 p-4 border border-yellow-300 rounded-lg bg-yellow-50">
            <p className="text-yellow-800 font-medium">⚠️ {t('course.paymentRequired')}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('course.courseContent')} ({contents.length} {t('course.items')})</h2>

          {contents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">{t('course.noContentYet')}</p>
          ) : (
            <div className="space-y-3">
              {contents.sort((a, b) => a.order - b.order).map((c, index) => (
                <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-400 text-sm">{index + 1}</span>
                    <span className="text-lg">{c.type === "VIDEO" ? "🎥" : c.type === "FILE" ? "📄" : "📝"}</span>
                    <span className="font-semibold text-gray-700">{c.title}</span>
                    {c.isFree && (
                      <span className="mr-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{t('course.free')}</span>
                    )}
                  </div>

                  {c.locked ? (
                    <div className="text-red-500 text-sm flex items-center gap-2 mt-2">
                      🔒 {t('course.lockedPaymentRequired')}
                    </div>
                  ) : c.type === "VIDEO" && c.url ? (
                    <video 
                      src={c.url} 
                      controls 
                      className="w-full mt-3 rounded-lg bg-black"
                      onError={(e) => {
                        console.error("❌ Video loading error:", c.url);
                        console.error("Event:", e);
                      }}
                      onLoadStart={() => console.log("✅ Video loading started:", c.url)}
                    />
                  ) : c.type === "FILE" && c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm mt-2 block hover:text-blue-800">
                      📥 {t('course.downloadFile')}
                    </a>
                  ) : c.type === "TEXT" && c.text ? (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {c.text}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* فوتر حذف شد - از layout اصلی می‌آید */}
    </div>
  );
}
