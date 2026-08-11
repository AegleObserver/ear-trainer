import { useCallback } from 'react'
import { playChord } from '../audio/playNotes'
import { midiToNote, randomChromaticMidi } from '../theory/notes'
import { CHORDS } from '../theory/chords'
import { buildOptions, pickRandom } from './quizUtils'
import { useGameSession } from './useGameSession'
import type { GameMode, QuizQuestion } from '../types'

const CHORD_POOL = CHORDS.map((c) => c.name)

export function createChordQuestion(): QuizQuestion {
  const chord = pickRandom(CHORDS)
  const top = Math.max(...chord.intervals)
  const root = randomChromaticMidi(48, 84 - top)
  return {
    notes: chord.intervals.map((i) => midiToNote(root + i)),
    options: buildOptions(chord.name, CHORD_POOL, 4),
    correctAnswer: chord.name,
  }
}

export function useChordTrainer(mode: GameMode) {
  const playQuestion = useCallback(async (q: QuizQuestion) => {
    await playChord(q.notes)
  }, [])
  return useGameSession(createChordQuestion, mode, playQuestion)
}
