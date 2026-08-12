import { useEffect, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import {
  PLAYBACK_MODES,
  RHYTHM_BPM_MAX,
  RHYTHM_BPM_MIN,
  RHYTHM_BPM_PRESETS,
  RHYTHM_VOICES,
  STANDARD_COUNT_OPTIONS,
  THEMES,
  TIMBRES,
  TIMED_LIMIT_OPTIONS,
} from '../data/storage'
import type { PlaybackMode, RhythmVoiceId, ThemeId, TimbreId } from '../types'

export default function SettingsPage() {
  const { settings, updateSettings } = useAppData()
  const [bpmInput, setBpmInput] = useState(String(settings.rhythmBpm))

  useEffect(() => {
    setBpmInput(String(settings.rhythmBpm))
  }, [settings.rhythmBpm])

  const handleBpmChange = (value: string) => {
    setBpmInput(value)
    const num = Number(value)
    if (Number.isFinite(num) && num >= RHYTHM_BPM_MIN && num <= RHYTHM_BPM_MAX) {
      updateSettings({ rhythmBpm: num })
    }
  }

  const handleBpmBlur = () => {
    const num = Number(bpmInput)
    if (!Number.isFinite(num)) {
      setBpmInput(String(settings.rhythmBpm))
      return
    }
    const clamped = Math.min(RHYTHM_BPM_MAX, Math.max(RHYTHM_BPM_MIN, Math.round(num)))
    setBpmInput(String(clamped))
    updateSettings({ rhythmBpm: clamped })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <h2 className="text-xl font-bold">设置</h2>

      <section className="panel flex flex-col gap-4 p-4">
        <div>
          <h3 className="mb-3 font-semibold">页面风格</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  settings.theme === id
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === id}
                  onChange={() => updateSettings({ theme: id })}
                  className="accent-cyan-400"
                />
                <span className="flex items-center gap-1" aria-hidden>
                  {THEMES[id].preview.map((cls, i) => (
                    <span key={i} className={`inline-block h-3 w-3 rounded-full ${cls}`} />
                  ))}
                </span>
                {THEMES[id].label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">音色类型</h3>
          <div className="flex flex-col gap-2">
            {(Object.keys(TIMBRES) as TimbreId[]).map((id) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  settings.timbre === id
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="timbre"
                  checked={settings.timbre === id}
                  onChange={() => updateSettings({ timbre: id })}
                  className="accent-cyan-400"
                />
                <span className="font-medium">{TIMBRES[id].label}</span>
                <span className="text-xs text-slate-500">{TIMBRES[id].description}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold">播放方式</h3>
          <div className="flex flex-col gap-2">
            {(Object.keys(PLAYBACK_MODES) as PlaybackMode[]).map((id) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  settings.playbackMode === id
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="playback"
                  checked={settings.playbackMode === id}
                  onChange={() => updateSettings({ playbackMode: id })}
                  className="accent-cyan-400"
                />
                <span className="font-medium">{PLAYBACK_MODES[id].label}</span>
                <span className="text-xs text-slate-500">{PLAYBACK_MODES[id].description}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="panel flex flex-col gap-4 p-4">
        <h3 className="font-semibold">节奏</h3>

        <div>
          <p className="mb-2 text-sm text-slate-400">节奏音色</p>
          <div className="flex flex-col gap-2">
            {(Object.keys(RHYTHM_VOICES) as RhythmVoiceId[]).map((id) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  settings.rhythmVoice === id
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="rhythmVoice"
                  checked={settings.rhythmVoice === id}
                  onChange={() => updateSettings({ rhythmVoice: id })}
                  className="accent-cyan-400"
                />
                <span className="font-medium">{RHYTHM_VOICES[id].label}</span>
                <span className="text-xs text-slate-500">{RHYTHM_VOICES[id].description}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-400">速度 BPM（60–200）</p>
          <div className="flex flex-wrap gap-2">
            {RHYTHM_BPM_PRESETS.map((bpm) => (
              <button
                key={bpm}
                type="button"
                onClick={() => updateSettings({ rhythmBpm: bpm })}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  settings.rhythmBpm === bpm
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {bpm}
              </button>
            ))}
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-400">
            <span>自定义</span>
            <input
              type="number"
              min={RHYTHM_BPM_MIN}
              max={RHYTHM_BPM_MAX}
              value={bpmInput}
              onChange={(e) => handleBpmChange(e.target.value)}
              onBlur={handleBpmBlur}
              className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500"
            />
            <span>BPM</span>
          </label>
          <p className="mt-1 text-xs text-slate-500">提示：超出范围自动归界；对节奏测试与节奏训练场生效。</p>
        </div>
      </section>

      <section className="panel flex flex-col gap-4 p-4">
        <h3 className="font-semibold">测试参数</h3>

        <div>
          <p className="mb-2 text-sm text-slate-400">标准模式题量</p>
          <div className="flex flex-wrap gap-2">
            {STANDARD_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => updateSettings({ standardCount: count })}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  settings.standardCount === count
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {count} 题
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-400">限时模式时长</p>
          <div className="flex flex-wrap gap-2">
            {TIMED_LIMIT_OPTIONS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => updateSettings({ timedLimitSeconds: seconds })}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  settings.timedLimitSeconds === seconds
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {seconds >= 60 ? `${seconds / 60} 分钟` : `${seconds} 秒`}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">提示：修改后对下一局测试生效。</p>
      </section>
    </div>
  )
}
