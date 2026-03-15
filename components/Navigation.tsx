'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const isPlayground = pathname === '/';
  const isDashboard = pathname === '/dashboard';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.338 2.798H4.136c-1.368 0-2.338-1.798-1.338-2.798L4 15.3" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-800 tracking-tight">InjectionLab</span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              isPlayground
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            測試介面
          </Link>
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              isDashboard
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            管理儀表板
          </Link>
        </div>
      </div>
    </nav>
  );
}
