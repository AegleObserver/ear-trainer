import type { QuizStats } from '../types'

interface ScoreBoardProps {
  stats: QuizStats
  onReset: () => void
}

export default function ScoreBoard({ stats, onReset }: ScoreBoardProps) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null
  return (
    <div className="panel flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs text-slate-500">得分</p>
          <p className="text-lg font-bold">
            {stats.correct} / {stats.total}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">准确率</p>
          <p className="text-lg font-bold">{accuracy === null ? '—' : `${accuracy}%`}</p>
        </div>
      </div>
      <button type="button" onClick={onReset} className="btn-ghost text-sm">
        重置统计
      </button>
    </div>
  )
}
