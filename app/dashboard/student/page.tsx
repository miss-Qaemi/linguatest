// app/dashboard/student/page.tsx
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DailyTip } from '@/app/components/DailyTip'
import { Footer} from '@/app/components/layout/footer'
import Link from 'next/link'
import {
  BookOpen, BarChart2, Clock, ChevronRight,
  GraduationCap, Github, Twitter, Linkedin,
  Home, LayoutDashboard, Flag, Volume2, BookMarked,
  LogOut, User, Bell, Loader2
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useLanguage } from '@/app/context/LanguageContext'

// Types
interface TestResult {
  id: string | number
  name: string
  score: number
  date: string
  examId?: string
}

interface Course {
  id: string | number
  title: string
  description: string
  language: string
  level: string
  href: string
  icon?: string
  progress?: number
  teacherName?: string
}

interface ActiveExam {
  id: string
  title: string
  subject?: string
  timeLeft?: number
  answeredQuestions?: number
  totalQuestions?: number
}

interface DailyNote {
  id?: string | number
  title: string
  body: string
  date: string
  tags?: string[]
}

interface SavedTip {
  id: string
  content: string
  date: string
  savedAt: string
}

// API fetch functions
async function fetchTestResults(): Promise<TestResult[]> {
  try {
    const res = await fetch('/api/student/test-result')
    if (!res.ok) throw new Error('API not ready')
    const data = await res.json()
    console.log("Test results from API:", data)
    return data.map((r: any) => ({
      id: r.id,
      name: r.examTitle ?? 'Untitled',
      score: r.score,
      date: new Date(r.completedAt).toLocaleDateString('fa-IR'),
      examId: r.examId,
    }))
  } catch (error) {
    console.error("Error fetching test results:", error)
    return []
  }
}

async function fetchCourses(): Promise<Course[]> {
  try {
    const res = await fetch('/api/student/courses?type=enrolled')
    if (!res.ok) throw new Error('API not ready')
    const data = await res.json()
    return data.map((c: any) => ({
      id: c.id,
      title: c.name ?? c.title,
      description: c.description ?? '',
      language: c.language ?? 'English',
      level: c.level ?? '',
      href: `/dashboard/student/courses/${c.id}`,
      progress: c.progress ?? 0,
      teacherName: c.teacherName ?? '',
    }))
  } catch {
    return []
  }
}

async function fetchActiveExam(): Promise<ActiveExam | null> {
  try {
    const res = await fetch('/api/student/active-exam')
    if (!res.ok) throw new Error('API not ready')
    const data = await res.json()
    return data ?? null
  } catch {
    return null
  }
}

async function fetchDailyNotes(): Promise<DailyNote[]> {
  try {
    const res = await fetch('/api/student/notes')
    if (!res.ok) throw new Error('API not ready')
    const data = await res.json()
    return data.map((n: any) => ({
      id: n.id,
      title: n.title,
      body: n.content ?? n.body ?? '',
      date: new Date(n.createdAt ?? n.date).toISOString().split('T')[0],
      tags: n.tags ?? [],
    }))
  } catch {
    return []
  }
}

async function fetchSavedTips(): Promise<SavedTip[]> {
  try {
    const res = await fetch('/api/daily-tip', { method: 'PUT' })
    if (!res.ok) throw new Error('Failed to fetch saved tips')
    const data = await res.json()
    return data
  } catch {
    return []
  }
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-blue-500'
  return 'text-orange-400'
}

