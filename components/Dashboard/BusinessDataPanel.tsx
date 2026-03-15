'use client';

import { useState } from 'react';
import CustomerList from './CustomerList';
import OrderList from './OrderList';

export default function BusinessDataPanel() {
  const [activeTab, setActiveTab] = useState<'customers' | 'orders'>('customers');

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden backdrop-blur-sm">
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
        <h2 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
          <span className="text-emerald-400">▸</span>
          虛擬業務數據
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 font-mono">模擬電商平台的客戶與訂單資料</p>
      </div>

      <div className="px-6 pt-4">
        <div className="flex gap-1 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative font-mono ${
              activeTab === 'customers'
                ? 'text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            客戶列表
            {activeTab === 'customers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-t-sm shadow-lg shadow-emerald-500/50" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative font-mono ${
              activeTab === 'orders'
                ? 'text-cyan-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            訂單列表
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-t-sm shadow-lg shadow-cyan-500/50" />
            )}
          </button>
        </div>
      </div>

      <div className="p-0">
        {activeTab === 'customers' ? <CustomerList /> : <OrderList />}
      </div>
    </div>
  );
}
