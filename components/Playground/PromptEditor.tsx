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
  const [formData, setFormData] = useState({ name: '', content: '' });
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

  const handleCreate = () => {
    setEditingPrompt(null);
    setFormData({ name: '', content: '' });
    setIsOpen(true);
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({ name: prompt.name, content: prompt.content });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('請填寫所有欄位');
      return;
    }

    setSaving(true);
    try {
      if (editingPrompt) {
        // 更新現有提示詞
        const response = await fetch(`/api/prompts/${editingPrompt.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('更新失敗');
      } else {
        // 建立新提示詞
        const promptMode = mode === 'direct' ? 'direct' : 'indirect_email';
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, mode: promptMode })
        });

        if (!response.ok) throw new Error('建立失敗');
      }

      await fetchPrompts();
      setIsOpen(false);
      setFormData({ name: '', content: '' });
    } catch (error) {
      console.error('儲存提示詞錯誤:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (prompt: Prompt) => {
    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true })
      });

      if (!response.ok) throw new Error('啟用失敗');
      await fetchPrompts();
    } catch (error) {
      console.error('啟用提示詞錯誤:', error);
      alert('啟用失敗');
    }
  };

  const handleDelete = async (prompt: Prompt) => {
    if (prompt.is_active) {
      alert('無法刪除啟用中的提示詞');
      return;
    }

    if (!confirm('確定要刪除此提示詞嗎？')) return;

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('刪除失敗');
      await fetchPrompts();
    } catch (error) {
      console.error('刪除提示詞錯誤:', error);
      alert('刪除失敗');
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
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">系統提示詞設定</h3>
          <p className="text-xs text-slate-500 mt-0.5">自訂助理的行為指令以測試防禦效果</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新增提示詞
        </button>
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
                className={`p-3 rounded-lg border ${
                  prompt.is_active
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-slate-900 truncate">
                        {prompt.name}
                      </h4>
                      {prompt.is_active && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          啟用中
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getModeLabel(prompt.mode)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!prompt.is_active && (
                      <button
                        onClick={() => handleActivate(prompt)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="啟用此提示詞"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(prompt)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      title="編輯"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    {!prompt.is_active && (
                      <button
                        onClick={() => handleDelete(prompt)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="刪除"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {prompt.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 編輯/新增對話框 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingPrompt ? '編輯提示詞' : '新增提示詞'}
              </h3>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    名稱
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="例如：防禦型提示詞"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    提示詞內容
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                    placeholder="輸入系統提示詞..."
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    這段文字將作為系統提示詞傳送給 AI 助理
                  </p>
                </div>
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
