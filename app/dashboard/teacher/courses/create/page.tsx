"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export default function CreateCoursePage() {
  const router = useRouter();
  const { t, dir } = useLanguage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("English");
  const [level, setLevel] = useState<Level>("BEGINNER");
  const [price, setPrice] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(false);
  const [promoVideoUrl, setPromoVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [materials, setMaterials] = useState("");
  const [autoEnroll, setAutoEnroll] = useState(true);
  const [manualStudentIds, setManualStudentIds] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // آپلود ویدئو
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch("/api/teacher/upload-video", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (res.ok) {
        const data = await res.json();
        setPromoVideoUrl(data.videoUrl);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        const data = await res.json();
        setError(data.error || t('course.uploadError'));
      }
    } catch {
      setError(t('course.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError(t('course.titleRequired'));
      return;
    }
    if (!description.trim()) {
      setError(t('course.descriptionRequired'));
      return;
    }

    const manualIdsArray = manualStudentIds.split(",").map(id => id.trim()).filter(Boolean);
    const materialsArray = materials.split("\n").map(m => m.trim()).filter(Boolean);

    try {
      setLoading(true);
      const res = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          language,
          level,
          price,
          isPublished,
          promoVideoUrl: promoVideoUrl.trim() || null,
          thumbnailUrl: thumbnailUrl.trim() || null,
          materials: materialsArray,
          autoEnroll,
          manualStudentIds: autoEnroll ? [] : manualIdsArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || t('course.createError'));
      }

      setSuccess(t('course.createSuccess'));
      
      const goToManage = confirm(
        `${t('course.createSuccess')}\n\n` +
        `${t('course.goToManage')}\n` +
        `${t('course.cancelToGoToList')}`
      );
      
      if (goToManage) {
        router.push(`/dashboard/teacher/courses/${data.id}/manage`);
      } else {
        router.push('/dashboard/teacher');
      }
      
    } catch (e: any) {
      setError(e.message || t('course.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10" dir={dir}>
      <div className="mx-auto w-full max-w-5xl">
        {/* هدر با دکمه بازگشت */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/dashboard/teacher" 
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft size={18} />
            <span>{t('course.backToDashboard')}</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t('course.createNewCourse')}</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* پیام‌های خطا و موفقیت */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* فرم اطلاعات اصلی */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">{t('course.courseInfo')}</h2>
            <p className="mt-1 text-xs text-gray-500">{t('course.courseInfoDesc')}</p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('course.title')}</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('course.titlePlaceholder')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('course.language')}</label>
                <input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('course.languagePlaceholder')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('course.level')}</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BEGINNER">{t('course.beginner')}</option>
                  <option value="INTERMEDIATE">{t('course.intermediate')}</option>
                  <option value="ADVANCED">{t('course.advanced')}</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('course.price')}</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('course.description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('course.descriptionPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* بخش ویدئوی معرفی */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">{t('course.promoVideo')}</h2>
            <p className="mt-1 text-xs text-gray-500">{t('course.promoVideoDesc')}</p>

            <div className="mt-4">
              {!promoVideoUrl ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="video-upload"
                    className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${
                      uploading ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Upload size={32} className="text-blue-500 mb-2 animate-pulse" />
                        <p className="text-sm text-blue-600">{t('course.uploading')} {uploadProgress}%</p>
                        <div className="w-64 h-2 bg-gray-200 rounded-full mt-2">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">{t('course.clickToUpload')}</p>
                        <p className="text-xs text-gray-400 mt-1">{t('course.videoRequirements')}</p>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">🎬</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('course.videoUploaded')}</p>
                      <p className="text-xs text-gray-500">{promoVideoUrl.split("/").pop()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPromoVideoUrl("")}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">{t('course.orEnterLink')}</p>
              <input
                value={promoVideoUrl}
                onChange={(e) => setPromoVideoUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>

          {/* تنظیمات انتشار و محتوا */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">{t('course.publishSettings')}</h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('course.thumbnailUrl')}</label>
                <input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('course.thumbnailPlaceholder')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('course.materials')}</label>
                <textarea
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('course.materialsPlaceholder')}
                />
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-sm text-gray-700">{t('course.publishCourse')}</div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={autoEnroll}
                  onChange={(e) => setAutoEnroll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-sm text-gray-700">{t('course.autoEnroll')}</div>
              </div>

              {!autoEnroll && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t('course.studentIds')}</label>
                  <input
                    value={manualStudentIds}
                    onChange={(e) => setManualStudentIds(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('course.studentIdsPlaceholder')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* دکمه‌های ثبت */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
              disabled={loading}
            >
              {t('course.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚪</span>
                  {t('course.saving')}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {t('course.saveCourse')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}