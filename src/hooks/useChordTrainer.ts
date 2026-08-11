import { useCallback } from 'react'
import { playChord } from '../audio/playNotes'
import { ROOT_RANGES } from '../data/storage'
import { midiToNote, randomChromaticMidi } from '../theory/notes'
import { CHORDS } from '../theory/chords'
import { buildOptions, pickRandom } from './quizUtils'
import { useGameSession } from './useGameSession'
import type { GameMode, QuizQuestion, UserSettings } from '../types'

const CHORD_POOL = CHORDS.map((c) => c.name)

export function createChordQuestion(settings: UserSettings): QuizQuestion {
  const pool =
    settings.enabledChords.length > 0
      ? CHORDS.filter((c) => settings.enabledChords.includes(c.name))
      : CHORDS
  const { lo, hi } = ROOT_RANGES[settings.rootRange]
  const chord = pickRandom(pool)
  const top = Math.max(...chord.intervals)
  const root = randomChromaticMidi(lo, Math.max(lo, hi - top))
  return {
    notes: chord.intervals.map((i) => midiToNote(root + i)),
    options: buildOptions(chord.name, CHORD_POOL, 4),
    correctAnswer: chord.name,
  }
}

export function useChordTrainer(mode: GameMode, settings: UserSettings) {
  const createQuestion = useCallback(() => createChordQuestion(settings), [settings])
  const playQuestion = useCallback(async (q: QuizQuestion) => {
    await playChord(q.notes)
  }, [])
  return useGameSession(createQuestion, mode, playQuestion)
}
