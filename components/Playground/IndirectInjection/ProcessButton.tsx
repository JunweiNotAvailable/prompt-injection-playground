'use client';

import { useState } from 'react';
import { ToolCall } from '@/types';

interface ProcessButtonProps {
  dataSource: string;
  content: string;
  onToolCalls?: (toolCalls: ToolCall[]) => void;
  /** sessionId is passed back so AnalysisPanel can record against the correct temp session */
  onAnalyze?: (userInput: string, assistantResponse: string, toolsCalled: string[], sessionId: string) => void;
}

export default function ProcessButton({ dataSource, content, onToolCalls, onAnalyze }: ProcessButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Create a throwaway session for this single indirect injection attempt
      const sessRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'indirect' })
      });
      if (!sessRes.ok) throw new Error('無法建立處理會話');
      const sessData = await sessRes.json();
      const tempSessionId: string = sessData.session.id;

      const response = await fetch('/api/assistant/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_source: dataSource,
          content,
          session_id: tempSessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '處理失敗');
      }

      const data = await response.json();
      setResult(data.response.content);

      if (onToolCalls && data.tool_calls) {
        onToolCalls(data.tool_calls);
      }

      if (onAnalyze) {
        const toolsCalled = data.tool_calls?.map((tc: ToolCall) => tc.name) || [];
        onAnalyze(content, data.response.content, toolsCalled, tempSessionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleProcess}
        disabled={loading || !content.trim()}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-slate-900 text-sm font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-mono"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            處理中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            觸發 AI 助理處理
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm flex items-start gap-2 font-mono">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {result && (
        <div className="mt-3 bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden backdrop-blur-sm">
          <div className="px-4 py-2.5 border-b border-slate-700/50 bg-slate-800/30">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider font-mono">AI 助理回應</span>
          </div>
          <div className="px-4 py-3">
            <p className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-mono">{result}</p>
          </div>
        </div>
      )}
    </div>
  );
}
