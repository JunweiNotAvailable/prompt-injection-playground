'use client';

interface DatabaseEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function DatabaseEditor({ content, onChange }: DatabaseEditorProps) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-2xl shadow-cyan-500/5 overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
          <span className="text-sm font-medium text-slate-200 font-mono">資料庫記錄內容</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">customer_notes</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-56 px-4 py-3 font-mono text-sm text-slate-300 bg-slate-950/50 resize-none focus:outline-none focus:bg-slate-950/70 border-none placeholder-slate-600"
        placeholder="編輯資料庫記錄內容..."
      />
      <div className="px-4 py-2.5 border-t border-slate-700/50 bg-amber-500/10">
        <p className="text-xs text-amber-400 flex items-center gap-1.5 font-mono">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          嘗試在資料庫記錄中插入惡意指令，觀察 AI 助理讀取時的反應
        </p>
      </div>
    </div>
  );
}
