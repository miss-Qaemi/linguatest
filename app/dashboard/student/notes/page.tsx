"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Clock, Edit2, Save, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/student/notes");
      if (res.ok) setNotes(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('notes.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/student/notes/${id}`, { method: "DELETE" });
      if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditForm({ title: note.title, content: note.content });
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/student/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, ...editForm } : n))
        );
        setEditingId(null);
      }
    } catch {}
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ title: "", content: "" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">{t('loading')}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={dir}>
      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('notes.myNotes')}</h1>
          <Link
            href="/dashboard/student/notes/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> {t('notes.newNote')}
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <p className="text-gray-400">{t('notes.noNotes')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                {editingId === note.id ? (
                  // حالت ویرایش
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('notes.titlePlaceholder')}
                    />
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('notes.contentPlaceholder')}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(note.id)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
                      >
                        <Save size={14} /> {t('notes.save')}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300"
                      >
                        <X size={14} /> {t('notes.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  // حالت نمایش
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{note.title || t('notes.untitled')}</h3>
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{note.content}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                        <Clock size={12} />
                        {new Date(note.createdAt).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                    <div className="flex gap-1 mr-4">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-gray-400 hover:text-blue-500 p-1"
                        title={t('notes.edit')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title={t('notes.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}