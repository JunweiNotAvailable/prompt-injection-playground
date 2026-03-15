'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const isPlayground = pathname === '/';
  const isDashboard = pathname === '/dashboard';

  return (
    <nav className="bg-[#0f1629] border-b border-slate-800/50 backdrop-blur-sm sticky top-0 z-40 shadow-lg shadow-emerald-500/5">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between relative">
        
        <div className="flex items-center gap-3 relative">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg relative">
            <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.338 2.798H4.136c-1.368 0-2.338-1.798-1.338-2.798L4 15.3" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-emerald-400 tracking-tight font-mono">InjectionLab</span>
            <div className="text-[10px] text-cyan-500/70 font-mono -mt-0.5">v2.0 // SEC-TEST</div>
          </div>
        </div>

        <div className="flex items-center gap-1 relative">
          <Link
            href="/"
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all font-mono ${
              isPlayground
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2">
              {isPlayground && <span>▸</span>}
              測試介面
            </span>
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all font-mono ${
              isDashboard
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2">
              {isDashboard && <span>▸</span>}
              管理儀表板
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
