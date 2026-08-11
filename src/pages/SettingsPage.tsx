import { useAppData } from '../context/AppDataContext'
import { STANDARD_COUNT_OPTIONS, THEMES, TIMBRES, TIMED_LIMIT_OPTIONS } from '../data/storage'
import type { ThemeId, TimbreId } from '../types'

export default function SettingsPage() {
  const { settings, updateSettings } = useAppData()

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
