'use client';

import { useApp } from '@/contexts/AppContext';

export default function ModeSelector() {
  const { state, switchMode } = useApp();

  return (
    <div className="mb-6">
      <div className="inline-flex items-center bg-slate-800/50 rounded-lg p-1 gap-1 border border-slate-700/50 backdrop-blur-sm">
        <button
          onClick={() => switchMode('direct')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all font-mono ${
            state.currentMode === 'direct'
              ? 'bg-emerald-500 text-slate-900'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <span className="flex items-center gap-2">
            {state.currentMode === 'direct' && <span>▸</span>}
            直接注入
          </span>
        </button>
        <button
          onClick={() => switchMode('indirect')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all font-mono ${
            state.currentMode === 'indirect'
              ? 'bg-cyan-500 text-slate-900'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <span className="flex items-center gap-2">
            {state.currentMode === 'indirect' && <span>▸</span>}
            間接注入
          </span>
        </button>
      </div>
    </div>
  );
}
