import type { GameSession } from '../types'
import Feedback from './Feedback'
import OptionsGrid from './OptionsGrid'
import PlayArea from './PlayArea'
import SessionStatusBar from './SessionStatusBar'

interface QuizLayoutProps {
  session: GameSession
  prompt: string
}

export default function QuizLayout({ session, prompt }: QuizLayoutProps) {
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
          <PlayArea notes={question.notes} onReplay={session.replay} />
          <OptionsGrid
            options={question.options}
            disabled={!!lastResult}
            selectedAnswer={lastResult?.chosen ?? null}
            correctAnswer={lastResult ? question.correctAnswer : null}
            onSelect={session.submitAnswer}
          />
          <Feedback
            result={lastResult}
            notes={question.notes}
            correctAnswer={question.correctAnswer}
          />
        </>
      )}
    </div>
  )
}
