import type { QuizRecord, RootRangeId, UserSettings } from '../types'

export const ROOT_RANGES: Record<RootRangeId, { label: string; lo: number; hi: number }> = {
  low: { label: '低音区 C3–B3', lo: 48, hi: 59 },
  mid: { label: '中音区 C4–B4', lo: 60, hi: 71 },
  high: { label: '高音区 C5–B5', lo: 72, hi: 83 },
  full: { label: '全音域 C3–C6', lo: 48, hi: 84 },
}

export const DEFAULT_SETTINGS: UserSettings = {
  rootRange: 'full',
  pitchKeyMode: 'all',
  enabledIntervals: [],
  enabledChords: [],
}

const SETTINGS_KEY = 'ear-trainer.settings'
const RECORDS_KEY = 'ear-trainer.records'

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export function loadRecords(): QuizRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveRecords(records: QuizRecord[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  } catch {
    // ignore
  }
}

export interface RatingInfo {
  score: number
  label: string
  level: number
}

export function computeRating(records: QuizRecord[]): RatingInfo {
  const totalQuestions = records.reduce((sum, r) => sum + r.total, 0)
  const correct = records.reduce((sum, r) => sum + r.correct, 0)
  if (totalQuestions === 0) return { score: 0, label: '暂无数据', level: 0 }
  const score = Math.round((correct / totalQuestions) * 100)
  if (score < 50) return { score, label: '音乐新手', level: 1 }
  if (score < 70) return { score, label: '进阶学习者', level: 2 }
  if (score < 85) return { score, label: '熟练乐手', level: 3 }
  if (score < 95) return { score, label: '音乐达人', level: 4 }
  return { score, label: '大师级', level: 5 }
}
