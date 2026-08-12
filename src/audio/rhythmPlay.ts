import * as Tone from 'tone'
import { NOTE_VALUE_BY_LABEL } from '../theory/rhythm'
import { ensureAudio, getRhythmHit } from './engine'

const BEAT_HIT_DURATION = 0.08
const TAIL_MS = 150

function beatSeconds(bpm: number): number {
  return 60 / bpm
}

/**
 * 播放节奏型（直接起播，无节拍器参照，仅奏一遍）。
 * 音源/音高跟随设置的「节奏音色」，拍速跟随设置的 BPM。
 * 返回的 Promise 在全部发声结束后 resolve，用于锁定选项直至听完。
 */
export async function playRhythmQuestion(labels: string[], bpm = 90): Promise<void> {
  await ensureAudio()
  const patternBeats = labels.map((l) => NOTE_VALUE_BY_LABEL[l].beats)
  const patternTotal = patternBeats.reduce((a, b) => a + b, 0)
  const sec = beatSeconds(bpm)
  const start = Tone.now()
  const { synth, note } = getRhythmHit()

  let acc = 0
  for (const b of patternBeats) {
    synth.triggerAttackRelease(note, BEAT_HIT_DURATION, start + acc * sec)
    acc += b
  }

  const totalMs = patternTotal * sec * 1000 + TAIL_MS
  await new Promise<void>((resolve) => setTimeout(resolve, totalMs))
}
