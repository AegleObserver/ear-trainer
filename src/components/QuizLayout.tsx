import type { ReactNode } from 'react'
import type { GameSession } from '../types'
import Feedback from './Feedback'
import OptionsGrid from './OptionsGrid'
import PlayArea from './PlayArea'
import ResultsScreen from './ResultsScreen'
import SessionStatusBar from './SessionStatusBar'

interface QuizLayoutProps {
  session: GameSession
  prompt: string
  renderOption?: (option: string) => ReactNode
  optionsGridClass?: string
}

export default function QuizLayout({ session, prompt, renderOption, optionsGridClass }: QuizLayoutProps) {
  const { question, lastResult } = session

  return (
    <div className="flex flex-col gap-4">
      <SessionStatusBar
        mode={session.mode}
        stats={session.stats}
        timeRemaining={session.timeRemaining}
        onStop={session.stop}
      />
      {question && (
        <>
          <p className="text-center text-sm text-slate-400">{prompt}</p>
          <PlayArea
            isPlaying={session.isPlaying}
            finished={session.state === 'finished'}
            onPlay={session.state === 'finished' ? session.restart : session.replay}
          />
          <OptionsGrid
            options={question.options}
            disabled={!!lastResult || session.isPlaying}
            selectedAnswer={lastResult?.chosen ?? null}
            correctAnswer={lastResult ? question.correctAnswer : null}
            onSelect={session.submitAnswer}
            renderOption={renderOption}
            gridClass={optionsGridClass}
          />
          <Feedback
            result={lastResult}
            notes={question.notes}
            correctAnswer={question.correctAnswer}
          />
        </>
      )}
      {session.state === 'finished' && (
        <ResultsScreen mode={session.mode} stats={session.stats} />
      )}
    </div>
  )
}
