"use client";

import Link from "next/link";
import { GraduationCap, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export function Footer() {
  const { data: session } = useSession();
  return(
<footer className="border-t border-gray-100 py-12 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="font-bold text-blue-600">LinguaTest</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Your comprehensive platform for language testing and daily learning.
            </p>
            <div className="flex gap-3 text-gray-400 text-sm">
              <span className="cursor-pointer hover:text-gray-600">🐙</span>
              <span className="cursor-pointer hover:text-gray-600">🐦</span>
              <span className="cursor-pointer hover:text-gray-600">💼</span>
            </div>
          </div>

          {[
            { title: "About Us", links: ["Our Story", "Team", "Careers"] },
            { title: "Support", links: ["FAQ", "Help Center", "Contact Us"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-medium text-gray-700 text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 text-sm hover:text-gray-600 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-gray-100">
          <p className="text-gray-300 text-xs">Made with ❤️ for language learners</p>
        </div>
      </footer>);}