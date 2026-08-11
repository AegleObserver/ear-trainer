import type { Difficulty } from '../types'

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: '初级' },
  { id: 'medium', label: '中级' },
  { id: 'hard', label: '高级' },
]

interface DifficultySelectorProps {
  difficulty: Difficulty
  onChange: (difficulty: Difficulty) => void
}

export default function DifficultySelector({ difficulty, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-slate-500">难度</span>
      {DIFFICULTIES.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => onChange(d.id)}
          className={
            difficulty === d.id
              ? 'rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white transition-colors'
              : 'rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200'
          }
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}
