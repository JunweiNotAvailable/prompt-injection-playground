'use client';

import { ToolCall } from '@/types';
import { useState } from 'react';

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
}

export default function ToolCallDisplay({ toolCalls }: ToolCallDisplayProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (toolCalls.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-2xl shadow-emerald-500/5 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-200 font-mono">工具調用</h3>
        </div>
        <p className="text-xs text-slate-500 text-center py-4 font-mono">尚未調用任何工具</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-200 font-mono">工具調用</h3>
        </div>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">{toolCalls.length}</span>
      </div>
      <div className="divide-y divide-slate-700/50">
        {toolCalls.map((toolCall, index) => (
          <div key={index}>
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full px-4 py-3 hover:bg-slate-800/50 text-left flex justify-between items-center transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">{index + 1}</span>
                <span className="text-sm font-medium text-slate-300 font-mono">{toolCall.name}</span>
              </div>
              <svg className={`w-4 h-4 text-slate-500 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {expandedIndex === index && (
              <div className="px-4 pb-4 space-y-3 bg-slate-800/30">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 font-mono">參數</h4>
                  <pre className="text-xs bg-slate-950/50 border border-slate-700/50 p-3 rounded-lg overflow-x-auto text-slate-300 leading-relaxed font-mono">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5 font-mono">結果</h4>
                  <pre className="text-xs bg-slate-950/50 border border-slate-700/50 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto text-slate-300 leading-relaxed font-mono">
                    {JSON.stringify(toolCall.result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
