import { MANUSCRIPT_NAME_PREFIX } from '../constants/playConfig'
import type {
  Manuscript,
  PlaybackMode,
  QuizRecord,
  RhythmVoiceId,
  RootRangeId,
  ThemeId,
  TimbreId,
  UserSettings,
} from '../types'

export const ROOT_RANGES: Record<RootRangeId, { label: string; lo: number; hi: number }> = {
  low: { label: '低音区 C3–B3', lo: 48, hi: 59 },
  mid: { label: '中音区 C4–B4', lo: 60, hi: 71 },
  high: { label: '高音区 C5–B5', lo: 72, hi: 83 },
  full: { label: '全音域 C3–C6', lo: 48, hi: 84 },
}

export const THEMES: Record<ThemeId, { label: string; preview: string[] }> = {
  'dark-cyan': { label: '黑夜·青', preview: ['bg-slate-950', 'bg-slate-800', 'bg-cyan-400'] },
  light: { label: '明亮日间', preview: ['bg-slate-100', 'bg-slate-800', 'bg-cyan-500'] },
  'dark-violet': { label: '黑夜·紫', preview: ['bg-slate-950', 'bg-slate-800', 'bg-violet-400'] },
  'dark-amber': { label: '黑夜·琥珀', preview: ['bg-slate-950', 'bg-slate-800', 'bg-amber-400'] },
}

export const TIMBRES: Record<TimbreId, { label: string; description: string }> = {
  sine: { label: '正弦波', description: '柔和纯净，接近音叉' },
  triangle: { label: '三角波', description: '温暖圆润（默认）' },
  square: { label: '方波', description: '明亮电子，经典合成器' },
  sawtooth: { label: '锯齿波', description: '明亮锐利，富有冲击力' },
  fm: { label: '电子 FM', description: 'FM 调制音色，金属质感' },
}

export const PLAYBACK_MODES: Record<PlaybackMode, { label: string; description: string }> = {
  simultaneous: { label: '同时播放', description: '多个音同时叠响（和声效果）' },
  sequential: { label: '逐音上行', description: '按音高从低到高逐个播放（旋律效果）' },
}

export const RHYTHM_VOICES: Record<RhythmVoiceId, { label: string; description: string }> = {
  drum: { label: '打击鼓', description: '膜音鼓点（默认）' },
  sine: { label: '正弦波 A4', description: '柔和纯净，以 A4 发声' },
  triangle: { label: '三角波 A4', description: '温暖圆润，以 A4 发声' },
  square: { label: '方波 A4', description: '明亮电子，以 A4 发声' },
  sawtooth: { label: '锯齿波 A4', description: '明亮锐利，以 A4 发声' },
  fm: { label: '电子 FM A4', description: 'FM 调制音色，以 A4 发声' },
}

export const RHYTHM_BPM_PRESETS = [60, 80, 90, 100, 120, 150, 180, 200]

export const RHYTHM_BPM_MIN = 60

export const RHYTHM_BPM_MAX = 200

export const STANDARD_COUNT_OPTIONS = [5, 10, 20, 30]

export const TIMED_LIMIT_OPTIONS = [60, 120, 180, 300]

export const DEFAULT_SETTINGS: UserSettings = {
  rootRange: 'full',
  pitchKeyMode: 'all',
  blackKeyMode: 'sharp',
  enabledIntervals: [],
  enabledChords: [],
  theme: 'dark-cyan',
  timbre: 'triangle',
  playbackMode: 'simultaneous',
  rhythmVoice: 'drum',
  rhythmBpm: 90,
  standardCount: 20,
  timedLimitSeconds: 120,
  volume: 0.8,
}

const SETTINGS_KEY = 'ear-trainer.settings'
const RECORDS_KEY = 'ear-trainer.records'
const MANUSCRIPTS_KEY = 'ear-trainer.manuscripts'

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

export function loadManuscripts(): Manuscript[] {
  try {
    const raw = localStorage.getItem(MANUSCRIPTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveManuscripts(manuscripts: Manuscript[]): void {
  try {
    localStorage.setItem(MANUSCRIPTS_KEY, JSON.stringify(manuscripts))
  } catch {
    // ignore
  }
}

/**
 * 生成下一个手稿默认名「新建手稿-x」：x 取现有手稿名中
 * 「新建手稿 / 新建手稿-N」的最大序号 + 1，保证不重号。
 */
export function nextManuscriptName(manuscripts: Manuscript[]): string {
  const pattern = new RegExp(`^${MANUSCRIPT_NAME_PREFIX}(?:-(\\d+))?$`)
  let max = 0
  for (const m of manuscripts) {
    const match = pattern.exec(m.name)
    if (match) max = Math.max(max, match[1] ? Number(match[1]) : 0)
  }
  return `${MANUSCRIPT_NAME_PREFIX}-${max + 1}`
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
