"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Award, Edit2, X, Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  // level حذف شد
}

export default function TeacherPlacementTestPage() {
  const router = useRouter();
    const { t, dir } = useLanguage();  

  
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("آزمون تعیین سطح زبان");
  const [description, setDescription] = useState("این آزمون سطح زبان شما را تعیین می‌کند");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  
  // برای ویرایش سوال
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);
  
  // برای سوال جدید
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: Date.now().toString(),
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "A"
  });

  // دریافت سوالات موجود
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/placement-test/questions");
      if (res.ok) {
        const data = await res.json();
        
        // تبدیل سوالات به فرمت مورد نیاز
        const formattedQuestions = data.map((q: any) => ({
          id: q.id || Date.now().toString() + Math.random(),
          questionText: q.questionText,
          options: [
            q.options.find((o: any) => o.letter === "A")?.text || "",
            q.options.find((o: any) => o.letter === "B")?.text || "",
            q.options.find((o: any) => o.letter === "C")?.text || "",
            q.options.find((o: any) => o.letter === "D")?.text || ""
          ],
          correctAnswer: q.correctAnswer
        }));
        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  // افزودن سوال جدید
  const handleAddQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      alert("لطفاً متن سوال را وارد کنید");
      return;
    }

    setQuestions([...questions, { ...newQuestion, id: Date.now().toString() }]);
    resetNewQuestion();
  };

  // ریست فرم سوال جدید
  const resetNewQuestion = () => {
    setNewQuestion({
      id: Date.now().toString(),
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "A"
    });
  };

  // حذف سوال
  const handleDeleteQuestion = (id: string) => {
    if (confirm("آیا از حذف این سوال اطمینان دارید؟")) {
      setQuestions(questions.filter(q => q.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setEditForm(null);
      }
    }
  };

  // شروع ویرایش سوال
  const handleEditQuestion = (question: Question) => {
    setEditingId(question.id);
    setEditForm({ ...question });
  };

  // لغو ویرایش
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // ذخیره تغییرات ویرایش
  const handleSaveEdit = () => {
    if (!editForm) return;
    
    if (!editForm.questionText.trim()) {
      alert("لطفاً متن سوال را وارد کنید");
      return;
    }

    setQuestions(questions.map(q => 
      q.id === editForm.id ? editForm : q
    ));
    
    setEditingId(null);
    setEditForm(null);
  };

  // به‌روزرسانی گزینه در فرم ویرایش
  const handleEditOptionChange = (index: number, value: string) => {
    if (!editForm) return;
    const newOptions = [...editForm.options];
    newOptions[index] = value;
    setEditForm({ ...editForm, options: newOptions });
  };

  // به‌روزرسانی گزینه در فرم سوال جدید
  const handleNewOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleSave = async () => {
    if (questions.length === 0) {
      alert("حداقل یک سوال اضافه کنید");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/placement-test/create", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          duration,
          questions: questions.map(q => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer
          }))
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("آزمون تعیین سطح با موفقیت ذخیره شد");
        router.push("/dashboard/teacher");
      } else {
        alert(data.error || "خطا در ذخیره آزمون");
      }
    } catch (error) {
      console.error("Error saving test:", error);
      alert("خطا در ذخیره آزمون");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* هدر */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/teacher" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <Award size={28} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              مدیریت آزمون تعیین سطح
            </h1>
          </div>
        </div>

        {/* اطلاعات آزمون */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات آزمون</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان آزمون</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان (دقیقه)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* فرم افزودن سوال جدید */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">➕ افزودن سوال جدید</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">متن سوال</label>
              <input
                type="text"
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: What is your name?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {newQuestion.options.map((opt, index) => (
                <div key={index}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    گزینه {String.fromCharCode(65 + index)}
                  </label>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleNewOptionChange(index, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`گزینه ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">پاسخ صحیح</label>
                <select
                  value={newQuestion.correctAnswer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">گزینه A</option>
                  <option value="B">گزینه B</option>
                  <option value="C">گزینه C</option>
                  <option value="D">گزینه D</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              افزودن سوال
            </button>
          </div>
        </div>

        {/* لیست سوالات با قابلیت ویرایش */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 لیست سوالات ({questions.length})</h2>

          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                {editingId === q.id && editForm ? (
                  // حالت ویرایش
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-600">ویرایش سوال {index + 1}</span>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">متن سوال</label>
                      <input
                        type="text"
                        value={editForm.questionText}
                        onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {editForm.options.map((opt, optIndex) => (
                        <div key={optIndex}>
                          <label className="block text-xs text-gray-500 mb-1">
                            گزینه {String.fromCharCode(65 + optIndex)}
                          </label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleEditOptionChange(optIndex, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">پاسخ صحیح</label>
                        <select
                          value={editForm.correctAnswer}
                          onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveEdit}
                      className="mt-2 flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                    >
                      <Check size={14} /> ذخیره تغییرات
                    </button>
                  </div>
                ) : (
                  // حالت نمایش عادی
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-sm text-blue-600 font-medium">سوال {index + 1}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="ویرایش"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-800 font-medium mb-3">{q.questionText}</p>

                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg text-sm ${
                            String.fromCharCode(65 + idx) === q.correctAnswer
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          <span className="font-bold ml-1">{String.fromCharCode(65 + idx)}.</span> {opt}
                          {String.fromCharCode(65 + idx) === q.correctAnswer && (
                            <span className="mr-2 text-xs text-green-600">✓ پاسخ صحیح</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <p className="text-center text-gray-400 py-8">هیچ سوالی اضافه نشده است</p>
            )}
          </div>
        </div>

        {/* دکمه‌های پایانی */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            disabled={saving || questions.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <span>در حال ذخیره...</span>
            ) : (
              <>
                <Save size={18} />
                ذخیره آزمون
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}