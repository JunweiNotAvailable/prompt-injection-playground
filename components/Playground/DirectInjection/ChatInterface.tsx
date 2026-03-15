'use client';

import { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import MessageList from './MessageList';
import { ChatMessage, ToolCall } from '@/types';

interface ChatInterfaceProps {
  onToolCalls?: (toolCalls: ToolCall[]) => void;
  onAnalyze?: (userInput: string, assistantResponse: string, toolsCalled: string[], sessionId?: string) => void;
}

export default function ChatInterface({ onToolCalls, onAnalyze }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, addMessage } = useSession();

  const persistMessage = async (message: ChatMessage) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: message.session_id,
          role: message.role,
          content: message.content,
          tool_calls: message.tool_calls
        })
      });
    } catch {
      // Non-critical: don't block the UI if persistence fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !state.currentSession) return;

    setLoading(true);
    setError(null);

    const currentInput = input;
    setInput('');

    try {
      // 新增使用者訊息
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: state.currentSession.id,
        role: 'user',
        content: currentInput,
        timestamp: new Date()
      };
      addMessage(userMessage);
      persistMessage(userMessage);

      // 調用虛擬助理（附帶對話歷史）
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          session_id: state.currentSession.id,
          history: state.messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '虛擬助理回應失敗');
      }

      const data = await response.json();
      
      // 新增助理訊息
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: state.currentSession.id,
        role: 'assistant',
        content: data.response.content,
        timestamp: new Date(),
        tool_calls: data.tool_calls
      };
      addMessage(assistantMessage);
      persistMessage(assistantMessage);

      // 通知工具調用
      if (onToolCalls && data.tool_calls) {
        onToolCalls(data.tool_calls);
      }

      // 觸發分析
      if (onAnalyze) {
        const toolsCalled = data.tool_calls?.map((tc: ToolCall) => tc.name) || [];
        onAnalyze(currentInput, data.response.content, toolsCalled);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2 bg-slate-800/30">
        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        <span className="text-sm font-medium text-slate-200 font-mono">AI 客服助理</span>
        <span className="text-xs text-slate-600 font-mono ml-auto">ONLINE</span>
      </div>

      <MessageList messages={state.messages} />
      
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-mono">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="輸入訊息..."
            disabled={loading || !state.currentSession}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-950/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 placeholder:text-slate-600 text-slate-300 font-mono"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !state.currentSession}
            className="px-5 py-2.5 bg-emerald-500 text-slate-900 text-sm font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-mono"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                處理中
              </span>
            ) : '發送'}
          </button>
        </div>
      </form>
    </div>
  );
}
