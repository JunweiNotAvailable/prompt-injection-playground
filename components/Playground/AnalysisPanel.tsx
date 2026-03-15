'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { AttackRecord } from '@/types';

interface AnalysisPanelProps {
  userInput: string;
  assistantResponse: string;
  toolsCalled: string[];
  mode: 'direct' | 'indirect';
  /** Explicit session ID — used by indirect injection which manages its own temp session */
  sessionId?: string;
}

export default function AnalysisPanel({ userInput, assistantResponse, toolsCalled, mode, sessionId: propSessionId }: AnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AttackRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, addAttackRecord } = useSession();
  // Prevent double-call in React Strict Mode / double renders
  const lastAnalyzedKey = useRef<string>('');

  useEffect(() => {
    const sessionId = propSessionId ?? state.currentSession?.id;
    const key = `${userInput}||${assistantResponse}`;
    if (userInput && assistantResponse && sessionId && key !== lastAnalyzedKey.current) {
      lastAnalyzedKey.current = key;
      analyzeAttack(sessionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, assistantResponse, propSessionId]);

  const analyzeAttack = async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_input: userInput,
          assistant_response: assistantResponse,
          tools_called: toolsCalled,
          mode,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('分析失敗');
      }

      const data = await response.json();
      setAnalysis(data.record);
      addAttackRecord(data.record);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const panelHeader = (
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
      <h3 className="text-sm font-semibold text-slate-700">注入分析</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {panelHeader}
        <div className="px-4 py-6 flex items-center justify-center gap-2 text-slate-400">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-sm">分析中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {panelHeader}
        <div className="px-4 py-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {panelHeader}
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-slate-400">等待分析結果...</p>
        </div>
      </div>
    );
  }

  const severityConfig = {
    low: { label: '低風險', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    medium: { label: '中風險', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    high: { label: '高風險', className: 'bg-red-50 text-red-700 border-red-200' }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {panelHeader}

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1.5">攻擊結果</p>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              analysis.success
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${analysis.success ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              {analysis.success ? '注入成功' : '注入失敗'}
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1.5">嚴重程度</p>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${severityConfig[analysis.severity].className}`}>
              {severityConfig[analysis.severity].label}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">分析原因</p>
          <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed">
            {analysis.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
