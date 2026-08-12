import * as Tone from 'tone'
import type { PlaybackMode, RhythmVoiceId, TimbreId } from '../types'

let synth: Tone.PolySynth | null = null
let beatSynth: Tone.MembraneSynth | null = null
let rhythmToneSynth: Tone.PolySynth | null = null
let started = false
let currentTimbre: TimbreId = 'triangle'
let currentPlayback: PlaybackMode = 'simultaneous'
let currentRhythmVoice: RhythmVoiceId = 'drum'

export const RHYTHM_TONE_NOTE = 'A4'

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

function buildSynth(timbre: TimbreId): Tone.PolySynth {
  if (timbre === 'fm') {
    return new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 2,
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.4,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination()
  }
  const waveform = timbre
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: waveform },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.5,
      release: 1,
    },
  }).toDestination()
}

/**
 * 全局 PolySynth 单例（十二平均律，A4 = 440Hz）。
 * PolySynth 支持多声部，可同时播放和弦。
 */
export function getSynth(): Tone.PolySynth {
  if (!synth) {
    synth = buildSynth(currentTimbre)
  }
  return synth
}

/**
 * 切换音色：销毁当前 PolySynth 并按新音色重建。
 * 下一次发声即使用新音色。
 */
export function configureSynth(timbre: TimbreId): void {
  currentTimbre = timbre
  if (synth) {
    synth.dispose()
    synth = null
  }
}

/**
 * 设置多音播放方式（同时叠响 / 逐音上行）。
 */
export function configurePlayback(mode: PlaybackMode): void {
  currentPlayback = mode
}

/**
 * 当前多音播放方式。
 */
export function getPlaybackMode(): PlaybackMode {
  return currentPlayback
}

/**
 * 打击乐主音单例（节奏型的鼓点敲击）。
 * 低频膜音听感偏弱，单独抬高音量使其在节奏中更突出。
 */
export function getBeatSynth(): Tone.MembraneSynth {
  if (!beatSynth) {
    beatSynth = new Tone.MembraneSynth({
      volume: 3,
      pitchDecay: 0.02,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
    }).toDestination()
  }
  return beatSynth
}

/**
 * 节奏乐音单例（以 A4 发声的短促打击音，避免长余音重叠）。
 */
function getRhythmToneSynth(): Tone.PolySynth {
  const voice = currentRhythmVoice as Exclude<RhythmVoiceId, 'drum'>
  if (rhythmToneSynth) return rhythmToneSynth
  if (voice === 'fm') {
    rhythmToneSynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 2,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination()
  } else {
    rhythmToneSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: voice },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination()
  }
  return rhythmToneSynth
}

/**
 * 切换节奏音色：鼓点 / 以 A4 发声的 5 档乐音。
 * 下一次发声即使用新音色。
 */
export function configureRhythmVoice(voice: RhythmVoiceId): void {
  currentRhythmVoice = voice
  if (voice !== 'drum') {
    getRhythmToneSynth()
  } else if (rhythmToneSynth) {
    rhythmToneSynth.dispose()
    rhythmToneSynth = null
  }
}

/**
 * 当前节奏音色对应的音源与击发音高。
 * 鼓 → 膜音敲 C1；乐音 → A4。
 */
export function getRhythmHit(): { synth: Tone.PolySynth | Tone.MembraneSynth; note: string } {
  if (currentRhythmVoice === 'drum') {
    return { synth: getBeatSynth(), note: 'C1' }
  }
  return { synth: getRhythmToneSynth(), note: RHYTHM_TONE_NOTE }
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
