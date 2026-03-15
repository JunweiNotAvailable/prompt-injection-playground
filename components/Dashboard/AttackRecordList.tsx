'use client';

import { useState, useEffect } from 'react';
import { AttackRecord } from '@/types';

const PAGE_SIZE = 20;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AttackRecordList() {
  const [records, setRecords] = useState<AttackRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    fetchRecords(1);
  }, []);

  const fetchRecords = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/attack-records?page=${page}&limit=${PAGE_SIZE}`);
      if (!response.ok) {
        throw new Error('無法取得攻擊記錄');
      }
      const data = await response.json();
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchRecords(page);
  };

  const getModeText = (mode: string) => {
    return mode === 'direct' ? '直接注入' : '間接注入';
  };

  const getSeverityColor = (severity: string) => {
    const colorMap: Record<string, string> = {
      low: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      medium: 'bg-amber-50 text-amber-700 border border-amber-200',
      high: 'bg-red-50 text-red-700 border border-red-200'
    };
    return colorMap[severity] || 'bg-slate-50 text-slate-700 border border-slate-200';
  };

  const getSeverityText = (severity: string) => {
    const textMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高'
    };
    return textMap[severity] || severity;
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString('zh-TW');
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
    return <div className="text-sm text-red-600 py-4">{error}</div>;
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <p className="text-sm text-slate-400">尚無攻擊記錄</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const isExpanded = expandedIds.has(record.id);
        return (
        <div key={record.id} className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                {getModeText(record.mode)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(record.severity)}`}>
                {getSeverityText(record.severity)}風險
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                record.success
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${record.success ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                {record.success ? '注入成功' : '注入失敗'}
              </span>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{formatTimestamp(record.timestamp)}</span>
          </div>

          <div className="px-4 py-3 space-y-3 bg-white">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">分析原因</p>
              <p className="text-sm text-slate-600 leading-relaxed">{record.reason}</p>
            </div>

            {record.tools_called && record.tools_called.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">調用的工具</p>
                <div className="flex gap-1.5 flex-wrap">
                  {record.tools_called.map((tool, index) => (
                    <span key={index} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-mono">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 展開/收合原始互動內容 */}
            <button
              onClick={() => toggleExpand(record.id)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors pt-0.5"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {isExpanded ? '收起詳細內容' : '查看原始攻擊內容'}
            </button>

            {isExpanded && (
              <div className="space-y-3 pt-1 border-t border-slate-100">
                {record.user_input && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                      使用者輸入
                    </p>
                    <div className="bg-slate-50 rounded-lg px-3 py-2.5 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono border border-slate-100">
                      {record.user_input}
                    </div>
                  </div>
                )}
                {record.assistant_response && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                      AI 助理回應
                    </p>
                    <div className="bg-slate-50 rounded-lg px-3 py-2.5 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                      {record.assistant_response}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        );
      })}

      {/* 分頁控制 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            共 {pagination.total} 筆，第 {pagination.page} / {pagination.totalPages} 頁
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={pagination.page === 1 || loading}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="第一頁"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="上一頁"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* 頁碼按鈕 */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - pagination.page) <= 2)
              .map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  disabled={loading}
                  className={`min-w-[28px] h-7 px-1 rounded-md text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                    p === pagination.page
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="下一頁"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <button
              onClick={() => goToPage(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages || loading}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="最後一頁"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
