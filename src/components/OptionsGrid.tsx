interface OptionsGridProps {
  options: string[]
  disabled: boolean
  selectedAnswer: string | null
  correctAnswer: string | null
  onSelect: (option: string) => void
}

export default function OptionsGrid({
  options,
  disabled,
  selectedAnswer,
  correctAnswer,
  onSelect,
}: OptionsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((opt) => {
        const isCorrect = disabled && opt === correctAnswer
        const isWrongSelected = disabled && opt === selectedAnswer && opt !== correctAnswer
        const className = isCorrect
          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
          : isWrongSelected
            ? 'border-rose-400 bg-rose-500/20 text-rose-300'
            : disabled
              ? 'cursor-not-allowed border-slate-800 bg-slate-900 text-slate-600'
              : 'border-slate-700 bg-slate-800/60 text-slate-200 hover:border-cyan-500 hover:bg-slate-700/60'
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            disabled={disabled}
            className={`rounded-xl border px-4 py-3 font-medium transition-colors ${className}`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
