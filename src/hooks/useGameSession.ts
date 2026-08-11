import { useCallback, useEffect, useRef, useState } from 'react'
import { FEEDBACK_DELAY_MS, STANDARD_QUESTION_COUNT, TIMED_LIMIT_SECONDS } from '../constants/gameConfig'
import type { GameMode, GameSession, GameSessionState, QuizQuestion, QuizResult, QuizStats } from '../types'

export function useGameSession(
  createQuestion: () => QuizQuestion,
  mode: GameMode,
): GameSession {
  const [state, setState] = useState<GameSessionState>('playing')
  const [question, setQuestion] = useState<QuizQuestion | null>(() => createQuestion())
  const [lastResult, setLastResult] = useState<QuizResult | null>(null)
  const [stats, setStats] = useState<QuizStats>({ total: 0, correct: 0 })
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    mode === 'timed' ? TIMED_LIMIT_SECONDS : null,
  )
  const answeredRef = useRef(false)
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef<GameSessionState>('playing')
  stateRef.current = state

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
  }, [])

  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer])

  const submitAnswer = useCallback(
    (answer: string) => {
      if (stateRef.current !== 'playing' || !question || answeredRef.current) return
      answeredRef.current = true
      const correct = answer === question.correctAnswer
      setLastResult({ chosen: answer, correct })
      const newTotal = stats.total + 1
      setStats({ total: newTotal, correct: stats.correct + (correct ? 1 : 0) })

      if (mode === 'standard' && newTotal >= STANDARD_QUESTION_COUNT) {
        setState('finished')
        return
      }

      clearAdvanceTimer()
      advanceTimerRef.current = setTimeout(() => {
        if (stateRef.current !== 'playing') return
        setQuestion(createQuestion())
        setLastResult(null)
        answeredRef.current = false
      }, FEEDBACK_DELAY_MS)
    },
    [question, stats, mode, createQuestion, clearAdvanceTimer],
  )

  useEffect(() => {
    if (mode !== 'timed' || state !== 'playing') return
    const timer = setInterval(() => {
      setTimeRemaining((remaining) => {
        if (remaining === null) return null
        if (remaining <= 1) {
          setState('finished')
          return 0
        }
        return remaining - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [mode, state])

  const stop = useCallback(() => {
    clearAdvanceTimer()
    if (stateRef.current === 'playing') setState('finished')
  }, [clearAdvanceTimer])

  const restart = useCallback(() => {
    clearAdvanceTimer()
    setState('playing')
    setQuestion(createQuestion())
    setLastResult(null)
    setStats({ total: 0, correct: 0 })
    setTimeRemaining(mode === 'timed' ? TIMED_LIMIT_SECONDS : null)
    answeredRef.current = false
  }, [mode, createQuestion, clearAdvanceTimer])

  const replay = useCallback(() => {
    // 音频引擎待接入
  }, [])

  return {
    mode,
    state,
    question,
    lastResult,
    stats,
    timeRemaining,
    submitAnswer,
    stop,
    restart,
    replay,
  }
}
