"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Loader2, Trash2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export function DailyTip() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, language, dir } = useLanguage();
  const [tip, setTip] = useState<{ id?: string; content: string; date: string; isSaved: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ وقتی زبان تغییر کرد، دوباره از API بخوان
  useEffect(() => {
    fetchTip();
  }, [language]);

  const fetchTip = async () => {
    try {
      setLoading(true);
      // ✅ زبان را به API ارسال کن
      const res = await fetch(`/api/daily-tip?lang=${language}`);
      const data = await res.json();
      
      setTip({
        id: data?.id,
        content: data?.content || "No tip available",
        date: data?.date || new Date().toISOString(),
        isSaved: data?.isSaved || false,
      });
    } catch (error) {
      console.error("Error fetching tip:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!tip) return;

    setSaving(true);
    try {
      const res = await fetch('/api/daily-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: tip.content,
          date: tip.date,
          lang: language  // ✅ زبان را هم ارسال کن
        })
      });

      if (res.ok) {
        setTip(prev => prev ? { ...prev, isSaved: true } : null);
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!tip?.id) {
      alert(t('dailyTip.cannotDelete'));
      return;
    }

    if (!confirm(t('dailyTip.confirmDelete'))) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/daily-tip/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipId: tip.id })
      });

      if (res.ok) {
        setTip(prev => prev ? { ...prev, isSaved: false } : null);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setDeleting(false);
    }
  };

  // ✅ فرمت تاریخ بر اساس زبان
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const locales: Record<string, string> = {
        fa: 'fa-IR',
        en: 'en-US',
        de: 'de-DE',
      };
      
      return date.toLocaleDateString(locales[language] || 'fa-IR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!tip) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6" dir={dir}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📖</span>
            <h3 className="font-semibold text-gray-900">{t('dailyTip.title')}</h3>
          </div>
          <p className="text-xs text-gray-400 mb-2">{formatDate(tip.date)}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
        </div>
        
        {tip.isSaved && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-400 hover:text-red-500 transition ml-2"
            title={t('dailyTip.deleteTip')}
          >
            {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        )}
      </div>

      <div className="flex items-center mt-4">
        <button
          onClick={handleSave}
          disabled={saving || tip.isSaved}
          className={`border px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
            tip.isSaved
              ? 'bg-green-50 border-green-300 text-green-700 cursor-default'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : tip.isSaved ? (
            <BookmarkCheck size={14} />
          ) : (
            <Bookmark size={14} />
          )}
          {tip.isSaved ? t('dailyTip.saved') : t('dailyTip.saveTip')}
        </button>
      </div>
    </div>
  );
}