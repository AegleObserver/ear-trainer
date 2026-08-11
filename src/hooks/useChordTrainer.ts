import { midiToNote, randomChromaticMidi } from '../theory/notes'
import { CHORDS } from '../theory/chords'
import { buildOptions, pickRandom } from './quizUtils'
import { useQuiz } from './useQuiz'
import type { Difficulty, QuizQuestion } from '../types'

const CHORD_POOL = CHORDS.hard.map((c) => c.name)

export function createChordQuestion(difficulty: Difficulty): QuizQuestion {
  const chord = pickRandom(CHORDS[difficulty])
  const top = Math.max(...chord.intervals)
  const root = randomChromaticMidi(48, 84 - top)
  return {
    notes: chord.intervals.map((i) => midiToNote(root + i)),
    options: buildOptions(chord.name, CHORD_POOL, 4),
    correctAnswer: chord.name,
  }
}

export function useChordTrainer() {
  return useQuiz(createChordQuestion)
}
