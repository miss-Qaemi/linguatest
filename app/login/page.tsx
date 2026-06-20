'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Loader2, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/app/context/LanguageContext'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t, dir } = useLanguage()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      identifier,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError(t('login.error'))
      return
    }

    if (res?.ok) {
      await new Promise(r => setTimeout(r, 400))
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      const userRole = sessionData?.user?.role

      if (userRole === 'TEACHER') {
        router.push('/dashboard/teacher')
      } else {
        router.push('/dashboard/student')
      }
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" dir={dir}>
      {/* Left - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-bold text-blue-600 text-lg">LinguaTest Pro</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.welcomeBack')}</h1>
          <p className="text-gray-500 mb-8 text-sm">{t('login.signInMessage')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {t('login.emailOrUsername')}
              </label>
              <input
                type="text"
                placeholder={t('login.emailPlaceholder')}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black pr-10"
                  required
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
                  {t('login.signingIn')}
                </>
              ) : (
                t('loginPage.signIn')
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              {t('loginPage.noAccount')}{' '}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                {t('loginPage.createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-50 to-blue-100 items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6">
            <BookOpen size={64} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">LinguaTest Pro</h2>
          <p className="text-blue-600 text-sm max-w-xs">
            {t('loginPage.tagline')}
          </p>
        </div>
      </div>
    </div>
  )
}