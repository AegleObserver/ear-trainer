import { useAppData } from '../context/AppDataContext'
import type { GameMode, QuizStats } from '../types'

interface ResultsScreenProps {
  mode: GameMode
  stats: QuizStats
  onRestart: () => void
}

export default function ResultsScreen({ mode, stats, onRestart }: ResultsScreenProps) {
  const { settings } = useAppData()
  const MODE_FINISH_NOTES: Record<GameMode, string> = {
    standard: `已完成 ${settings.standardCount} 题`,
    timed: '时间到，本局结束',
    endless: '已手动结束本局',
  }
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0

  return (
    <div className="panel flex flex-col items-center gap-6 p-8">
      <h3 className="text-xl font-bold">本局结算</h3>
      <p className="text-sm text-slate-400">{MODE_FINISH_NOTES[mode]}</p>

      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-xs text-slate-500">答对</p>
          <p className="text-3xl font-bold text-emerald-400">{stats.correct}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">共答</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">准确率</p>
          <p className="text-3xl font-bold text-cyan-400">
            {stats.total > 0 ? `${accuracy}%` : '—'}
          </p>
        </div>
      </div>

      <button type="button" onClick={onRestart} className="btn-primary">
        再来一局
      </button>
    </div>
  )
}
