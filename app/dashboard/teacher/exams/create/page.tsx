"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap, Plus, Trash2, Edit2, Save, ChevronDown,
  Music, FileText, X, Users, AlertCircle, CheckCircle2,
  Mic, BookOpen, Clock, Calendar, ChevronLeft, Loader2, Link2
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
}

interface Course {
  id: string;
  name: string;
}

type ContentMode = "none" | "audio" | "text";

const emptyQuestion = (): Question => ({
  id: Math.random().toString(36).slice(2),
  text: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
});

export default function CreateTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const isEditMode = !!examId;
  const { t, dir } = useLanguage();

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [level, setLevel] = useState("MEDIUM");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [contentMode, setContentMode] = useState<ContentMode>("none");
  const [audioUrl, setAudioUrl] = useState("");
  const [passageText, setPassageText] = useState("");

  const [studentIdsInput, setStudentIdsInput] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Question | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQ, setNewQ] = useState<Question>(emptyQuestion());

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // دریافت لیست کورس‌ها
  useEffect(() => {
    fetch("/api/teacher/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        }
      });
  }, []);

  // اگر در حالت ویرایش هستیم، اطلاعات آزمون را دریافت کن
  useEffect(() => {
    if (isEditMode && examId) {
      fetchExamData(examId);
    }
  }, [isEditMode, examId]);

  const fetchExamData = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/exams/${id}`);
      if (res.ok) {
        const data = await res.json();
        
        setTitle(data.title || "");
        setDescription(data.description || "");
        setDuration(String(data.duration || 60));
        setLevel(data.level || "MEDIUM");
        setStartDate(data.startDate ? data.startDate.slice(0, 16) : "");
        setEndDate(data.endDate ? data.endDate.slice(0, 16) : "");
        setCourseId(data.courseId || "");
        setIsPublic(data.isPublic ?? true);
        
        if (data.audioUrl) {
          setContentMode("audio");
          setAudioUrl(data.audioUrl);
        } else if (data.passageText) {
          setContentMode("text");
          setPassageText(data.passageText);
        }
        
        if (data.questions && Array.isArray(data.questions)) {
          const formattedQuestions = data.questions.map((q: any) => {
            let optionA = "", optionB = "", optionC = "", optionD = "";
            if (q.options) {
              try {
                const options = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
                if (Array.isArray(options)) {
                  options.forEach((opt: any) => {
                    if (opt.letter === "A") optionA = opt.text;
                    else if (opt.letter === "B") optionB = opt.text;
                    else if (opt.letter === "C") optionC = opt.text;
                    else if (opt.letter === "D") optionD = opt.text;
                  });
                }
              } catch (e) {
                console.error("Error parsing options:", e);
              }
            }
            
            return {
              id: q.id || Math.random().toString(36).slice(2),
              text: q.questionText || "",
              optionA,
              optionB,
              optionC,
              optionD,
              correctAnswer: q.correctAnswer || "A",
            };
          });
          setQuestions(formattedQuestions);
        }
      } else {
        showToast(t('exam.loadError'), "error");
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      showToast(t('exam.loadError'), "error");
    } finally {
      setLoading(false);
    }
  };

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function addQuestion() {
    if (!newQ.text.trim() || !newQ.optionA || !newQ.optionB || !newQ.optionC || !newQ.optionD) {
      showToast(t('exam.fillAllOptions'), "error");
      return;
    }
    setQuestions((prev) => [...prev, { ...newQ, id: Math.random().toString(36).slice(2) }]);
    setNewQ(emptyQuestion());
    setShowAddForm(false);
  }

  function deleteQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function startEdit(q: Question) {
    setEditingId(q.id);
    setEditBuffer({ ...q });
  }

  function saveEdit() {
    if (!editBuffer) return;
    setQuestions((prev) => prev.map((q) => (q.id === editBuffer.id ? editBuffer : q)));
    setEditingId(null);
    setEditBuffer(null);
  }

  async function handleSave() {
    if (!title.trim()) return showToast(t('exam.titleRequired'), "error");
    if (!startDate || !endDate) return showToast(t('exam.datesRequired'), "error");
    if (questions.length === 0) return showToast(t('exam.atLeastOneQuestion'), "error");

    setSaving(true);
    const assignedStudentIds = isPublic
      ? []
      : studentIdsInput.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const url = isEditMode ? `/api/teacher/exams/${examId}` : "/api/teacher/exams";
      const method = isEditMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          courseId: courseId || null,
          duration: Number(duration),
          startDate,
          endDate,
          level,
          isPublic,
          audioUrl: contentMode === "audio" ? audioUrl : null,
          passageText: contentMode === "text" ? passageText : null,
          questions: questions.map((q, index) => ({
            questionText: q.text,
            type: "MULTIPLE_CHOICE",
            options: [
              { letter: "A", text: q.optionA },
              { letter: "B", text: q.optionB },
              { letter: "C", text: q.optionC },
              { letter: "D", text: q.optionD },
            ],
            correctAnswer: q.correctAnswer,
            section: "general",
            order: index,
            difficulty: level,
          })),
        }),
      });

      if (res.ok) {
        showToast(
          isEditMode ? t('exam.updateSuccess') : t('exam.createSuccess'),
          "success"
        );
        setTimeout(() => {
          router.push("/dashboard/teacher/exams");
        }, 1200);
      } else {
        const d = await res.json();
        showToast(d.error ?? (isEditMode ? t('exam.updateError') : t('exam.createError')), "error");
      }
    } catch {
      showToast(t('exam.networkError'), "error");
    } finally {
      setSaving(false);
    }
  }

  const optionLabels = ["A", "B", "C", "D"] as const;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-['Geist',sans-serif]" dir={dir}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* هدر حذف شد - از layout اصلی می‌آید */}

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/teacher/exams" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition">
            <ChevronLeft size={16} /> {t('exam.back')}
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? t('exam.editTest') : t('exam.createNewTest')}
          </h1>
        </div>

        <div className="space-y-6">
          {/* Test Details */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">{t('exam.testDetails')}</h2>
            <p className="text-xs text-gray-400 mb-5">{t('exam.testDetailsDesc')}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('exam.testTitle')} <span className="text-red-500">*</span></label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('exam.titlePlaceholder')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('exam.testDescription')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder={t('exam.descriptionPlaceholder')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('exam.course')} <span className="text-gray-400 font-normal">({t('exam.optional')})</span></label>
                  <div className="relative">
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="">-- {t('exam.noCourse')} --</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('exam.difficultyLevel')}</label>
                  <div className="relative">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="EASY">{t('exam.easy')}</option>
                      <option value="MEDIUM">{t('exam.medium')}</option>
                      <option value="HARD">{t('exam.hard')}</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1.5"><Clock size={11} /> {t('exam.duration')} <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="5" max="300"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1.5"><Calendar size={11} /> {t('exam.startDate')} <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1.5"><Calendar size={11} /> {t('exam.endDate')} <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Student Access */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2"><Users size={16} /> {t('exam.studentAccess')}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{t('exam.studentAccessDesc')}</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ${isPublic ? "bg-green-500" : "bg-blue-600"}`}
              >
                <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isPublic ? "translate-x-1" : "translate-x-6"}`} />
              </button>
            </div>

            {isPublic ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                <span><strong>{t('exam.publicAccess')}:</strong> {t('exam.publicAccessDesc')}</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 mb-3">
                  <AlertCircle size={15} className="text-blue-500 shrink-0" />
                  <span><strong>{t('exam.restrictedAccess')}:</strong> {t('exam.restrictedAccessDesc')}</span>
                </div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('exam.assignStudents')} <span className="text-gray-400 font-normal">({t('exam.commaSeparated')})</span></label>
                <input
                  value={studentIdsInput}
                  onChange={(e) => setStudentIdsInput(e.target.value)}
                  placeholder="student001, student002@email.com, ..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1.5">{t('exam.studentAccessNote')}</p>
              </div>
            )}
          </section>

          {/* Test Content */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">{t('exam.testContent')}</h2>
            <p className="text-xs text-gray-400 mb-4">{t('exam.testContentDesc')}</p>

            <div className="flex gap-3 mb-5">
              {[
                { mode: "none" as ContentMode, icon: <X size={14} />, label: t('exam.noContent') },
                { mode: "audio" as ContentMode, icon: <Mic size={14} />, label: t('exam.audioFileLink') },
                { mode: "text" as ContentMode, icon: <BookOpen size={14} />, label: t('exam.textPassage') },
              ].map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => setContentMode(opt.mode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition
                    ${contentMode === opt.mode ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>

            {contentMode === "audio" && (
              <div>
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                  <Link2 size={14} /> {t('exam.audioFileUrl')}
                </label>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {t('exam.audioFileHint')}
                </p>
                {audioUrl && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                    <Music size={16} className="text-blue-500" />
                    <span className="text-sm text-blue-700 truncate flex-1">{audioUrl}</span>
                    <button
                      onClick={() => window.open(audioUrl, '_blank')}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                    >
                      {t('exam.testLink')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {contentMode === "text" && (
              <div>
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2"><FileText size={12} /> {t('exam.readingPassage')}</label>
                <textarea
                  value={passageText}
                  onChange={(e) => setPassageText(e.target.value)}
                  rows={8}
                  placeholder={t('exam.passagePlaceholder')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-1">{passageText.length} {t('exam.characters')}</p>
              </div>
            )}
          </section>

          {/* Question Management */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">{t('exam.questionManagement')}</h2>
            <p className="text-xs text-gray-400 mb-5">{t('exam.questionManagementDesc')}</p>

            {!showAddForm ? (
              <button
                onClick={() => { setShowAddForm(true); setNewQ(emptyQuestion()); }}
                className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                <Plus size={15} /> {t('exam.addNewQuestion')}
              </button>
            ) : (
              <div className="border-2 border-blue-100 rounded-xl p-5 bg-blue-50/30 mb-4">
                <p className="text-sm font-bold text-gray-800 mb-3">{t('exam.newQuestion')}</p>
                <div className="mb-3">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{t('exam.questionText')} <span className="text-red-500">*</span></label>
                  <textarea
                    rows={2}
                    value={newQ.text}
                    onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                    placeholder={t('exam.enterQuestion')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {optionLabels.map((opt) => (
                    <div key={opt}>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">{t('exam.option')} {opt} <span className="text-red-500">*</span></label>
                      <input
                        value={newQ[`option${opt}` as keyof Question] as string}
                        onChange={(e) => setNewQ({ ...newQ, [`option${opt}`]: e.target.value })}
                        placeholder={`${t('exam.option')} ${opt}`}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 block mb-2">{t('exam.correctAnswer')}</label>
                  <div className="flex gap-2">
                    {optionLabels.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setNewQ({ ...newQ, correctAnswer: opt })}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition
                          ${newQ.correctAnswer === opt ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addQuestion} className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <Plus size={14} /> {t('exam.addQuestion')}
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    {t('exam.cancel')}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Current Questions */}
          {questions.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">{t('exam.currentQuestions')} ({questions.length})</h2>
              <p className="text-xs text-gray-400 mb-5">{t('exam.currentQuestionsDesc')}</p>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    {editingId === q.id && editBuffer ? (
                      <div className="p-4 bg-blue-50/30">
                        <div className="mb-3">
                          <label className="text-xs font-semibold text-gray-600 block mb-1">{t('exam.questionText')}</label>
                          <textarea
                            rows={2}
                            value={editBuffer.text}
                            onChange={(e) => setEditBuffer({ ...editBuffer, text: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {optionLabels.map((opt) => (
                            <div key={opt}>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">{t('exam.option')} {opt}</label>
                              <input
                                value={editBuffer[`option${opt}` as keyof Question] as string}
                                onChange={(e) => setEditBuffer({ ...editBuffer, [`option${opt}`]: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="text-xs font-semibold text-gray-600">{t('exam.correct')}:</span>
                            {optionLabels.map((opt) => (
                              <button key={opt} onClick={() => setEditBuffer({ ...editBuffer, correctAnswer: opt })}
                                className={`px-3 py-1 rounded-lg text-xs font-bold border transition
                                  ${editBuffer.correctAnswer === opt ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-600"}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                              <Save size={12} /> {t('exam.save')}
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
                              {t('exam.cancel')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 mb-2">{idx + 1}. {q.text}</p>
                          <ul className="space-y-0.5">
                            {optionLabels.map((opt) => (
                              <li key={opt} className={`text-xs flex items-center gap-1.5 ${q.correctAnswer === opt ? "text-green-700 font-semibold" : "text-gray-500"}`}>
                                <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold shrink-0
                                  ${q.correctAnswer === opt ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{opt}</span>
                                {q[`option${opt}` as keyof Question] as string}
                                {q.correctAnswer === opt && <span className="text-[10px] text-green-600 ml-1">✓ {t('exam.correct')}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-start gap-1 shrink-0">
                          <button onClick={() => startEdit(q)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteQuestion(q.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2 pb-10">
            <div className="text-sm text-gray-400">
              {questions.length} {t('exam.questionCount')}{questions.length !== 1 ? "s" : ""} {t('exam.added')}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-8 py-3 rounded-xl transition shadow-sm"
            >
              {saving ? (
                <span className="animate-pulse">{t('exam.saving')}...</span>
              ) : (
                <><Save size={15} /> {isEditMode ? t('exam.updateTest') : t('exam.saveTest')}</>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}