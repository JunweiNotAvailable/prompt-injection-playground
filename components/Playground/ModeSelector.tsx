'use client';

import { useApp } from '@/contexts/AppContext';

export default function ModeSelector() {
  const { state, switchMode } = useApp();

  return (
    <div className="mb-6">
      <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 gap-1">
        <button
          onClick={() => switchMode('direct')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            state.currentMode === 'direct'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          直接注入
        </button>
        <button
          onClick={() => switchMode('indirect')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            state.currentMode === 'indirect'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          間接注入
        </button>
      </div>
    </div>
  );
}
