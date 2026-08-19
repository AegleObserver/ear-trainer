import { useCallback, useEffect, useRef, useState } from 'react'
import GameModeSelector from '../components/GameModeSelector'
import ModeTabs from '../components/ModeTabs'
import QuizLayout from '../components/QuizLayout'
import { useAppData } from '../context/AppDataContext'
import { useChordTrainer } from '../hooks/useChordTrainer'
import { useIntervalTrainer } from '../hooks/useIntervalTrainer'
import { usePitchTrainer } from '../hooks/usePitchTrainer'
import { formatNoteName } from '../theory/notes'
import type { GameMode, Mode } from '../types'

const MODE_PROMPTS: Record<Mode, string> = {
  pitch: '请选择你听到的音名：',
  interval: '请选择你听到的音程：',
  chord: '请选择你听到的和弦：',
  rhythm: '请选择你听到的节奏型：',
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
  const { settings, addRecord } = useAppData()
  const savedRef = useRef(false)

  const formatNote = useCallback(
    (n: string) => formatNoteName(n, settings.blackKeyMode),
    [settings.blackKeyMode],
  )

  const session =
    questionType === 'pitch'
      ? usePitchTrainer(gameMode, settings)
      : questionType === 'interval'
        ? useIntervalTrainer(gameMode, settings)
        : useChordTrainer(gameMode, settings)

  useEffect(() => {
    if (session.state === 'finished' && !savedRef.current) {
      savedRef.current = true
      addRecord({
        questionType,
        mode: session.mode,
        correct: session.stats.correct,
        total: session.stats.total,
      })
    }
    if (session.state === 'playing') {
      savedRef.current = false
    }
  }, [session.state, session.stats, session.mode, questionType, addRecord])

  return (
    <QuizLayout
      session={session}
      prompt={MODE_PROMPTS[questionType]}
      renderOption={questionType === 'pitch' ? formatNote : undefined}
      formatNote={formatNote}
    />
  )
}
