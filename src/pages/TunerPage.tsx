import { useMemo, useState } from 'react'
import { playNote } from '../audio/playNotes'
import { useAppData } from '../context/AppDataContext'
import { useTuner } from '../hooks/useTuner'
import { NOTE_NAMES, formatNoteName, midiToFrequency, noteToMidi } from '../theory/notes'
import { GUITAR_STRINGS, UKULELE_STRINGS, type StringDef } from '../theory/tuning'
import type { TunerMode } from '../types'

const MODES: { id: TunerMode; label: string }[] = [
  { id: 'guitar', label: '吉他' },
  { id: 'ukulele', label: '尤克里里' },
  { id: 'custom', label: '自定义音' },
]

const MIN_OCTAVE = 2
const MAX_OCTAVE = 6

interface TunerPageProps {
  active: boolean
}

export default function TunerPage({ active }: TunerPageProps) {
  const { settings } = useAppData()
  const [mode, setMode] = useState<TunerMode>('guitar')
  const [pitchClass, setPitchClass] = useState<(typeof NOTE_NAMES)[number]>('A')
  const [octave, setOctave] = useState(4)
  const [pinned, setPinned] = useState<number | null>(null)
  const { listening, reading, error, start, stop } = useTuner(active)

  const customMidi = noteToMidi(`${pitchClass}${octave}`)

  const strings: StringDef[] = mode === 'guitar' ? GUITAR_STRINGS : UKULELE_STRINGS

  const nearestString = useMemo(() => {
    if (!reading) return -1
    let best = 0
    let bestDist = Infinity
    strings.forEach((s, i) => {
      const dist = Math.abs(s.midi - reading.midi)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    return best
  }, [reading, strings])

  const targetIndex = mode === 'custom' ? -1 : (pinned ?? nearestString)
  const targetMidi = mode === 'custom' ? customMidi : targetIndex >= 0 ? strings[targetIndex].midi : -1

  const centsToTarget =
    reading && targetMidi >= 0 ? Math.round(1200 * Math.log2(reading.freq / midiToFrequency(targetMidi))) : null

  const targetLabel =
    mode === 'custom'
      ? formatNoteName(`${pitchClass}${octave}`, settings.blackKeyMode)
      : targetIndex >= 0
        ? `${strings[targetIndex].name} ${strings[targetIndex].note}`
        : '—'

  const statusText =
    centsToTarget === null ? null : Math.abs(centsToTarget) < 10 ? '准' : centsToTarget > 0 ? `偏高 ${centsToTarget} 音分` : `偏低 ${Math.abs(centsToTarget)} 音分`

  const meterPos = centsToTarget === null ? null : Math.max(-50, Math.min(50, centsToTarget)) / 100

  const switchMode = (next: TunerMode) => {
    setMode(next)
    setPinned(null)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">调音</h2>
        <div className="flex rounded-lg border border-slate-700 p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => switchMode(m.id)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                mode === m.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-400">
        播放一个音（弹奏琴弦或演唱），应用会识别音高并对照目标音判断音准。需要浏览器麦克风权限（HTTPS）。
      </p>

      {mode !== 'custom' && (
        <section className="panel flex flex-col gap-2 p-4">
          <h3 className="font-semibold">目标弦</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {strings.map((s, i) => {
              const isTarget = targetIndex === i
              const activeStr = reading && nearestString === i
              return (
                <div
                  key={s.note}
                  title={isTarget ? '已选为目标，再次点击取消固定' : '点击固定为目标弦'}
                  className={`flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-sm transition-colors ${
                    isTarget
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-xs text-slate-500">{s.name}</span>
                  <button
                    type="button"
                    onClick={() => setPinned((p) => (p === i ? null : i))}
                    className="flex items-center gap-1 hover:text-cyan-300"
                  >
                    {s.note}
                    {activeStr && <span className="text-[10px] text-cyan-400">▶</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => void playNote(s.note)}
                    className="text-[10px] text-slate-500 hover:text-cyan-300"
                  >
                    试听
                  </button>
                </div>
              )
            })}
          </div>
          {pinned !== null && (
            <button type="button" onClick={() => setPinned(null)} className="btn-ghost !px-3 !py-1 text-xs">
              取消固定（自动识别）
            </button>
          )}
        </section>
      )}

      {mode === 'custom' && (
        <section className="panel flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">目标音</span>
              <span className="text-4xl font-bold tracking-tight text-cyan-400">
                {formatNoteName(`${pitchClass}${octave}`, settings.blackKeyMode)}
              </span>
              <button
                type="button"
                onClick={() => void playNote(`${pitchClass}${octave}`)}
                className="btn-ghost !px-3 !py-1 text-sm"
              >
                试听
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOctave((o) => Math.max(MIN_OCTAVE, o - 1))}
                disabled={octave <= MIN_OCTAVE}
                className="btn-ghost !px-3 !py-1"
              >
                −
              </button>
              <span className="w-8 text-center text-lg font-semibold">{octave}</span>
              <button
                type="button"
                onClick={() => setOctave((o) => Math.min(MAX_OCTAVE, o + 1))}
                disabled={octave >= MAX_OCTAVE}
                className="btn-ghost !px-3 !py-1"
              >
                +
              </button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {NOTE_NAMES.map((name) => (
              <label
                key={name}
                className={`flex cursor-pointer items-center justify-center rounded-lg border px-1 py-1.5 text-sm transition-colors ${
                  pitchClass === name
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="tunerPitch"
                  checked={pitchClass === name}
                  onChange={() => setPitchClass(name)}
                  className="sr-only"
                />
                {formatNoteName(name, settings.blackKeyMode)}
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="panel flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">
              目标 · <span className="font-semibold text-slate-200">{targetLabel}</span>
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-cyan-400">
              {reading ? formatNoteName(reading.note, settings.blackKeyMode) : '—'}
              {reading && <span className="ml-2 text-base font-normal text-slate-500">{reading.freq.toFixed(1)} Hz</span>}
            </p>
          </div>
          {listening ? (
            <button type="button" onClick={stop} className="btn-ghost">
              停止检测
            </button>
          ) : (
            <button type="button" onClick={() => void start()} className="btn-primary">
              开始检测
            </button>
          )}
        </div>

        <div>
          <div className="relative mx-auto h-2 w-full max-w-sm rounded-full bg-slate-700">
            <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-slate-400" />
            {meterPos !== null && (
              <div
                className="absolute top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400"
                style={{ left: `calc(50% + ${meterPos * 50}%)` }}
              />
            )}
          </div>
          <div className="mx-auto mt-1 flex w-full max-w-sm justify-between text-xs text-slate-500">
            <span>偏低 −50</span>
            <span>准 0</span>
            <span>偏高 +50</span>
          </div>
        </div>

        <p className="text-center text-sm">
          {error ? (
            <span className="text-red-400">{error}</span>
          ) : statusText ? (
            <span
              className={
                Math.abs(centsToTarget ?? 0) < 10
                  ? 'font-semibold text-green-400'
                  : 'font-semibold text-amber-400'
              }
            >
              {statusText}
            </span>
          ) : listening ? (
            <span className="text-slate-500">等待声音…</span>
          ) : (
            <span className="text-slate-500">点击「开始检测」以启用麦克风</span>
          )}
        </p>
      </section>
    </div>
  )
}
