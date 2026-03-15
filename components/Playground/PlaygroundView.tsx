'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useSession } from '@/contexts/SessionContext';
import ModeSelector from './ModeSelector';
import ChatInterface from './DirectInjection/ChatInterface';
import DataSourceSelector from './IndirectInjection/DataSourceSelector';
import EmailEditor from './IndirectInjection/EmailEditor';
import DatabaseEditor from './IndirectInjection/DatabaseEditor';
import ProcessButton from './IndirectInjection/ProcessButton';
import ToolCallDisplay from './ToolCallDisplay';
import AnalysisPanel from './AnalysisPanel';
import PromptEditor from './PromptEditor';
import { Session, ToolCall } from '@/types';

const LAST_SESSION_KEY = 'lastDirectSessionId';

export default function PlaygroundView() {
  const { state: appState } = useApp();
  const { state: sessionState, setSession, setMessages, clearMessages } = useSession();
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [analysisData, setAnalysisData] = useState<{
    userInput: string;
    assistantResponse: string;
    toolsCalled: string[];
    sessionId?: string;
  } | null>(null);

  // 會話選擇器狀態
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 間接注入狀態
  const [dataSource, setDataSource] = useState<'email' | 'database'>('email');
  const [emailContent, setEmailContent] = useState(
    '親愛的客服，\n\n我想查詢我的訂單狀態。\n\n謝謝！'
  );
  const [databaseContent, setDatabaseContent] = useState(
    '客戶備註：請盡快處理此訂單'
  );

  // 持久化當前會話 ID 到 localStorage
  const persistSessionId = (id: string) => {
    try { localStorage.setItem(LAST_SESSION_KEY, id); } catch { /* ignore */ }
  };

  // 建立新會話
  const createNewSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: appState.currentMode })
      });

      if (!response.ok) throw new Error('建立會話失敗');

      const data = await response.json();
      setSession(data.session);
      clearMessages();
      setToolCalls([]);
      setAnalysisData(null);
      setSessionDropdownOpen(false);

      if (appState.currentMode === 'direct') {
        persistSessionId(data.session.id);
        fetchPastSessions();
      }
    } catch (error) {
      console.error('建立會話錯誤:', error);
      alert('無法建立新會話');
    }
  };

  // 載入過去的直接注入會話列表
  const fetchPastSessions = async () => {
    try {
      const res = await fetch('/api/sessions?mode=direct&limit=20');
      if (!res.ok) return;
      const data = await res.json();
      setPastSessions(data.sessions ?? []);
    } catch { /* ignore */ }
  };

  // 繼續某個舊會話（載入會話本體 + 歷史訊息）
  const resumeSession = async (session: Session) => {
    if (session.id === sessionState.currentSession?.id) {
      setSessionDropdownOpen(false);
      return;
    }
    setLoadingSession(true);
    setSessionDropdownOpen(false);
    try {
      const [msgRes] = await Promise.all([
        fetch(`/api/messages?session_id=${session.id}`)
      ]);
      if (!msgRes.ok) throw new Error('無法載入訊息');
      const msgData = await msgRes.json();

      clearMessages();
      setSession(session);
      setMessages(msgData.messages ?? []);
      setToolCalls([]);
      setAnalysisData(null);
      persistSessionId(session.id);
    } catch (error) {
      console.error('載入會話錯誤:', error);
      alert('無法載入會話訊息');
    } finally {
      setLoadingSession(false);
    }
  };

  // 刪除會話
  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm('確定要刪除此會話嗎？相關的訊息與攻擊記錄也會一併刪除。')) return;

    setDeletingId(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('刪除失敗');

      setPastSessions(prev => prev.filter(s => s.id !== sessionId));

      // If the deleted session was active, start fresh
      if (sessionId === sessionState.currentSession?.id) {
        try { localStorage.removeItem(LAST_SESSION_KEY); } catch { /* ignore */ }
        await createNewSession();
      }
    } catch (error) {
      console.error('刪除會話錯誤:', error);
      alert('無法刪除會話');
    } finally {
      setDeletingId(null);
    }
  };

  // 初始化：僅直接注入模式需要建立/恢復會話
  useEffect(() => {
    const init = async () => {
      // Indirect injection is sessionless — nothing to init
      if (appState.currentMode !== 'direct') return;

      fetchPastSessions();

      // Try to restore the last direct session from localStorage
      const savedId = (() => { try { return localStorage.getItem(LAST_SESSION_KEY); } catch { return null; } })();
      if (savedId) {
        try {
          const [sessRes, msgRes] = await Promise.all([
            fetch(`/api/sessions/${savedId}`),
            fetch(`/api/messages?session_id=${savedId}`)
          ]);
          if (sessRes.ok && msgRes.ok) {
            const sessData = await sessRes.json();
            const msgData = await msgRes.json();
            setSession(sessData.session);
            setMessages(msgData.messages ?? []);
            return;
          }
        } catch { /* fall through to create new */ }
      }

      await createNewSession();
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 點擊下拉選單外部時關閉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSessionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolCalls = (calls: ToolCall[]) => setToolCalls(calls);
  const handleAnalyze = (userInput: string, assistantResponse: string, toolsCalled: string[], sessionId?: string) => {
    setAnalysisData({ userInput, assistantResponse, toolsCalled, sessionId });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 relative">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <span className="text-emerald-400 font-mono">[</span>
            提示注入測試
            <span className="text-emerald-400 font-mono">]</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-mono flex items-center gap-2">
            <span className="text-cyan-500">›</span>
            在安全環境中測試 AI 助理的提示注入行為
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 繼續舊會話 — 僅在直接注入模式顯示 */}
          {appState.currentMode === 'direct' && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  fetchPastSessions();
                  setSessionDropdownOpen(v => !v);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-lg border border-slate-700/50 hover:bg-slate-700/50 hover:border-cyan-500/30 transition-all shadow-lg backdrop-blur-sm font-mono"
              >
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                切換會話
                <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${sessionDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {sessionDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl shadow-emerald-500/10 z-50 overflow-hidden backdrop-blur-md">
                  <div className="px-3 py-2 border-b border-slate-700/50 bg-slate-800/50">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">近期直接注入會話</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {pastSessions.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-500 font-mono">尚無歷史會話</p>
                    ) : (
                      pastSessions.map(s => {
                        const isActive = s.id === sessionState.currentSession?.id;
                        const isDeleting = deletingId === s.id;
                        return (
                          <div
                            key={s.id}
                            className={`flex items-center gap-1 border-b border-slate-800/50 last:border-0 ${
                              isActive ? 'bg-emerald-500/10' : 'hover:bg-slate-800/50'
                            }`}
                          >
                            <button
                              onClick={() => resumeSession(s)}
                              disabled={isDeleting}
                              className="flex-1 text-left px-4 py-2.5 flex items-center gap-3 min-w-0"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-mono text-xs truncate ${isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                    {s.id.slice(0, 8)}…
                                  </span>
                                  {isActive && (
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 flex-shrink-0 font-mono">ACTIVE</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-slate-500 font-mono">
                                    {new Date(s.start_time).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className={`text-xs font-mono ${(s.message_count ?? 0) > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                                    {s.message_count ?? 0} MSG
                                  </span>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={(e) => deleteSession(e, s.id)}
                              disabled={isDeleting}
                              title="刪除此會話"
                              className="p-2 mr-1 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                            >
                              {isDeleting ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={createNewSession}
            disabled={loadingSession}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-900 text-sm font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-all font-mono"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            開始新會話
          </button>
        </div>
      </div>

      <ModeSelector />

      {loadingSession && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 font-mono shadow-lg shadow-cyan-500/10">
          <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          載入會話訊息中…
        </div>
      )}

      {/* 提示詞編輯器 */}
      <div className="mb-6">
        <PromptEditor mode={appState.currentMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {appState.currentMode === 'direct' ? (
            <ChatInterface onToolCalls={handleToolCalls} onAnalyze={handleAnalyze} />
          ) : (
            <div className="space-y-4">
              <DataSourceSelector selected={dataSource} onSelect={setDataSource} />
              
              {dataSource === 'email' ? (
                <EmailEditor content={emailContent} onChange={setEmailContent} />
              ) : (
                <DatabaseEditor content={databaseContent} onChange={setDatabaseContent} />
              )}
              
              <ProcessButton
                dataSource={dataSource}
                content={dataSource === 'email' ? emailContent : databaseContent}
                onToolCalls={handleToolCalls}
                onAnalyze={handleAnalyze}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ToolCallDisplay toolCalls={toolCalls} />
          
          {analysisData && (
            <AnalysisPanel
              userInput={analysisData.userInput}
              assistantResponse={analysisData.assistantResponse}
              toolsCalled={analysisData.toolsCalled}
              mode={appState.currentMode}
              sessionId={analysisData.sessionId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
