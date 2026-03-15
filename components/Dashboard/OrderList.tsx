'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import OrderDetails from './OrderDetails';

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('無法取得訂單列表');
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待處理',
      processing: '處理中',
      shipped: '已出貨',
      delivered: '已送達',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      processing: 'bg-blue-50 text-blue-700 border border-blue-200',
      shipped: 'bg-violet-50 text-violet-700 border border-violet-200',
      delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border border-red-200'
    };
    return colorMap[status] || 'bg-slate-50 text-slate-700 border border-slate-200';
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
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">訂單 ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客戶</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">金額</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3.5 text-xs text-slate-400 font-mono">{order.id.slice(0, 8)}…</td>
                <td className="px-6 py-3.5 text-xs text-slate-400 font-mono">{order.customer_id.slice(0, 8)}…</td>
                <td className="px-6 py-3.5 text-sm font-semibold text-slate-800">NT$ {order.amount.toLocaleString()}</td>
                <td className="px-6 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    查看詳情 →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrderId && (
        <OrderDetails
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  );
}
