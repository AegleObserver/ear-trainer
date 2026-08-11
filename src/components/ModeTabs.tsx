import type { Mode } from '../types'

const MODES: { id: Mode; label: string }[] = [
  { id: 'pitch', label: '音名识别' },
  { id: 'interval', label: '音程识别' },
  { id: 'chord', label: '和弦识别' },
]

interface ModeTabsProps {
  activeMode: Mode
  onChange: (mode: Mode) => void
}

export default function ModeTabs({ activeMode, onChange }: ModeTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-900 p-1">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          aria-current={activeMode === m.id ? 'page' : undefined}
          className={
            activeMode === m.id
              ? 'rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors'
              : 'rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200'
          }
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
