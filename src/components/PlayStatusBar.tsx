import { useEffect, useState } from 'react'
import { PLAY_BPM_MAX, PLAY_BPM_MIN, PLAY_BPM_PRESETS, PLAY_MIN_STEPS } from '../constants/playConfig'
import type { MinStep } from '../types'

interface PlayStatusBarProps {
  bpm: number
  minStep: MinStep
  onBpmChange: (bpm: number) => void
  onMinStepChange: (step: MinStep) => void
}

export default function PlayStatusBar({ bpm, minStep, onBpmChange, onMinStepChange }: PlayStatusBarProps) {
  const [bpmInput, setBpmInput] = useState(String(bpm))

  useEffect(() => {
    setBpmInput(String(bpm))
  }, [bpm])

  const handleBpmChange = (value: string) => {
    setBpmInput(value)
    const num = Number(value)
    if (Number.isFinite(num) && num >= PLAY_BPM_MIN && num <= PLAY_BPM_MAX) {
      onBpmChange(num)
    }
  }

  const handleBpmBlur = () => {
    const num = Number(bpmInput)
    if (!Number.isFinite(num)) {
      setBpmInput(String(bpm))
      return
    }
    const clamped = Math.min(PLAY_BPM_MAX, Math.max(PLAY_BPM_MIN, Math.round(num)))
    setBpmInput(String(clamped))
    onBpmChange(clamped)
  }

  return (
    <section className="panel flex flex-wrap items-center gap-x-6 gap-y-3 p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">拍号</span>
        <div className="flex overflow-hidden rounded-lg border border-slate-700">
          <button
            type="button"
            className="bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-300"
          >
            4/4
          </button>
          <button
            type="button"
            disabled
            title="即将开放"
            className="cursor-not-allowed px-3 py-1.5 text-sm text-slate-600"
          >
            3/4
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-400">BPM</span>
        <div className="flex flex-wrap gap-1">
          {PLAY_BPM_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onBpmChange(p)}
              className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                bpm === p
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1 text-sm text-slate-400">
          <input
            type="number"
            min={PLAY_BPM_MIN}
            max={PLAY_BPM_MAX}
            value={bpmInput}
            onChange={(e) => handleBpmChange(e.target.value)}
            onBlur={handleBpmBlur}
            className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500"
          />
          <span className="text-xs text-slate-500">BPM（60–240）</span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">最小分度</span>
        <div className="flex overflow-hidden rounded-lg border border-slate-700">
          {PLAY_MIN_STEPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onMinStepChange(s)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                minStep === s ? 'bg-cyan-500/10 font-medium text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              1/{s}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
