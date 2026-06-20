// app/dashboard/student/notes/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function NewNotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/student/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        router.push("/dashboard/student/notes");
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={dir}>
      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('notes.newNote')}</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes.titleOptional')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('notes.titlePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes.noteContent')}</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('notes.contentPlaceholder')}
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? t('notes.saving') : t('notes.save')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
            >
              {t('notes.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}