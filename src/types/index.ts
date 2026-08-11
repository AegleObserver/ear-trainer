export type PageId = 'ear-training' | 'play' | 'settings' | 'profile'

export interface PageDef {
  id: PageId
  label: string
  icon: string
  enabled: boolean
}

export type Mode = 'pitch' | 'interval' | 'chord'
export type GameMode = 'standard' | 'timed' | 'endless'
export type GameSessionState = 'playing' | 'finished'

export type RootRangeId = 'low' | 'mid' | 'high' | 'full'
export type PitchKeyMode = 'white' | 'all'

export interface UserSettings {
  rootRange: RootRangeId
  pitchKeyMode: PitchKeyMode
  enabledIntervals: number[]
  enabledChords: string[]
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
