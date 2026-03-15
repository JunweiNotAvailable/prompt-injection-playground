'use client';

import { useState } from 'react';
import CustomerList from './CustomerList';
import OrderList from './OrderList';

export default function BusinessDataPanel() {
  const [activeTab, setActiveTab] = useState<'customers' | 'orders'>('customers');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">虛擬業務數據</h2>
        <p className="text-xs text-slate-500 mt-0.5">模擬電商平台的客戶與訂單資料</p>
      </div>

      <div className="px-6 pt-4">
        <div className="flex gap-1 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === 'customers'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            客戶列表
            {activeTab === 'customers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-sm" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === 'orders'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            訂單列表
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-sm" />
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
