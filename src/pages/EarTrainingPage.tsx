import { useState } from 'react'
import ModeTabs from '../components/ModeTabs'
import QuizLayout from '../components/QuizLayout'
import ScoreBoard from '../components/ScoreBoard'
import { useChordTrainer } from '../hooks/useChordTrainer'
import { useIntervalTrainer } from '../hooks/useIntervalTrainer'
import { usePitchTrainer } from '../hooks/usePitchTrainer'
import type { Mode } from '../types'

const MODE_PROMPTS: Record<Mode, string> = {
  pitch: '请选择你听到的音名：',
  interval: '请选择你听到的音程：',
  chord: '请选择你听到的和弦：',
}

export default function EarTrainingPage() {
  const [mode, setMode] = useState<Mode>('pitch')

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">音感测试</h2>
        <ModeTabs activeMode={mode} onChange={setMode} />
      </div>
      <QuizPanel key={mode} mode={mode} />
    </div>
  )
}

function QuizPanel({ mode }: { mode: Mode }) {
  const trainer =
    mode === 'pitch' ? usePitchTrainer() : mode === 'interval' ? useIntervalTrainer() : useChordTrainer()

  return (
    <>
      <QuizLayout trainer={trainer} prompt={MODE_PROMPTS[mode]} />
      <div className="mt-4">
        <ScoreBoard stats={trainer.stats} onReset={trainer.resetStats} />
      </div>
    </>
  )
}
