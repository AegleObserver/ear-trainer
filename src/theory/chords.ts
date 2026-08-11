import type { ChordDef, Difficulty } from '../types'

const TRIADS_MAJOR_MINOR: ChordDef[] = [
  { name: '大三和弦', intervals: [0, 4, 7] },
  { name: '小三和弦', intervals: [0, 3, 7] },
]

const TRIADS_ALTERED: ChordDef[] = [
  { name: '增三和弦', intervals: [0, 4, 8] },
  { name: '减三和弦', intervals: [0, 3, 6] },
]

const SEVENTHS: ChordDef[] = [
  { name: '属七和弦', intervals: [0, 4, 7, 10] },
  { name: '大七和弦', intervals: [0, 4, 7, 11] },
  { name: '小七和弦', intervals: [0, 3, 7, 10] },
  { name: '减七和弦', intervals: [0, 3, 6, 9] },
]

export const CHORDS: Record<Difficulty, ChordDef[]> = {
  easy: TRIADS_MAJOR_MINOR,
  medium: [...TRIADS_MAJOR_MINOR, ...TRIADS_ALTERED],
  hard: [...TRIADS_MAJOR_MINOR, ...TRIADS_ALTERED, ...SEVENTHS],
}
