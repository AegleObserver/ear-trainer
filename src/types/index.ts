export type PageId = 'test' | 'training' | 'play' | 'settings' | 'profile'

export type SoundDomain = 'pitch' | 'rhythm'

export interface PageDef {
  id: PageId
  label: string
  icon: string
  enabled: boolean
}

export type Mode = 'pitch' | 'interval' | 'chord' | 'rhythm'
export type GameMode = 'standard' | 'timed' | 'endless'
export type GameSessionState = 'playing' | 'finished'

export type RootRangeId = 'low' | 'mid' | 'high' | 'full'
export type PitchKeyMode = 'white' | 'all'
export type ThemeId = 'dark-cyan' | 'light' | 'dark-violet' | 'dark-amber'
export type TimbreId = 'sine' | 'triangle' | 'square' | 'sawtooth' | 'fm'
export type RhythmVoiceId = 'drum' | TimbreId
export type PlaybackMode = 'simultaneous' | 'sequential'

export interface UserSettings {
  rootRange: RootRangeId
  pitchKeyMode: PitchKeyMode
  enabledIntervals: number[]
  enabledChords: string[]
  theme: ThemeId
  timbre: TimbreId
  playbackMode: PlaybackMode
  rhythmVoice: RhythmVoiceId
  rhythmBpm: number
  standardCount: number
  timedLimitSeconds: number
}

export interface GameSessionConfig {
  standardCount: number
  timedLimitSeconds: number
}

export interface QuizRecord {
  id: string
  timestamp: number
  questionType: Mode
  mode: GameMode
  correct: number
  total: number
}

export interface IntervalDef {
  name: string
  semitones: number
}

export interface ChordDef {
  name: string
  intervals: number[]
}

export interface QuizQuestion {
  notes: string[]
  options: string[]
  correctAnswer: string
}

export interface QuizResult {
  chosen: string
  correct: boolean
}

export interface QuizStats {
  total: number
  correct: number
}

export interface GameSession {
  mode: GameMode
  state: GameSessionState
  question: QuizQuestion | null
  lastResult: QuizResult | null
  stats: QuizStats
  timeRemaining: number | null
  isPlaying: boolean
  submitAnswer: (answer: string) => void
  stop: () => void
  restart: () => void
  replay: () => void
}
