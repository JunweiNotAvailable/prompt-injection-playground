'use client';

import BusinessDataPanel from './BusinessDataPanel';
import AttackRecordList from './AttackRecordList';

export default function DashboardView() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
          <span className="text-cyan-400 font-mono">[</span>
          管理儀表板
          <span className="text-cyan-400 font-mono">]</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400 font-mono flex items-center gap-2">
          <span className="text-emerald-500">›</span>
          查看虛擬業務數據與注入攻擊記錄
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <BusinessDataPanel />
        </div>
        
        <div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-2xl shadow-cyan-500/5 overflow-hidden backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
              <h2 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
                <span className="text-cyan-400">▸</span>
                攻擊記錄
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">所有注入嘗試的分析結果</p>
            </div>
            <div className="p-6">
              <AttackRecordList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
