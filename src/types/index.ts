export type PageId = 'ear-training' | 'play' | 'settings'

export interface PageDef {
  id: PageId
  label: string
  icon: string
  enabled: boolean
}

export type Mode = 'pitch' | 'interval' | 'chord'
export type Difficulty = 'easy' | 'medium' | 'hard'

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

export interface QuizTrainer {
  difficulty: Difficulty
  question: QuizQuestion | null
  lastResult: QuizResult | null
  stats: QuizStats
  isPlaying: boolean
  newQuestion: () => void
  replay: () => void
  submitAnswer: (answer: string) => void
  setDifficulty: (d: Difficulty) => void
  resetStats: () => void
}
