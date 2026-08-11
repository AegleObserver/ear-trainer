import { ensureAudio, getSynth } from './engine'

export async function playNote(note: string, duration = 0.6): Promise<void> {
  await ensureAudio()
  getSynth().triggerAttackRelease(note, duration)
}

export async function playInterval(note1: string, note2: string): Promise<void> {
  await ensureAudio()
  getSynth().triggerAttackRelease([note1, note2], 1.2)
}

export async function playChord(notes: string[]): Promise<void> {
  await ensureAudio()
  getSynth().triggerAttackRelease(notes, 1.2)
}
