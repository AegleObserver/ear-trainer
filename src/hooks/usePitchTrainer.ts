import { useCallback } from 'react'
import { playNote } from '../audio/playNotes'
import { ROOT_RANGES } from '../data/storage'
import { midiToNote, NATURAL_NOTE_NAMES, NOTE_NAMES, randomChromaticMidi, randomNaturalMidi } from '../theory/notes'
import { buildOptions } from './quizUtils'
import { useGameSession } from './useGameSession'
import type { GameMode, QuizQuestion, UserSettings } from '../types'

export function createPitchQuestion(settings: UserSettings): QuizQuestion {
  const { lo, hi } = ROOT_RANGES[settings.rootRange]
  const whiteOnly = settings.pitchKeyMode === 'white'
  const midi = whiteOnly ? randomNaturalMidi(lo, hi) : randomChromaticMidi(lo, hi)
  const noteName = midiToNote(midi)
  const noteLabel = noteName.replace(/\d+$/, '')
  const pool = whiteOnly ? NATURAL_NOTE_NAMES : NOTE_NAMES
  return {
    notes: [noteName],
    options: buildOptions(noteLabel, pool, 4),
    correctAnswer: noteLabel,
  }
}

export function usePitchTrainer(mode: GameMode, settings: UserSettings) {
  const createQuestion = useCallback(() => createPitchQuestion(settings), [settings])
  const playQuestion = useCallback(async (q: QuizQuestion) => {
    await playNote(q.notes[0])
  }, [])
  return useGameSession(createQuestion, mode, playQuestion)
}
