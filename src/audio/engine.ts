import * as Tone from 'tone'

let synth: Tone.Synth | null = null
let started = false

/**
 * 在用户首次交互时调用，解锁浏览器 AudioContext。
 */
export async function ensureAudio(): Promise<void> {
  if (!started) {
    await Tone.start()
    started = true
  }
}

/**
 * 全局 Synth 单例（十二平均律，A4 = 440Hz）。
 */
export function getSynth(): Tone.Synth {
  if (!synth) {
    synth = new Tone.Synth({
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
