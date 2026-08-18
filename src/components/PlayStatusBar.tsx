import { useEffect, useState } from 'react'
import { PLAY_BPM_MAX, PLAY_BPM_MIN, PLAY_BPM_PRESETS, PLAY_MIN_STEPS } from '../constants/playConfig'
import type { MinStep, TimeSignature } from '../types'

interface PlayStatusBarProps {
  bpm: number
  minStep: MinStep
  timeSignature: TimeSignature
  startTick: number
  canUndo: boolean
  canRedo: boolean
  locked: boolean
  isPlaying: boolean
  isPaused: boolean
  onBpmChange: (bpm: number) => void
  onMinStepChange: (step: MinStep) => void
  onTimeSignatureChange: (ts: TimeSignature) => void
  onUndo: () => void
  onRedo: () => void
  onResetStartTick: () => void
  onPlay: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export default function PlayStatusBar({
  bpm,
  minStep,
  timeSignature,
  startTick,
  canUndo,
  canRedo,
  locked,
  isPlaying,
  isPaused,
  onBpmChange,
  onMinStepChange,
  onTimeSignatureChange,
  onUndo,
  onRedo,
  onResetStartTick,
  onPlay,
  onPause,
  onResume,
  onStop,
}: PlayStatusBarProps) {
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
          {(['4/4', '3/4'] as const).map((ts) => (
            <button
              key={ts}
              type="button"
              onClick={() => onTimeSignatureChange(ts)}
              disabled={locked}
              title={ts === '3/4' ? '切换拍号将清空当前网格（可撤回）' : undefined}
              className={`px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                timeSignature === ts ? 'bg-cyan-500/10 font-medium text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {ts}
            </button>
          ))}
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
              disabled={locked}
              className={`rounded-md border px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
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
            disabled={locked}
            className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
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
              disabled={locked}
              className={`px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                minStep === s ? 'bg-cyan-500/10 font-medium text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              1/{s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">起点</span>
        <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300" title="播放起点（格）">
          {startTick}
        </span>
        <button
          type="button"
          onClick={onResetStartTick}
          disabled={startTick === 0 || locked}
          title="将播放起点复位到开头"
          className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↺ 复位
        </button>
      </div>

      <div className="flex items-center gap-1">
        {isPlaying ? (
          <>
            <button
              type="button"
              onClick={onPause}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800/60"
            >
              ⏸ 暂停
            </button>
            <button
              type="button"
              onClick={onStop}
              className="rounded-lg border border-rose-500/50 px-3 py-1.5 text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
            >
              ⏹ 停止
            </button>
          </>
        ) : isPaused ? (
          <>
            <button
              type="button"
              onClick={onResume}
              className="rounded-lg border border-cyan-500/50 px-3 py-1.5 text-sm text-cyan-300 transition-colors hover:bg-cyan-500/10"
            >
              ▶ 继续
            </button>
            <button
              type="button"
              onClick={onStop}
              className="rounded-lg border border-rose-500/50 px-3 py-1.5 text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
            >
              ⏹ 停止
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="rounded-lg bg-cyan-500 px-4 py-1.5 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-400"
          >
            ▶ 播放
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || locked}
          title="撤回（仅网格音符编辑）"
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↶ 撤回
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo || locked}
          title="恢复（仅网格音符编辑）"
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↷ 恢复
        </button>
      </div>
    </section>
  )
}
