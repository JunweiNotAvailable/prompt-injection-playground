'use client';

interface EmailEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function EmailEditor({ content, onChange }: EmailEditorProps) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <span className="text-sm font-medium text-slate-200 font-mono">電子郵件內容</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">.eml</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-56 px-4 py-3 font-mono text-sm text-slate-300 bg-slate-950/50 resize-none focus:outline-none focus:bg-slate-950/70 border-none placeholder-slate-600"
        placeholder="編輯電子郵件內容..."
      />
      <div className="px-4 py-2.5 border-t border-slate-700/50 bg-amber-500/10">
        <p className="text-xs text-amber-400 flex items-center gap-1.5 font-mono">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          嘗試在郵件內容中插入惡意指令，觀察 AI 助理的反應
        </p>
      </div>
    </div>
  );
}
