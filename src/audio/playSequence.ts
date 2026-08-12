import * as Tone from 'tone'
import { ensureAudio, RHYTHM_TONE_NOTE } from './engine'
import type { MinStep, PlayTrack, RhythmVoiceId } from '../types'

const HIT_DURATION = 0.08

const voiceCache = new Map<RhythmVoiceId, Tone.PolySynth | Tone.MembraneSynth>()

function getVoiceSynth(voice: RhythmVoiceId): Tone.PolySynth | Tone.MembraneSynth {
  const cached = voiceCache.get(voice)
  if (cached) return cached
  let synth: Tone.PolySynth | Tone.MembraneSynth
  if (voice === 'drum') {
    synth = new Tone.MembraneSynth({
      volume: 3,
      pitchDecay: 0.02,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
    }).toDestination()
  } else if (voice === 'fm') {
    synth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 2,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination()
  } else {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: voice },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination()
  }
  voiceCache.set(voice, synth)
  return synth
}

export interface PlaybackHandle {
  pause: () => void
  resume: () => void
  stop: () => void
  promise: Promise<void>
}

export interface PlaySequenceOptions {
  bpm: number
  minStep: MinStep
  startTick: number
}

/**
 * 播放多轨序列：每条音轨独立音频实例（鼓 → 膜音 C1，乐音 → A4 短促音），
 * 静音轨跳过；从 startTick（最小分度格）起播，至旋律结束或手动 stop 结束。
 * 基于 Tone.Transport 调度，支持暂停/继续。
 */
export async function playSequence(
  tracks: PlayTrack[],
  { bpm, minStep, startTick }: PlaySequenceOptions,
): Promise<PlaybackHandle> {
  await ensureAudio()

  const stepBeats = 4 / minStep
  const secPerStep = stepBeats * (60 / bpm)
  const offset = startTick * secPerStep

  Tone.Transport.stop()
  Tone.Transport.cancel(0)
  Tone.Transport.bpm.value = bpm

  let finished = false
  let resolveDone: () => void = () => {}
  const done = new Promise<void>((resolve) => {
    resolveDone = resolve
  })

  const finish = () => {
    if (finished) return
    finished = true
    Tone.Transport.stop()
    Tone.Transport.cancel(0)
    resolveDone()
  }

  let lastEnd = 0
  for (const track of tracks) {
    if (track.muted) continue
    const synth = getVoiceSynth(track.voice)
    const hitNote = track.voice === 'drum' ? 'C1' : RHYTHM_TONE_NOTE
    for (const note of track.notes) {
      const endAt = (note.start + note.dur - startTick) * secPerStep
      if (endAt <= 0) continue
      const attackAt = Math.max(offset, (note.start - startTick) * secPerStep)
      Tone.Transport.schedule((time) => {
        synth.triggerAttackRelease(hitNote, HIT_DURATION, time)
      }, attackAt)
      lastEnd = Math.max(lastEnd, endAt)
    }
  }
  Tone.Transport.schedule(finish, lastEnd)
  Tone.Transport.start(undefined, offset)

  return {
    pause: () => {
      if (!finished) Tone.Transport.pause()
    },
    resume: () => {
      if (!finished) Tone.Transport.start()
    },
    stop: finish,
    promise: done,
  }
}
