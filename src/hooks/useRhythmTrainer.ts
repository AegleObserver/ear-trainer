import { useCallback } from 'react'
import { playRhythmQuestion } from '../audio/rhythmPlay'
import { createRhythmQuestion } from '../theory/rhythm'
import { useGameSession } from './useGameSession'
import type { GameMode, QuizQuestion, UserSettings } from '../types'

export function useRhythmTrainer(mode: GameMode, settings: UserSettings) {
  const createQuestion = useCallback(() => createRhythmQuestion(), [])
  const playQuestion = useCallback(async (q: QuizQuestion) => {
    await playRhythmQuestion(q.notes)
  }, [])
  return useGameSession(createQuestion, mode, playQuestion, {
    standardCount: settings.standardCount,
    timedLimitSeconds: settings.timedLimitSeconds,
  })
}
