import type { GameMode } from '../types'

const GAME_MODES: { id: GameMode; label: string; hint: string }[] = [
  { id: 'standard', label: '标准', hint: '共 20 题' },
  { id: 'timed', label: '限时', hint: '2 分钟' },
  { id: 'endless', label: '无限', hint: '自由作答' },
]

interface GameModeSelectorProps {
  mode: GameMode
  onChange: (mode: GameMode) => void
}

export default function GameModeSelector({ mode, onChange }: GameModeSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-slate-500">玩法</span>
      {GAME_MODES.map((m) => {
        const isActive = mode === m.id
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            aria-current={isActive ? 'page' : undefined}
            className={
              isActive
                ? 'rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white transition-colors'
                : 'rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200'
            }
          >
            {m.label}
            <span className={`ml-1 text-xs ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
              {m.hint}
            </span>
          </button>
        )
      })}
    </div>
  )
}
