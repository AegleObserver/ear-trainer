import type { Difficulty, IntervalDef } from '../types'

export const INTERVALS: IntervalDef[] = [
  { name: '小二度', semitones: 1 },
  { name: '大二度', semitones: 2 },
  { name: '小三度', semitones: 3 },
  { name: '大三度', semitones: 4 },
  { name: '纯四度', semitones: 5 },
  { name: '三全音', semitones: 6 },
  { name: '纯五度', semitones: 7 },
  { name: '小六度', semitones: 8 },
  { name: '大六度', semitones: 9 },
  { name: '小七度', semitones: 10 },
  { name: '大七度', semitones: 11 },
  { name: '八度', semitones: 12 },
]

export const DIFFICULTY_INTERVALS: Record<Difficulty, IntervalDef[]> = {
  easy: INTERVALS.filter((i) => [5, 7, 12].includes(i.semitones)),
  medium: INTERVALS.filter((i) => [2, 3, 4, 5, 7, 8, 9, 12].includes(i.semitones)),
  hard: INTERVALS,
}
