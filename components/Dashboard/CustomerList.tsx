'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/types';

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('無法取得客戶列表');
      }
      const data = await response.json();
      setCustomers(data.customers);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="text-sm">載入中...</span>
      </div>
    );
  }

  if (error) {
    return <div className="px-6 py-4 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客戶 ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">姓名</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">電子郵件</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-3.5 text-xs text-slate-400 font-mono">{customer.id.slice(0, 8)}…</td>
              <td className="px-6 py-3.5 text-sm font-medium text-slate-800">{customer.name}</td>
              <td className="px-6 py-3.5 text-sm text-slate-500">{customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
