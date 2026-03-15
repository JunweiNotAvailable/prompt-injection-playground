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
      pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      processing: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      shipped: 'bg-violet-500/10 text-violet-400 border border-violet-500/30',
      delivered: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      cancelled: 'bg-red-500/10 text-red-400 border border-red-500/30'
    };
    return colorMap[status] || 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-2 text-slate-500">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="text-sm font-mono">載入中...</span>
      </div>
    );
  }

  if (error) {
    return <div className="px-6 py-4 text-sm text-red-400 font-mono">{error}</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">訂單 ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">客戶</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">金額</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-3.5 text-xs text-slate-500 font-mono">{order.id.slice(0, 8)}…</td>
                <td className="px-6 py-3.5 text-xs text-slate-500 font-mono">{order.customer_id.slice(0, 8)}…</td>
                <td className="px-6 py-3.5 text-sm font-semibold text-slate-200 font-mono">NT$ {order.amount.toLocaleString()}</td>
                <td className="px-6 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium font-mono ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
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
