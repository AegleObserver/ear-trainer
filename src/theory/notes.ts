import type { BlackKeyMode } from '../types'

export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

export const NATURAL_NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

const NATURAL_SEMITONES = new Set([0, 2, 4, 5, 7, 9, 11])

const SHARP_TO_FLAT: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
}

/**
 * 按「黑键显示方式」格式化音名（内部始终使用升号规范名，仅展示层转换）。
 * 支持带八度（如 'C#4'）或不带八度（如 'F#'）的音名；自然音与降号写法不受影响。
 */
export function formatNoteName(note: string, mode: BlackKeyMode): string {
  if (mode === 'sharp') return note
  return note.replace(/^[A-G]#/, (m) => SHARP_TO_FLAT[m] ?? m)
}

export function midiToNote(midi: number): string {
  const semitone = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  return `${NOTE_NAMES[semitone]}${octave}`
}

export function noteToMidi(note: string): number {
  const match = /^([A-G]#?)(-?\d+)$/.exec(note)
  if (!match) throw new Error(`Invalid note name: ${note}`)
  const name = match[1] as (typeof NOTE_NAMES)[number]
  const octave = Number(match[2])
  return (octave + 1) * 12 + NOTE_NAMES.indexOf(name)
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

export function randomChromaticMidi(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

export function randomNaturalMidi(lo: number, hi: number): number {
  let midi: number
  do {
    midi = randomChromaticMidi(lo, hi)
  } while (!NATURAL_SEMITONES.has(((midi % 12) + 12) % 12))
  return midi
}

export function randomNaturalNote(lo: number, hi: number): string {
  return midiToNote(randomNaturalMidi(lo, hi))
}

export function randomChromaticNote(lo: number, hi: number): string {
  return midiToNote(randomChromaticMidi(lo, hi))
}
