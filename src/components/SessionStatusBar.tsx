import { useAppData } from '../context/AppDataContext'
import type { GameMode, QuizStats } from '../types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface SessionStatusBarProps {
  mode: GameMode
  stats: QuizStats
  timeRemaining: number | null
  onStop: () => void
}

export default function SessionStatusBar({ mode, stats, timeRemaining, onStop }: SessionStatusBarProps) {
  const { settings } = useAppData()
  return (
    <div className="panel flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-6">
        {mode === 'standard' && (
          <>
            <div>
              <p className="text-xs text-slate-500">题目进度</p>
              <p className="text-lg font-bold">
                {stats.total} / {settings.standardCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">答对</p>
              <p className="text-lg font-bold">{stats.correct}</p>
            </div>
          </>
        )}
        {mode === 'timed' && (
          <>
            <div>
              <p className="text-xs text-slate-500">剩余时间</p>
              <p className={`font-mono text-lg font-bold ${(timeRemaining ?? 0) <= 30 ? 'text-rose-400' : ''}`}>
                ⏱ {formatTime(timeRemaining ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">已答</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">答对</p>
              <p className="text-lg font-bold">{stats.correct}</p>
            </div>
          </>
        )}
        {mode === 'endless' && (
          <>
            <div>
              <p className="text-xs text-slate-500">已答</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">答对</p>
              <p className="text-lg font-bold">{stats.correct}</p>
            </div>
          </>
        )}
      </div>
      {mode === 'endless' && (
        <button type="button" onClick={onStop} className="btn-ghost text-sm text-rose-300">
          停止
        </button>
      )}
    </div>
  )
}
