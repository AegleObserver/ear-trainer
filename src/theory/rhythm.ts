import type { QuizQuestion } from '../types'

export type NoteValueId =
  | 'whole'
  | 'half'
  | 'quarter'
  | 'eighth'
  | 'sixteenth'
  | 'dotted-quarter'
  | 'dotted-eighth'
  | 'triplet-eighth'

export interface NoteValueDef {
  id: NoteValueId
  label: string
  beats: number
  hollow?: boolean
  flags: number
  dotted?: boolean
  triplet?: boolean
}

export const NOTE_VALUES: NoteValueDef[] = [
  { id: 'whole', label: '全音符', beats: 4, hollow: true, flags: 0 },
  { id: 'half', label: '二分音符', beats: 2, hollow: true, flags: 0 },
  { id: 'quarter', label: '四分音符', beats: 1, flags: 0 },
  { id: 'eighth', label: '八分音符', beats: 0.5, flags: 1 },
  { id: 'sixteenth', label: '十六分音符', beats: 0.25, flags: 2 },
  { id: 'dotted-quarter', label: '附点四分音符', beats: 1.5, flags: 0, dotted: true },
  { id: 'dotted-eighth', label: '附点八分音符', beats: 0.75, flags: 1, dotted: true },
  { id: 'triplet-eighth', label: '八分三连音', beats: 1 / 3, flags: 1, triplet: true },
]

export const NOTE_VALUE_BY_ID: Record<NoteValueId, NoteValueDef> = Object.fromEntries(
  NOTE_VALUES.map((v) => [v.id, v]),
) as Record<NoteValueId, NoteValueDef>

export const NOTE_VALUE_BY_LABEL: Record<string, NoteValueDef> = Object.fromEntries(
  NOTE_VALUES.map((v) => [v.label, v]),
)

const MIN_PATTERN_NOTES = 2
const MAX_PATTERN_NOTES = 4
const MAX_PATTERN_BEATS = 4

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function randomPattern(): NoteValueId[] {
  const minBeats = Math.min(...NOTE_VALUES.map((v) => v.beats))
  for (let attempt = 0; attempt < 200; attempt++) {
    const pattern: NoteValueId[] = []
    let sum = 0
    while (pattern.length < MAX_PATTERN_NOTES && sum + minBeats <= MAX_PATTERN_BEATS) {
      const fitting = NOTE_VALUES.filter((v) => sum + v.beats <= MAX_PATTERN_BEATS)
      const picked = fitting[Math.floor(Math.random() * fitting.length)]
      pattern.push(picked.id)
      sum += picked.beats
      if (pattern.length >= MIN_PATTERN_NOTES && Math.random() < 0.4) break
    }
    if (pattern.length >= MIN_PATTERN_NOTES && pattern.length <= MAX_PATTERN_NOTES) return pattern
  }
  return ['quarter', 'quarter', 'eighth', 'eighth']
}

export function patternToLabel(ids: NoteValueId[]): string {
  return ids.map((id) => NOTE_VALUE_BY_ID[id].label).join('·')
}

export function labelToDefs(label: string): NoteValueDef[] {
  return label.split('·').map((l) => NOTE_VALUE_BY_LABEL[l])
}

export function createRhythmQuestion(): QuizQuestion {
  const correct = randomPattern()
  const correctLabel = patternToLabel(correct)
  const options = new Set<string>([correctLabel])
  let guard = 0
  while (options.size < 4 && guard < 200) {
    options.add(patternToLabel(randomPattern()))
    guard++
  }
  return {
    notes: correct.map((id) => NOTE_VALUE_BY_ID[id].label),
    options: shuffle([...options]),
    correctAnswer: correctLabel,
  }
}
