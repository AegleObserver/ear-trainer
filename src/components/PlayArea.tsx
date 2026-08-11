import { joinNotes } from '../hooks/quizUtils'

interface PlayAreaProps {
  notes: string[]
  onNewQuestion: () => void
  onReplay: () => void
}

export default function PlayArea({ notes, onNewQuestion, onReplay }: PlayAreaProps) {
  return (
    <div className="panel flex flex-col items-center gap-3 p-6">
      <p className="font-mono text-2xl tracking-widest text-slate-100">{joinNotes(notes)}</p>
      <p className="text-xs text-slate-500">当前题目 · 开发预览（音频模块待接入）</p>
      <div className="flex gap-3">
        <button type="button" onClick={onNewQuestion} className="btn-primary">
          新题目
        </button>
        <button type="button" onClick={onReplay} disabled title="音频模块待接入" className="btn-ghost">
          重播
        </button>
      </div>
    </div>
  )
}
