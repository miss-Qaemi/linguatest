'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { GraduationCap, LogIn, UserPlus, LayoutDashboard, Home, BookOpen } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useLanguage } from '@/app/context/LanguageContext';

export function Header() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
          <GraduationCap size={20} /> LinguaTest
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link href="/" className="hover:text-blue-600 transition flex items-center gap-1">
              <Home size={15} /> {t('Home')}
            </Link>
            <Link href="/courses" className="hover:text-blue-600 transition flex items-center gap-1">
              <BookOpen size={15} /> {t('courses')}
            </Link>

            {session ? (
              <>
                <Link
                  href={session?.user?.role === 'TEACHER' ? '/dashboard/teacher' : '/dashboard/student'}
                  className="flex items-center gap-1 hover:text-blue-600 transition"
                >
                  <LayoutDashboard size={15} /> {t('dashboard')}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-100 text-xs font-semibold"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-1 hover:text-blue-600 transition">
                  <LogIn size={15} /> {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-xs font-semibold flex items-center gap-1"
                >
                  <UserPlus size={14} /> {t('register')}
                </Link>
              </>
            )}
          </nav>

          {/* دکمه تغییر زبان */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}