function courseIcon(icon?: string) {
  if (icon === 'bookmark') return <BookMarked size={22} className="text-purple-500" />
  if (icon === 'volume')   return <Volume2    size={22} className="text-green-500"  />
  return <Flag size={22} className="text-blue-500" />
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, dir } = useLanguage()

  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [activeExam, setActiveExam] = useState<ActiveExam | null>(null)
  const [notes, setNotes] = useState<DailyNote[]>([])
  const [savedTips, setSavedTips] = useState<SavedTip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role === 'TEACHER') router.push('/dashboard/teacher')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    Promise.all([
      fetchTestResults(),
      fetchCourses(),
      fetchActiveExam(),
      fetchDailyNotes(),
      fetchSavedTips(),
    ]).then(([results, courseList, exam, noteList, tips]) => {
      console.log("Setting test results:", results)
      setTestResults(results)
      setCourses(courseList)
      setActiveExam(exam)
      setNotes(noteList)
      setSavedTips(tips)
      setLoading(false)
    })
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-400">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const userName = session?.user?.name ?? 'Student'
  const userAvatar = (session?.user as any)?.image ?? null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={dir}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
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
              <Link href="/dashboard/student" className="flex items-center gap-1.5 text-blue-600 font-medium">
                <LayoutDashboard size={15} /> {t('dashboard')}
              </Link>
              <Link href="/dashboard/student/exams" className="flex items-center gap-1.5 hover:text-blue-600 transition">
                <BarChart2 size={15} /> {t('exams')}
              </Link>
              <Link href="/courses" className="flex items-center gap-1.5 hover:text-blue-600 transition">
                <BookOpen size={15} /> {t('courses')}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
              <Bell size={16} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden cursor-pointer">
                {userAvatar
                  ? <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <User size={16} className="text-gray-400" />
                    </div>
                }
              </div>
              <span className="text-sm text-gray-700 font-medium hidden sm:block">{userName}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign out"
              className="text-gray-400 hover:text-red-500 transition ml-1"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('welcome')} {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">{t('student.dashboardSubtitle') || "Here's what's happening with your learning today."}</p>
        </div>

        <div className="flex gap-8">

          {/* Left Column */}
          <div className="flex-1 space-y-8">

            {/* Saved Test Results */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('savedResults')}</h2>
                <Link href="/dashboard/student/exams" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                  {t('student.viewAll') || 'View All'} <ChevronRight size={14} />
                </Link>
              </div>
              
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">{t('student.noSavedResults') || 'No saved test results yet.'}</p>
                  <p className="text-xs text-gray-300 mt-1">{t('student.takeExamToSave') || 'Take an exam and save your result!'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.slice(0, 5).map((result) => (
                    <div key={result.id} className="border border-gray-100 rounded-lg p-3 hover:border-blue-200 transition">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{result.name}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          result.score >= 70 ? 'bg-green-100 text-green-700' : 
                          result.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {result.score}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{result.date}</span>
                        <Link 
                          href={`/dashboard/student/exams/${result.examId}/results`}
                          className="text-blue-600 hover:underline"
                        >
                          {t('student.viewDetails') || 'View Details'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Courses */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('myCourses')}</h2>
                <Link href="/courses" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                  {t('student.viewAllCourses') || 'View All'} <ChevronRight size={14} />
                </Link>
              </div>
              {courses.length === 0
                ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
                    {t('student.noCourses') || "You haven't enrolled in any courses yet."}
                    <br />
                    <Link href="/courses" className="text-blue-500 hover:underline mt-2 inline-block">{t('student.browseCourses') || 'Browse Courses'} →</Link>
                  </div>
                )
                : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {courses.slice(0, 4).map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-400 transition group">
                        <div className="mb-3">{courseIcon(course.icon)}</div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">{course.title}</h3>
                        <p className="text-gray-400 text-xs mb-3 leading-relaxed">{course.description}</p>

                        {typeof course.progress === 'number' && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>{t('student.progress') || 'Progress'}</span>
                              <span>{course.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${course.progress}%` }}
                                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                              />
                            </div>
                          </div>
                        )}

                        {course.teacherName && (
                          <p className="text-xs text-gray-400 mb-3">By {course.teacherName}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                            {course.language} · {course.level}
                          </span>
                          <Link
                            href={course.href}
                            className="text-xs bg-gray-100 group-hover:bg-blue-600 group-hover:text-white text-gray-600 px-3 py-1.5 rounded-lg font-medium transition"
                          >
                            {t('student.goToCourse') || 'Go to Course'} →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>

          </div>

          {/* Right Column */}
          <div className="w-72 space-y-5 shrink-0">

            {/* Continue Exam */}
            {activeExam && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{t('student.continueExam') || 'Continue Your Exam'}</h3>
                <p className="text-sm text-gray-500 mb-3 font-medium">{activeExam.title}</p>

                {activeExam.totalQuestions && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{activeExam.answeredQuestions} / {activeExam.totalQuestions} {t('student.answered') || 'answered'}</span>
                      {activeExam.timeLeft && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {activeExam.timeLeft} min
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.round(((activeExam.answeredQuestions ?? 0) / activeExam.totalQuestions) * 100)}%` }}
                        className="h-full bg-orange-400 rounded-full transition-all"
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-4">
                  {t('student.resumeExamMessage') || 'Resume now to complete your assessment and get your results.'}
                </p>
                <Link
                  href={`/dashboard/student/exams/${activeExam.id}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-xl font-semibold text-sm transition"
                >
                  {t('student.continueTest') || 'Continue Test'}
                </Link>
              </div>
            )}

            {/* Daily Tip */}
            <DailyTip />

            {/* My Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('myNotes')}</h3>
                <Link href="/dashboard/student/notes" className="text-blue-600 text-xs hover:underline">{t('student.seeAll') || 'See all'}</Link>
              </div>
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">{t('student.noNotes') || 'No notes yet.'}</p>
                ) : (
                  notes.slice(0, 3).map((note) => (
                    <div key={note.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">{note.title || 'Untitled'}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{note.body}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock size={11} />
                          {note.date}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link
                href="/dashboard/student/notes/new"
                className="mt-4 block w-full border-2 border-dashed border-gray-200 text-gray-400 text-xs text-center py-2 rounded-xl hover:border-blue-300 hover:text-blue-500 transition font-medium"
              >
                + {t('student.addNewNote') || 'Add new note'}
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('student.quickAccess') || 'Quick Access'}</h3>
              <div className="space-y-2">
                <Link href="/dashboard/student/exams" className="flex items-center justify-between text-sm text-blue-700 hover:text-blue-900 transition py-1">
                  <span className="flex items-center gap-2"><BarChart2 size={14} /> {t('exams')}</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/courses" className="flex items-center justify-between text-sm text-blue-700 hover:text-blue-900 transition py-1">
                  <span className="flex items-center gap-2"><BookOpen size={14} /> {t('courses')}</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/" className="flex items-center justify-between text-sm text-blue-700 hover:text-blue-900 transition py-1">
                  <span className="flex items-center gap-2"><Home size={14} /> {t('home')}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer - استفاده از کامپوننت Footer */}
      <Footer />

    </div>
  )
}