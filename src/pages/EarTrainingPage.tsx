import { useState } from 'react'
import GameModeSelector from '../components/GameModeSelector'
import ModeTabs from '../components/ModeTabs'
import QuizLayout from '../components/QuizLayout'
import ResultsScreen from '../components/ResultsScreen'
import { useChordTrainer } from '../hooks/useChordTrainer'
import { useIntervalTrainer } from '../hooks/useIntervalTrainer'
import { usePitchTrainer } from '../hooks/usePitchTrainer'
import type { GameMode, Mode } from '../types'

const MODE_PROMPTS: Record<Mode, string> = {
  pitch: '请选择你听到的音名：',
  interval: '请选择你听到的音程：',
  chord: '请选择你听到的和弦：',
}

export default function EarTrainingPage() {
  const [questionType, setQuestionType] = useState<Mode>('pitch')
  const [gameMode, setGameMode] = useState<GameMode>('standard')

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">音感测试</h2>
        <ModeTabs activeMode={questionType} onChange={setQuestionType} />
      </div>
      <div className="mb-4">
        <GameModeSelector mode={gameMode} onChange={setGameMode} />
      </div>
      <SessionPanel key={`${questionType}:${gameMode}`} questionType={questionType} gameMode={gameMode} />
    </div>
  )
}

function SessionPanel({ questionType, gameMode }: { questionType: Mode; gameMode: GameMode }) {
  const session =
    questionType === 'pitch'
      ? usePitchTrainer(gameMode)
      : questionType === 'interval'
        ? useIntervalTrainer(gameMode)
        : useChordTrainer(gameMode)

  if (session.state === 'finished') {
    return <ResultsScreen mode={session.mode} stats={session.stats} onRestart={session.restart} />
  }

  return <QuizLayout session={session} prompt={MODE_PROMPTS[questionType]} />
}
