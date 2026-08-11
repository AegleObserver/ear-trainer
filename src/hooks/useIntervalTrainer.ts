import { midiToNote, randomChromaticMidi } from '../theory/notes'
import { INTERVALS } from '../theory/intervals'
import { buildOptions, pickRandom } from './quizUtils'
import { useGameSession } from './useGameSession'
import type { GameMode, QuizQuestion } from '../types'

const INTERVAL_POOL = INTERVALS.map((i) => i.name)

export function createIntervalQuestion(): QuizQuestion {
  const interval = pickRandom(INTERVALS)
  const ascending = Math.random() < 0.5
  const root = ascending
    ? randomChromaticMidi(48, 84 - interval.semitones)
    : randomChromaticMidi(48 + interval.semitones, 84)
  const target = ascending ? root + interval.semitones : root - interval.semitones
  return {
    notes: [midiToNote(root), midiToNote(target)],
    options: buildOptions(interval.name, INTERVAL_POOL, 4),
    correctAnswer: interval.name,
  }
}

export function useIntervalTrainer(mode: GameMode) {
  return useGameSession(createIntervalQuestion, mode)
}
