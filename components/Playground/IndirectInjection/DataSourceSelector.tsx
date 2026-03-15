'use client';

import { useState } from 'react';

type DataSource = 'email' | 'database';

interface DataSourceSelectorProps {
  onSelect: (source: DataSource) => void;
  selected: DataSource;
}

export default function DataSourceSelector({ onSelect, selected }: DataSourceSelectorProps) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mr-1 font-mono">資料來源</span>
      <button
        onClick={() => onSelect('email')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all font-mono ${
          selected === 'email'
            ? 'bg-emerald-500 text-slate-900'
            : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        電子郵件
      </button>
      <button
        onClick={() => onSelect('database')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all font-mono ${
          selected === 'database'
            ? 'bg-cyan-500 text-slate-900'
            : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
        資料庫記錄
      </button>
    </div>
  );
}
