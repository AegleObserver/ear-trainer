import { midiToNote, NOTE_NAMES, randomChromaticMidi } from '../theory/notes'
import { buildOptions } from './quizUtils'
import { useGameSession } from './useGameSession'
import type { GameMode, QuizQuestion } from '../types'

export function createPitchQuestion(): QuizQuestion {
  const midi = randomChromaticMidi(48, 84)
  const noteName = midiToNote(midi)
  const noteLabel = noteName.replace(/\d+$/, '')
  return {
    notes: [noteName],
    options: buildOptions(noteLabel, NOTE_NAMES, 4),
    correctAnswer: noteLabel,
  }
}

export function usePitchTrainer(mode: GameMode) {
  return useGameSession(createPitchQuestion, mode)
}
