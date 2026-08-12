import * as Tone from 'tone'
import { ensureAudio, getPlaybackMode, getSynth } from './engine'
import { noteToMidi } from '../theory/notes'

const SEQUENTIAL_NOTE_DURATION = 0.4
const SEQUENTIAL_STEP_SECONDS = 0.3

function playSequentially(notes: string[]): void {
  const sorted = [...notes].sort((a, b) => noteToMidi(a) - noteToMidi(b))
  const start = Tone.now()
  sorted.forEach((note, i) => {
    getSynth().triggerAttackRelease(note, SEQUENTIAL_NOTE_DURATION, start + i * SEQUENTIAL_STEP_SECONDS)
  })
}

export async function playNote(note: string, duration = 0.6): Promise<void> {
  await ensureAudio()
  getSynth().triggerAttackRelease(note, duration)
}

export async function playInterval(note1: string, note2: string): Promise<void> {
  await ensureAudio()
  if (getPlaybackMode() === 'sequential') {
    playSequentially([note1, note2])
    return
  }
  getSynth().triggerAttackRelease([note1, note2], 1.2)
}

export async function playChord(notes: string[]): Promise<void> {
  await ensureAudio()
  if (getPlaybackMode() === 'sequential') {
    playSequentially(notes)
    return
  }
  getSynth().triggerAttackRelease(notes, 1.2)
}
