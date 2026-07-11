"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { 
  ArrowLeft, Save, Trash2, Plus, Eye, EyeOff, Loader2,
  Home, LayoutDashboard, BookOpen, LogOut, User, GraduationCap,
  Video, FileText, Type, AlertCircle
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type Content = {
  id: string;
  title: string;
  type: "VIDEO" | "FILE" | "TEXT";
  url: string | null;
  text: string | null;
  order: number;
  isFree: boolean;
};

type Course = {
  id: string;
  title: string;
  description: string | null;
  language: string;
  level: string;
  price: number;
  isPublished: boolean;
  promoVideoUrl?: string | null;
  thumbnailUrl?: string | null;
};

export default function ManageCoursePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { t, dir } = useLanguage();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    type: "VIDEO" as "VIDEO" | "FILE" | "TEXT",
    url: "",
    text: "",
    order: 0,
    isFree: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "TEACHER") {
      router.push("/dashboard/student");
      return;
    }
  }, [status, session, router]);

  const loadData = async () => {
    setError(null);
    try {
      const [courseRes, contentsRes] = await Promise.all([
        fetch(`/api/teacher/courses/${courseId}`),
        fetch(`/api/teacher/courses/${courseId}/contents`),
      ]);

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourse(courseData);
      } else {
        const errorData = await courseRes.json();
        setError(errorData.error || t('course.loadError'));
      }

      if (contentsRes.ok) {
        const contentsData = await contentsRes.json();
        setContents(Array.isArray(contentsData) ? contentsData : []);
      }
    } catch (err) {
      setError(t('course.loadError'));
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && status === "authenticated") {
      loadData();
    }
  }, [courseId, status]);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      alert(t('course.titleRequired'));
      return;
    }

    if (form.type === "VIDEO" || form.type === "FILE") {
      if (!form.url.trim()) {
        alert(t('course.urlRequired'));
        return;
      }
    }

    if (form.type === "TEXT") {
      if (!form.text.trim()) {
        alert(t('course.textRequired'));
        return;
      }
    }

    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/contents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", type: "VIDEO", url: "", text: "", order: 0, isFree: false });
        loadData();
        alert(t('course.contentAdded'));
      } else {
        alert(data.error || t('course.contentAddError'));
      }
    } catch {
      alert(t('course.contentAddError'));
    }
  };

  // ✅ FIXED: Delete content by sending contentId in the request body
  const handleDeleteContent = async (id: string) => {
    if (!confirm(t('course.confirmDeleteContent'))) return;

    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/contents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: id }),
      });

      if (res.ok) {
        loadData();
        alert(t('course.contentDeleted') || 'محتوا با موفقیت حذف شد');
      } else {
        const data = await res.json();
        alert(data.error || t('course.contentDeleteError'));
      }
    } catch {
      alert(t('course.contentDeleteError'));
    }
  };

  const handlePublish = async () => {
    if (!course) return;

    setPublishing(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });

      const data = await res.json();

      if (res.ok) {
        setCourse(prev => prev ? { ...prev, isPublished: data.isPublished } : prev);
        alert(data.message || t('course.publishStatusChanged'));
      } else {
        alert(data.error || t('course.publishError'));
      }
    } catch {
      alert(t('course.publishError'));
    } finally {
      setPublishing(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!course) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          language: course.language,
          level: course.level,
          price: course.price,
          promoVideoUrl: course.promoVideoUrl,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(t('course.changesSaved'));
      } else {
        alert(data.error || t('course.saveError'));
      }
    } catch {
      alert(t('course.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    
    if (!confirm(t('course.confirmDeleteCourse'))) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();
      console.log("Delete response text:", text);
      
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: t('course.invalidResponse') };
      }
      
      if (res.ok) {
        alert(t('course.courseDeleted'));
        router.push("/dashboard/teacher");
      } else {
        alert(`${t('course.deleteError')}: ${data.error || t('course.unknownError')}`);
      }
    } catch (error) {
      console.error("Network error in delete:", error);
      alert(t('course.networkError'));
    } finally {
      setDeleting(false);
    }
  };

  const userName = session?.user?.name ?? t('course.teacher');
  const userAvatar = (session?.user as any)?.image ?? null;

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

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200 max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error || t('course.notFound')}</p>
          <Link
            href="/dashboard/teacher"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {t('course.backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={dir}>
      {/* هدر */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="font-bold text-blue-600 text-lg">LinguaTest</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/" className="flex items-center gap-1.5 hover:text-blue-600 transition">
                <Home size={15} /> {t('home')}
              </Link>
              <Link href="/dashboard/teacher" className="flex items-center gap-1.5 hover:text-blue-600 transition">
                <LayoutDashboard size={15} /> {t('dashboard')}
              </Link>
              <Link href="/courses" className="flex items-center gap-1.5 hover:text-blue-600 transition">
                <BookOpen size={15} /> {t('courses')}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {userAvatar ? (
                  <img src={userAvatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <span className="text-sm text-gray-700 font-medium hidden sm:block">{userName}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-50"
              title={t('logout')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6 py-2 text-xs text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-blue-600">{t('home')}</Link>
            <span>›</span>
            <Link href="/dashboard/teacher" className="hover:text-blue-600">{t('dashboard')}</Link>
            <span>›</span>
            <Link href={`/courses/${courseId}`} className="hover:text-blue-600">{course.title}</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">{t('course.manage')}</span>
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <Link 
            href="/dashboard/teacher" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} />
            {t('course.backToDashboard')}
          </Link>
        </div>

        {/* اطلاعات کورس */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">{t('course.courseInfo')}</h2>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                course.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {course.isPublished ? t('course.published') : t('course.draft')}
              </span>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  course.isPublished 
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200" 
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                } disabled:opacity-50`}
              >
                {course.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                {publishing ? "..." : course.isPublished ? t('course.unpublish') : t('course.publish')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('course.title')}</label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('course.language')}</label>
              <input
                type="text"
                value={course.language}
                onChange={(e) => setCourse({ ...course, language: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('course.level')}</label>
              <select
                value={course.level}
                onChange={(e) => setCourse({ ...course, level: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BEGINNER">{t('course.beginner')}</option>
                <option value="INTERMEDIATE">{t('course.intermediate')}</option>
                <option value="ADVANCED">{t('course.advanced')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('course.price')}</label>
              <input
                type="number"
                value={course.price}
                onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('course.description')}</label>
              <textarea
                value={course.description || ""}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('course.promoVideo')}</label>
              <input
                type="text"
                value={course.promoVideoUrl || ""}
                onChange={(e) => setCourse({ ...course, promoVideoUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="C:/MyVideos/video.mp4"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleUpdateCourse}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? t('course.saving') : t('course.saveChanges')}
            </button>
            <button
              onClick={handleDeleteCourse}
              disabled={deleting}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? t('course.deleting') : t('course.deleteCourse')}
            </button>
          </div>
        </div>

        {/* فرم افزودن محتوای جدید */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={18} /> {t('course.addContent')}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('course.contentTitle')}
              className="border rounded-lg px-4 py-2"
            />

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "VIDEO" | "FILE" | "TEXT" })}
              className="border rounded-lg px-4 py-2"
            >
              <option value="VIDEO">🎥 {t('course.video')}</option>
              <option value="FILE">📄 {t('course.file')}</option>
              <option value="TEXT">📝 {t('course.text')}</option>
            </select>

            {form.type !== "TEXT" && (
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="C:/MyVideos/video.mp4"
                className="border rounded-lg px-4 py-2"
              />
            )}

            {form.type === "TEXT" && (
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder={t('course.textContent')}
                rows={4}
                className="border rounded-lg px-4 py-2"
              />
            )}

            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              placeholder={t('course.order')}
              className="border rounded-lg px-4 py-2"
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
              />
              <span>{t('course.makeFree')}</span>
            </label>

            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {t('course.addContent')}
            </button>
          </div>
        </div>

        {/* لیست محتواها */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('course.contentList')} ({contents.length})</h2>

          {contents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">{t('course.noContent')}</p>
          ) : (
            <div className="space-y-3">
              {contents.sort((a, b) => a.order - b.order).map((c) => (
                <div key={c.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-sm text-gray-500 mt-1 flex gap-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                          {c.type === "VIDEO" ? <Video size={14} /> : c.type === "FILE" ? <FileText size={14} /> : <Type size={14} />}
                          {c.type === "VIDEO" ? ` ${t('course.video')}` : c.type === "FILE" ? ` ${t('course.file')}` : ` ${t('course.text')}`}
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{t('course.order')}: {c.order}</span>
                        <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                          c.isFree ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {c.isFree ? "🔓 " + t('course.free') : "🔒 " + t('course.locked')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteContent(c.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      {t('course.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* فوتر */}
      <footer className="border-t border-gray-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-400">
          LinguaTest Pro © 2026 - {t('course.languageLearningPlatform')}
        </div>
      </footer>
    </div>
  );
}