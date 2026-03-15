'use client';

import { useState, useEffect } from 'react';
import { Prompt } from '@/types';

interface PromptEditorProps {
  mode: 'direct' | 'indirect';
}

export default function PromptEditor({ mode }: PromptEditorProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState({ content: '' });
  const [saving, setSaving] = useState(false);

  // 根據模式決定要顯示的提示詞類型
  const promptModes = mode === 'direct' 
    ? ['direct'] 
    : ['indirect_email', 'indirect_database'];

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all(
        promptModes.map(m => fetch(`/api/prompts?mode=${m}`))
      );
      const data = await Promise.all(responses.map(r => r.json()));
      const allPrompts = data.flatMap(d => d.prompts || []);
      setPrompts(allPrompts);
    } catch (error) {
      console.error('載入提示詞錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({ content: prompt.content });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.content.trim()) {
      alert('請填寫提示詞內容');
      return;
    }

    if (!editingPrompt) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/prompts/${editingPrompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formData.content })
      });

      if (!response.ok) throw new Error('更新失敗');

      await fetchPrompts();
      setIsOpen(false);
      setFormData({ content: '' });
    } catch (error) {
      console.error('儲存提示詞錯誤:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const getModeLabel = (promptMode: string) => {
    const labels: Record<string, string> = {
      direct: '直接注入',
      indirect_email: '間接注入（電子郵件）',
      indirect_database: '間接注入（資料庫）'
    };
    return labels[promptMode] || promptMode;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">系統提示詞設定</h3>
        <p className="text-xs text-slate-500 mt-0.5">編輯助理的行為指令以測試防禦效果</p>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : prompts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">尚無提示詞</p>
        ) : (
          <div className="space-y-3">
            {prompts.map(prompt => (
              <div
                key={prompt.id}
                className="p-3 rounded-lg border border-indigo-200 bg-indigo-50"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-slate-900">
                        {getModeLabel(prompt.mode)}
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        使用中
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(prompt)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="編輯提示詞"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {prompt.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 編輯對話框 */}
      {isOpen && editingPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                編輯提示詞
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {getModeLabel(editingPrompt.mode)}
              </p>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  提示詞內容
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ content: e.target.value })}
                  rows={14}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  placeholder="輸入系統提示詞..."
                />
                <p className="mt-2 text-xs text-slate-500">
                  這段文字將作為系統提示詞傳送給 AI 助理。你可以修改它來測試不同的防禦策略。
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
