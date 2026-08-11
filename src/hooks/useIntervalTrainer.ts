import { useCallback } from 'react'
import { playInterval } from '../audio/playNotes'
import { ROOT_RANGES } from '../data/storage'
import { midiToNote, randomChromaticMidi } from '../theory/notes'
import { INTERVALS } from '../theory/intervals'
import { buildOptions, pickRandom } from './quizUtils'
import { useGameSession } from './useGameSession'
import type { GameMode, QuizQuestion, UserSettings } from '../types'

const INTERVAL_POOL = INTERVALS.map((i) => i.name)

export function createIntervalQuestion(settings: UserSettings): QuizQuestion {
  const pool =
    settings.enabledIntervals.length > 0
      ? INTERVALS.filter((i) => settings.enabledIntervals.includes(i.semitones))
      : INTERVALS
  const { lo, hi } = ROOT_RANGES[settings.rootRange]
  const interval = pickRandom(pool)
  const ascending = Math.random() < 0.5
  const rootMax = Math.max(lo, hi - interval.semitones)
  const rootMin = Math.min(hi, lo + interval.semitones)
  const root = ascending ? randomChromaticMidi(lo, rootMax) : randomChromaticMidi(rootMin, hi)
  const target = ascending ? root + interval.semitones : root - interval.semitones
  return {
    notes: [midiToNote(root), midiToNote(target)],
    options: buildOptions(interval.name, INTERVAL_POOL, 4),
    correctAnswer: interval.name,
  }
}

export function useIntervalTrainer(mode: GameMode, settings: UserSettings) {
  const createQuestion = useCallback(() => createIntervalQuestion(settings), [settings])
  const playQuestion = useCallback(async (q: QuizQuestion) => {
    await playInterval(q.notes[0], q.notes[1])
  }, [])
  return useGameSession(createQuestion, mode, playQuestion, {
    standardCount: settings.standardCount,
    timedLimitSeconds: settings.timedLimitSeconds,
  })
}
