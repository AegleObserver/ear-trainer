import { midiToNote, randomChromaticMidi } from '../theory/notes'
import { DIFFICULTY_INTERVALS, INTERVALS } from '../theory/intervals'
import { buildOptions, pickRandom } from './quizUtils'
import { useQuiz } from './useQuiz'
import type { Difficulty, QuizQuestion } from '../types'

const INTERVAL_POOL = INTERVALS.map((i) => i.name)

export function createIntervalQuestion(difficulty: Difficulty): QuizQuestion {
  const interval = pickRandom(DIFFICULTY_INTERVALS[difficulty])
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

export function useIntervalTrainer() {
  return useQuiz(createIntervalQuestion)
}
