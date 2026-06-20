'use client';

import { useLanguage } from "../context/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code as any)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            language === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  );
}