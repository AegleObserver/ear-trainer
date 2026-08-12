import * as Tone from 'tone'
import { RHYTHM_BPM } from '../constants/gameConfig'
import { NOTE_VALUE_BY_LABEL } from '../theory/rhythm'
import { ensureAudio, getBeatSynth } from './engine'

const BEAT_HIT_DURATION = 0.08
const TAIL_MS = 150

function beatSeconds(bpm: number): number {
  return 60 / bpm
}

/**
 * 播放节奏型（直接起播，无节拍器参照，仅奏一遍）。
 * 返回的 Promise 在全部发声结束后 resolve，用于锁定选项直至听完。
 */
export async function playRhythmQuestion(labels: string[]): Promise<void> {
  await ensureAudio()
  const patternBeats = labels.map((l) => NOTE_VALUE_BY_LABEL[l].beats)
  const patternTotal = patternBeats.reduce((a, b) => a + b, 0)
  const sec = beatSeconds(RHYTHM_BPM)
  const start = Tone.now()

  let acc = 0
  for (const b of patternBeats) {
    getBeatSynth().triggerAttackRelease('C1', BEAT_HIT_DURATION, start + acc * sec)
    acc += b
  }

  const totalMs = patternTotal * sec * 1000 + TAIL_MS
  await new Promise<void>((resolve) => setTimeout(resolve, totalMs))
}
