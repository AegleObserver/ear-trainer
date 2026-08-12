import { useEffect, useRef, useState } from 'react'
import GameModeSelector from '../components/GameModeSelector'
import QuizLayout from '../components/QuizLayout'
import ResultsScreen from '../components/ResultsScreen'
import RhythmPatternView from '../components/RhythmPatternView'
import { useAppData } from '../context/AppDataContext'
import { useRhythmTrainer } from '../hooks/useRhythmTrainer'
import { FIGURE_BY_LABEL, figuresToNoteLabels } from '../theory/rhythm'
import type { GameMode } from '../types'

const PROMPT = '请选择你听到的节奏型：'

export default function RhythmTestPage() {
  const [gameMode, setGameMode] = useState<GameMode>('standard')

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
        <GameModeSelector mode={gameMode} onChange={setGameMode} />
      </div>
      <SessionPanel key={gameMode} gameMode={gameMode} />
    </div>
  )
}

function SessionPanel({ gameMode }: { gameMode: GameMode }) {
  const { settings, addRecord } = useAppData()
  const savedRef = useRef(false)
  const session = useRhythmTrainer(gameMode, settings)

  useEffect(() => {
    if (session.state === 'finished' && !savedRef.current) {
      savedRef.current = true
      addRecord({
        questionType: 'rhythm',
        mode: session.mode,
        correct: session.stats.correct,
        total: session.stats.total,
      })
    }
    if (session.state === 'playing') {
      savedRef.current = false
    }
  }, [session.state, session.stats, session.mode, addRecord])

  if (session.state === 'finished') {
    return <ResultsScreen mode={session.mode} stats={session.stats} onRestart={session.restart} />
  }

  return (
    <QuizLayout
      session={session}
      prompt={PROMPT}
      optionsGridClass="grid grid-cols-1 gap-3"
      renderOption={(opt) => (
        <div className="flex flex-col items-center gap-1">
          <RhythmPatternView labels={figuresToNoteLabels(opt.split('·').map((l) => FIGURE_BY_LABEL[l]))} />
          <span className="text-xs text-slate-500">{opt}</span>
        </div>
      )}
    />
  )
}
