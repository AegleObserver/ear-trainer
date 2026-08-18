const A4_MIDI = 69
const A4_FREQ = 440
const SAMPLE_RATE_FALLBACK = 48000
const FFT_SIZE = 2048
const MIN_FREQ = 40
const MAX_FREQ = 2000
const MIN_RMS = 0.012
const MIN_CONFIDENCE = 0.88

export interface PitchReading {
  freq: number
  midi: number
  note: string
  cents: number
  confidence: number
}

let ctx: AudioContext | null = null
let source: MediaStreamAudioSourceNode | null = null
let analyser: AnalyserNode | null = null
let stream: MediaStream | null = null
let started = false

export async function startTuner(): Promise<void> {
  if (started) return
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('当前环境不支持麦克风输入（需 HTTPS）')
  }
  stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
    },
  })
  ctx = new AudioContext()
  await ctx.resume()
  source = ctx.createMediaStreamSource(stream)
  analyser = ctx.createAnalyser()
  analyser.fftSize = FFT_SIZE
  analyser.smoothingTimeConstant = 0
  source.connect(analyser)
  started = true
}

export function stopTuner(): void {
  started = false
  stream?.getTracks().forEach((t) => t.stop())
  stream = null
  source?.disconnect()
  source = null
  analyser = null
  void ctx?.close().catch(() => undefined)
  ctx = null
}

export function readPitch(): PitchReading | null {
  if (!analyser || !ctx) return null

  const buffer = new Float32Array(analyser.fftSize)
  analyser.getFloatTimeDomainData(buffer)
  const sampleRate = ctx.sampleRate || SAMPLE_RATE_FALLBACK

  let rms = 0
  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / buffer.length)
  if (rms < MIN_RMS) return null

  const { lag, confidence } = findBestLag(buffer, sampleRate)
  if (lag < 0 || confidence < MIN_CONFIDENCE) return null

  const freq = sampleRate / lag
  if (freq < MIN_FREQ || freq > MAX_FREQ) return null

  const midi = A4_MIDI + 12 * Math.log2(freq / A4_FREQ)
  const nearestMidi = Math.round(midi)
  return {
    freq,
    midi,
    note: midiToName(nearestMidi),
    cents: Math.round((midi - nearestMidi) * 100),
    confidence,
  }
}

function midiToName(midi: number): string {
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return `${NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`
}

function findBestLag(buffer: Float32Array, sampleRate: number): { lag: number; confidence: number } {
  const minLag = Math.floor(sampleRate / MAX_FREQ)
  const maxLag = Math.ceil(sampleRate / MIN_FREQ)
  let bestLag = -1
  let bestCorr = -Infinity
  let energy = 0

  for (let i = 0; i < buffer.length; i++) {
    energy += buffer[i] * buffer[i]
  }

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0
    for (let i = 0; i < buffer.length - maxLag; i++) {
      corr += buffer[i] * buffer[i + lag]
    }
    if (corr > bestCorr) {
      bestCorr = corr
      bestLag = lag
    }
  }

  if (bestLag < 0 || energy === 0) return { lag: -1, confidence: 0 }
  const normalized = bestCorr / energy
  if (normalized < MIN_CONFIDENCE) return { lag: -1, confidence: normalized }
  return { lag: bestLag, confidence: normalized }
}
