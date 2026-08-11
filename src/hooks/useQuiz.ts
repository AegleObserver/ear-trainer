import { useCallback, useRef, useState } from 'react'
import type { Difficulty, QuizQuestion, QuizResult, QuizStats, QuizTrainer } from '../types'

export function useQuiz(createQuestion: (difficulty: Difficulty) => QuizQuestion): QuizTrainer {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [question, setQuestion] = useState<QuizQuestion | null>(() => createQuestion('easy'))
  const [lastResult, setLastResult] = useState<QuizResult | null>(null)
  const [stats, setStats] = useState<QuizStats>({ total: 0, correct: 0 })
  const answeredRef = useRef(false)

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!question || answeredRef.current) return
      answeredRef.current = true
      const correct = answer === question.correctAnswer
      setLastResult({ chosen: answer, correct })
      setStats((s) => ({
        total: s.total + 1,
        correct: s.correct + (correct ? 1 : 0),
      }))
    },
    [question],
  )

  const newQuestion = useCallback(() => {
    setQuestion(createQuestion(difficulty))
    setLastResult(null)
    answeredRef.current = false
  }, [difficulty, createQuestion])

  const setNewDifficulty = useCallback(
    (d: Difficulty) => {
      setDifficulty(d)
      setQuestion(createQuestion(d))
      setLastResult(null)
      setStats({ total: 0, correct: 0 })
      answeredRef.current = false
    },
    [createQuestion],
  )

  const resetStats = useCallback(() => setStats({ total: 0, correct: 0 }), [])

  const replay = useCallback(() => {
    // 音频引擎待接入
  }, [])

  return {
    difficulty,
    question,
    lastResult,
    stats,
    isPlaying: false,
    newQuestion,
    replay,
    submitAnswer,
    setDifficulty: setNewDifficulty,
    resetStats,
  }
}
