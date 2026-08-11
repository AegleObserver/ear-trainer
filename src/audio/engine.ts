import * as Tone from 'tone'

let synth: Tone.PolySynth | null = null
let started = false

const UNLOCK_TIMEOUT_MS = 1500

/**
 * 在用户首次交互时调用，解锁浏览器 AudioContext。
 * 返回是否已就绪；非手势环境调用不会挂起（1.5s 超时降级）。
 */
export async function ensureAudio(): Promise<boolean> {
  if (started) return true
  try {
    await Promise.race([
      Tone.start().then(() => undefined),
      new Promise((resolve) => setTimeout(resolve, UNLOCK_TIMEOUT_MS)),
    ])
    started = true
    return true
  } catch {
    return false
  }
}

/**
 * 全局 PolySynth 单例（十二平均律，A4 = 440Hz）。
 * PolySynth 支持多声部，可同时播放和弦。
 */
export function getSynth(): Tone.PolySynth {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.5,
        release: 1,
      },
    }).toDestination()
  }
  return synth
}

/**
 * 音频是否已解锁。
 */
export function isAudioReady(): boolean {
  return started
}

/**
 * 设置全局音量 (0..1)。
 */
export function setVolume(level: number): void {
  Tone.getDestination().volume.rampTo(Tone.gainToDb(Math.max(0.0001, level)), 0.05)
}
