import {
  midiToNote,
  NOTE_NAMES,
  NATURAL_NOTE_NAMES,
  randomChromaticMidi,
  randomNaturalMidi,
} from '../theory/notes'
import { buildOptions } from './quizUtils'
import { useQuiz } from './useQuiz'
import type { Difficulty, QuizQuestion } from '../types'

export function createPitchQuestion(difficulty: Difficulty): QuizQuestion {
  let midi: number
  if (difficulty === 'easy') {
    midi = randomNaturalMidi(60, 71)
  } else if (difficulty === 'medium') {
    midi = randomChromaticMidi(60, 71)
  } else {
    midi = randomChromaticMidi(48, 84)
  }
  const noteName = midiToNote(midi)
  const noteLabel = noteName.replace(/\d+$/, '')
  const pool = difficulty === 'easy' ? NATURAL_NOTE_NAMES : NOTE_NAMES
  return {
    notes: [noteName],
    options: buildOptions(noteLabel, pool, 4),
    correctAnswer: noteLabel,
  }
}

export function usePitchTrainer() {
  return useQuiz(createPitchQuestion)
}
