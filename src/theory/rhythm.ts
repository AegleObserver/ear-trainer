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

/**
 * 预制节奏型（节奏考察的基本原子）。
 * 标签不含「·」，保证可按「·」拼接与解析；seq 展开为音符值序列用于渲染与播放。
 */
export interface RhythmFigure {
  id: string
  label: string
  beats: number
  seq: NoteValueId[]
}

export const RHYTHM_FIGURES: RhythmFigure[] = [
  { id: 'half', label: '二分', beats: 2, seq: ['half'] },
  { id: 'quarter', label: '四分', beats: 1, seq: ['quarter'] },
  { id: 'eighth', label: '八分', beats: 0.5, seq: ['eighth'] },
  { id: 'triplet', label: '三连音', beats: 1, seq: ['triplet-eighth', 'triplet-eighth', 'triplet-eighth'] },
  { id: 'front-sixteenth', label: '前十六分', beats: 1, seq: ['sixteenth', 'sixteenth', 'eighth'] },
  { id: 'back-sixteenth', label: '后十六分', beats: 1, seq: ['eighth', 'sixteenth', 'sixteenth'] },
  { id: 'syncopation-small', label: '切分音(16-8-16)', beats: 1, seq: ['sixteenth', 'eighth', 'sixteenth'] },
  { id: 'syncopation-large', label: '切分音(4-8-4)', beats: 2.5, seq: ['quarter', 'eighth', 'quarter'] },
  { id: 'dotted-eighth', label: '附点八分', beats: 0.75, seq: ['dotted-eighth'] },
  { id: 'dotted-quarter', label: '附点四分', beats: 1.5, seq: ['dotted-quarter'] },
]

export const FIGURE_BY_LABEL: Record<string, RhythmFigure> = Object.fromEntries(
  RHYTHM_FIGURES.map((f) => [f.label, f]),
)

const BAR_BEATS = 4
const MIN_FIGURES = 2
const MAX_FIGURES = 4

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function patternToLabel(ids: NoteValueId[]): string {
  return ids.map((id) => NOTE_VALUE_BY_ID[id].label).join('·')
}

/**
 * 展开节奏型序列为音符值标签序列（供渲染字形与播放）。
 */
export function figuresToNoteLabels(figures: RhythmFigure[]): string[] {
  return figures.flatMap((f) => f.seq.map((id) => NOTE_VALUE_BY_ID[id].label))
}

/**
 * 节奏型序列的唯一串（用于选项去重与比对）。
 */
export function figuresToKey(figures: RhythmFigure[]): string {
  return figures.map((f) => f.label).join('·')
}

/**
 * 由音符值标签序列重建唯一的"听感指纹"，用于排除听感相同的选项。
 */
export function noteSeqKey(noteLabels: string[]): string {
  return noteLabels.join('|')
}

const EPS = 1e-9

/**
 * 枚举所有"2~4 个节奏型、时值和恰为 4/4 小节"的组合。
 */
function allValidMeasures(): RhythmFigure[][] {
  const results: RhythmFigure[][] = []
  const combos = new Set<string>()

  function dfs(current: RhythmFigure[], sum: number) {
    if (Math.abs(sum - BAR_BEATS) < EPS) {
      if (current.length >= MIN_FIGURES && current.length <= MAX_FIGURES) {
        const key = figuresToKey(current)
        if (!combos.has(key)) {
          combos.add(key)
          results.push([...current])
        }
      }
      return
    }
    if (current.length >= MAX_FIGURES || sum >= BAR_BEATS - EPS) return
    for (const f of RHYTHM_FIGURES) {
      if (sum + f.beats <= BAR_BEATS + EPS) {
        current.push(f)
        dfs(current, sum + f.beats)
        current.pop()
      }
    }
  }

  dfs([], 0)
  return results
}

let validMeasuresCache: RhythmFigure[][] | null = null

function validMeasures(): RhythmFigure[][] {
  if (!validMeasuresCache) validMeasuresCache = allValidMeasures()
  return validMeasuresCache
}

/**
 * 随机生成一个完整的 4/4 小节节奏型组合。
 */
export function randomMeasure(): RhythmFigure[] {
  const measures = validMeasures()
  return measures[Math.floor(Math.random() * measures.length)]
}

export function createRhythmQuestion(): QuizQuestion {
  const correct = randomMeasure()
  const correctKey = figuresToKey(correct)
  const correctNoteKey = noteSeqKey(figuresToNoteLabels(correct))

  const seenNoteKeys = new Set<string>([correctNoteKey])
  const options = new Set<string>([correctKey])
  let guard = 0
  while (options.size < 4 && guard < 500) {
    const candidate = randomMeasure()
    const noteKey = noteSeqKey(figuresToNoteLabels(candidate))
    if (seenNoteKeys.has(noteKey)) {
      guard++
      continue
    }
    seenNoteKeys.add(noteKey)
    options.add(figuresToKey(candidate))
    guard++
  }

  return {
    notes: figuresToNoteLabels(correct),
    options: shuffle([...options]),
    correctAnswer: correctKey,
  }
}
