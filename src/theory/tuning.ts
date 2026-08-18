import { noteToMidi } from './notes'

export interface StringDef {
  name: string
  note: string
  midi: number
}

function toDef(note: string, index: number): StringDef {
  return { name: `${index + 1} 弦`, note, midi: noteToMidi(note) }
}

export const GUITAR_STRINGS: StringDef[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map(toDef)

export const UKULELE_STRINGS: StringDef[] = ['G4', 'C4', 'E4', 'A4'].map(toDef)
