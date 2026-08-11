import type { QuizTrainer } from '../types'
import DifficultySelector from './DifficultySelector'
import Feedback from './Feedback'
import OptionsGrid from './OptionsGrid'
import PlayArea from './PlayArea'

interface QuizLayoutProps {
  trainer: QuizTrainer
  prompt: string
}

export default function QuizLayout({ trainer, prompt }: QuizLayoutProps) {
  const { question, lastResult } = trainer

  return (
    <div className="flex flex-col gap-4">
      <DifficultySelector difficulty={trainer.difficulty} onChange={trainer.setDifficulty} />
      {question && (
        <>
          <p className="text-center text-sm text-slate-400">{prompt}</p>
          <PlayArea
            notes={question.notes}
            onNewQuestion={trainer.newQuestion}
            onReplay={trainer.replay}
          />
          <OptionsGrid
            options={question.options}
            disabled={!!lastResult}
            selectedAnswer={lastResult?.chosen ?? null}
            correctAnswer={lastResult ? question.correctAnswer : null}
            onSelect={trainer.submitAnswer}
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
