"use client";

import Link from "next/link";
import { GraduationCap, Twitter, Github, Linkedin } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export function Footer() {
  const { t, dir } = useLanguage();

  // Social URLs (configure via env or change literal URLs here)
  const SOCIAL = {
    github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB || "https://github.com/miss-Qaemi/linguatest#",
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "https://x.com/elonmusk",
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "https://www.linkedin.com/in/williamhgates/",
  };

  // Footer columns — internal routes by default.
  // Change href values if you want different destinations.
  const columns = [
    {
      title: t("footer.aboutUs"),
      links: [
        { label: t("footer.ourStory"), href: "/about" },
        { label: t("footer.team"), href: "/team" },
        { label: t("footer.careers"), href: "/careers" }, // clickable Careers
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { label: t("footer.faq"), href: "/support/faq" },
        { label: t("footer.helpCenter"), href: "/support" },
        { label: t("footer.contactUs"), href: "/contact" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.privacyPolicy"), href: "/privacy" },
        { label: t("footer.termsOfService"), href: "/terms" },
      ],
    },
  ];

  return (
      <footer className="border-t border-gray-100 py-12 px-8" dir={dir}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="font-bold text-blue-600">LinguaTest</span>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              {t("footer.description")}
            </p>

            {/* Social icons (lucide-react) */}
            <div className="flex gap-3 text-gray-400 text-sm">
              <a
                  href={SOCIAL.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-600 flex items-center"
                  aria-label="GitHub"
                  title="GitHub"
              >
                <Github size={18} />
              </a>

              <a
                  href={SOCIAL.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-600 flex items-center"
                  aria-label="Twitter"
                  title="Twitter"
              >
                <Twitter size={18} />
              </a>

              <a
                  href={SOCIAL.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-600 flex items-center"
                  aria-label="LinkedIn"
                  title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {columns.map((col) => (
              <div key={String(col.title)}>
                <h4 className="font-medium text-gray-700 text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                      <li key={String(link.label)}>
                        {link.href.startsWith("http") ? (
                            <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
                                aria-label={String(link.label)}
                            >
                              {link.label}
                            </a>
                        ) : (
                            <Link
                                href={link.href}
                                className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
                                aria-label={String(link.label)}
                            >
                              {link.label}
                            </Link>
                        )}
                      </li>
                  ))}
                </ul>
              </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-gray-100">
          <p className="text-gray-300 text-xs">{t("footer.madeWith")}</p>
        </div>
      </footer>
  );
}