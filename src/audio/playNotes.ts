import type { Unit } from 'tone'
import { ensureAudio, getSynth } from './engine'

export async function playNote(note: string, duration = 0.6): Promise<void> {
  await ensureAudio()
  getSynth().triggerAttackRelease(note, duration)
}

export async function playInterval(note1: string, note2: string): Promise<void> {
  await ensureAudio()
  const synth = getSynth()
  synth.triggerAttackRelease(note1, 0.5)
  await new Promise((resolve) => setTimeout(resolve, 700))
  synth.triggerAttackRelease(note2, 0.5)
}

export async function playChord(notes: string[]): Promise<void> {
  await ensureAudio()
  getSynth().triggerAttackRelease(notes as unknown as Unit.Frequency, 1.2)
}
