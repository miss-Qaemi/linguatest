'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Monitor, Loader2, Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useLanguage } from '@/app/context/LanguageContext'

export default function RegisterPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT')
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError(t('registerPage.passwordMismatch'))
      return
    }

    if (form.password.length < 6) {
      setError(t('registerPage.passwordMinLength'))
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
          role: role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? t('registerPage.error'))
        setLoading(false)
        return
      }

      const loginRes = await signIn('credentials', {
        identifier: form.email,
        password: form.password,
        redirect: false,
      })

      if (loginRes?.ok) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (role === 'TEACHER') {
          router.push('/dashboard/teacher')
        } else {
          router.push('/dashboard/student')
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Register error:', error)
      setError(t('registerPage.serverError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" dir={dir}>
      {/* Left - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">{t('registerPage.joinTitle')}</h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            {t('registerPage.joinDescription')}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-blue-200">{t('registerPage.examsCount')}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">10k+</p>
              <p className="text-blue-200">{t('registerPage.studentsCount')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-bold text-blue-600 text-lg">LinguaTest Pro</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('registerPage.createAccount')}</h1>
          <p className="text-gray-500 mb-6 text-sm">{t('registerPage.fillDetails')}</p>

          {/* Role Selector */}
          <div className="flex rounded-lg border border-gray-200 p-1 mb-6 gap-1">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                role === 'STUDENT'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen size={15} /> {t('registerPage.student')}
            </button>
            <button
              type="button"
              onClick={() => setRole('TEACHER')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                role === 'TEACHER'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Monitor size={15} /> {t('registerPage.teacher')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{t('registerPage.fullName')}</label>
              <input
                name="name"
                type="text"
                placeholder={t('registerPage.fullNamePlaceholder')}
                value={form.name}
                onChange={handleChange}
                className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{t('registerPage.username')}</label>
              <input
                name="username"
                type="text"
                placeholder={t('registerPage.usernamePlaceholder')}
                value={form.username}
                onChange={handleChange}
                className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{t('registerPage.email')}</label>
              <input
                name="email"
                type="email"
                placeholder={t('registerPage.emailPlaceholder')}
                value={form.email}
                onChange={handleChange}
                className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{t('registerPage.password')}</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('registerPage.passwordPlaceholder')}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{t('registerPage.confirmPassword')}</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder={t('registerPage.confirmPasswordPlaceholder')}
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t('registerPage.creating')}
                </>
              ) : (
                t('registerPage.createButton')
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('registerPage.haveAccount')}{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              {t('registerPage.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}