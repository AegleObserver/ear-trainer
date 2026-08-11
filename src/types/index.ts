export type PageId = 'ear-training' | 'play' | 'settings'

export interface PageDef {
  id: PageId
  label: string
  icon: string
  enabled: boolean
}

export type Mode = 'pitch' | 'interval' | 'chord'
export type GameMode = 'standard' | 'timed' | 'endless'
export type GameSessionState = 'playing' | 'finished'

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
