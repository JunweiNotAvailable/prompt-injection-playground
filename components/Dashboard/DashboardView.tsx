'use client';

import BusinessDataPanel from './BusinessDataPanel';
import AttackRecordList from './AttackRecordList';

export default function DashboardView() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">管理儀表板</h1>
        <p className="mt-1 text-sm text-slate-500">查看虛擬業務數據與注入攻擊記錄</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <BusinessDataPanel />
        </div>
        
        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">攻擊記錄</h2>
              <p className="text-xs text-slate-500 mt-0.5">所有注入嘗試的分析結果</p>
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
