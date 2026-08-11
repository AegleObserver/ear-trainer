import type { ChordDef } from '../types'

export const CHORDS: ChordDef[] = [
  { name: '大三和弦', intervals: [0, 4, 7] },
  { name: '小三和弦', intervals: [0, 3, 7] },
  { name: '增三和弦', intervals: [0, 4, 8] },
  { name: '减三和弦', intervals: [0, 3, 6] },
  { name: '属七和弦', intervals: [0, 4, 7, 10] },
  { name: '大七和弦', intervals: [0, 4, 7, 11] },
  { name: '小七和弦', intervals: [0, 3, 7, 10] },
  { name: '减七和弦', intervals: [0, 3, 6, 9] },
]
