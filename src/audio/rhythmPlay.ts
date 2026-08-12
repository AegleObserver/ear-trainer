import * as Tone from 'tone'
import { RHYTHM_BPM, RHYTHM_PATTERN_PLAYS, RHYTHM_REFERENCE_BARS } from '../constants/gameConfig'
import { NOTE_VALUE_BY_LABEL } from '../theory/rhythm'
import { ensureAudio, getBeatSynth, getClickSynth } from './engine'

const BEATS_PER_BAR = 4
const BEAT_HIT_DURATION = 0.08
const CLICK_DURATION = 0.03
const TAIL_MS = 150

function beatSeconds(bpm: number): number {
  return 60 / bpm
}

/**
 * 播放节拍器参照 + 节奏型（循环两遍）。
 * 返回的 Promise 在全部发声结束后 resolve，用于锁定选项直至听完。
 */
export async function playRhythmQuestion(labels: string[]): Promise<void> {
  await ensureAudio()
  const patternBeats = labels.map((l) => NOTE_VALUE_BY_LABEL[l].beats)
  const patternTotal = patternBeats.reduce((a, b) => a + b, 0)
  const referenceBeats = RHYTHM_REFERENCE_BARS * BEATS_PER_BAR
  const sec = beatSeconds(RHYTHM_BPM)
  const start = Tone.now()

  for (let i = 0; i < referenceBeats; i++) {
    getClickSynth().triggerAttackRelease(CLICK_DURATION, start + i * sec)
  }

  const patternStart = start + referenceBeats * sec
  for (let rep = 0; rep < RHYTHM_PATTERN_PLAYS; rep++) {
    const base = patternStart + rep * patternTotal * sec
    let acc = 0
    for (const b of patternBeats) {
      getBeatSynth().triggerAttackRelease('C1', BEAT_HIT_DURATION, base + acc * sec)
      acc += b
    }
  }

  const totalMs = (referenceBeats + RHYTHM_PATTERN_PLAYS * patternTotal) * sec * 1000 + TAIL_MS
  await new Promise<void>((resolve) => setTimeout(resolve, totalMs))
}
