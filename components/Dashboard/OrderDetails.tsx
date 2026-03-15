'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';

interface OrderDetailsProps {
  orderId: string;
  onClose: () => void;
}

export default function OrderDetails({ orderId, onClose }: OrderDetailsProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('無法取得訂單詳情');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-cyan-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 px-6 py-4 border-b border-slate-700/50 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-base font-semibold text-slate-100 font-mono flex items-center gap-2">
              <span className="text-cyan-400">▸</span>
              訂單詳情
            </h2>
            {order && <p className="text-xs text-slate-500 font-mono mt-0.5">{order.id}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-sm font-mono">載入中...</span>
            </div>
          )}
          
          {error && <div className="text-sm text-red-400 py-4 font-mono">{error}</div>}

          {order && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1 font-mono">金額</p>
                  <p className="text-xl font-bold text-emerald-400 font-mono">NT$ {order.amount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1 font-mono">狀態</p>
                  <p className="text-sm font-semibold text-cyan-400 font-mono">{order.status}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-slate-500 mb-1 font-mono">客戶 ID</p>
                  <p className="text-sm font-mono text-slate-400">{order.customer_id}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-3 font-mono uppercase tracking-wider">訂單項目</h3>
                <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-800/30">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-700/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">商品名稱</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">數量</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">單價</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">小計</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {order.items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-300">{item.product_name}</td>
                          <td className="px-4 py-3 text-sm text-slate-400 text-right font-mono">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-slate-400 text-right font-mono">NT$ {item.price.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-emerald-400 text-right font-mono">
                            NT$ {(item.quantity * item.price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
