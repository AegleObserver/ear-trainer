import { joinNotes } from '../hooks/quizUtils'
import type { QuizResult } from '../types'

interface FeedbackProps {
  result: QuizResult | null
  notes: string[]
  correctAnswer: string
  formatNote?: (note: string) => string
}

export default function Feedback({ result, notes, correctAnswer, formatNote }: FeedbackProps) {
  if (!result) return <div className="min-h-16" />

  const fmt = formatNote ?? ((n: string) => n)
  const shownNotes = notes.map(fmt)

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        result.correct ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'
      }`}
    >
      <p className={`font-medium ${result.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
        {result.correct ? '✅ 正确！' : '❌ 错误。'} 正确答案是 {fmt(correctAnswer)}
      </p>
      <p className="mt-1 font-mono text-sm text-slate-300">{joinNotes(shownNotes)}</p>
    </div>
  )
}
