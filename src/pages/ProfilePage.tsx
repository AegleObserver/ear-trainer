import { CHORDS } from '../theory/chords'
import { INTERVALS } from '../theory/intervals'
import { computeRating, ROOT_RANGES } from '../data/storage'
import { useAppData } from '../context/AppDataContext'
import type { GameMode, Mode, PitchKeyMode, RootRangeId } from '../types'

const QUESTION_TYPE_LABELS: Record<Mode, string> = {
  pitch: '音名',
  interval: '音程',
  chord: '和弦',
  rhythm: '节奏',
}

const GAME_MODE_LABELS: Record<GameMode, string> = {
  standard: '标准',
  timed: '限时',
  endless: '无限',
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProfilePage() {
  const { settings, updateSettings, records, clearRecords } = useAppData()
  const rating = computeRating(records)
  const recent = records.slice(0, 10)

  const toggleInterval = (semitones: number) => {
    const set = new Set(settings.enabledIntervals)
    if (set.has(semitones)) set.delete(semitones)
    else set.add(semitones)
    updateSettings({ enabledIntervals: [...set] })
  }

  const toggleChord = (name: string) => {
    const set = new Set(settings.enabledChords)
    if (set.has(name)) set.delete(name)
    else set.add(name)
    updateSettings({ enabledChords: [...set] })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <h2 className="text-xl font-bold">个人中心</h2>

      <div className="panel grid grid-cols-3 gap-4 p-4 text-center">
        <div>
          <p className="text-xs text-slate-500">参与次数</p>
          <p className="text-3xl font-bold text-cyan-400">{records.length}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">平均准确率</p>
          <p className="text-3xl font-bold text-emerald-400">
            {records.length > 0 ? `${rating.score}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">当前评级</p>
          <p
            className={`text-3xl font-bold ${
              rating.level === 0
                ? 'text-slate-500'
                : rating.level >= 5
                  ? 'text-amber-400'
                  : rating.level >= 3
                    ? 'text-cyan-400'
                    : 'text-emerald-400'
            }`}
          >
            {rating.label}
          </p>
        </div>
      </div>

      <section className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">最近记录</h3>
          {records.length > 0 && (
            <button type="button" onClick={clearRecords} className="btn-ghost px-3 py-1 text-xs">
              清空记录
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">暂无记录，去完成一局音感测试吧</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((r) => {
              const acc = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-slate-800/40 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{formatTime(r.timestamp)}</span>
                    <span>{QUESTION_TYPE_LABELS[r.questionType]}</span>
                    <span className="rounded bg-slate-700/70 px-1.5 py-0.5 text-xs text-slate-300">
                      {GAME_MODE_LABELS[r.mode]}
                    </span>
                  </div>
                  <span className={r.correct >= r.total / 2 ? 'text-emerald-300' : 'text-rose-300'}>
                    {r.correct}/{r.total} · {acc}%
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="panel flex flex-col gap-5 p-4">
        <h3 className="font-semibold">考察配置</h3>

        <div>
          <p className="mb-2 text-sm text-slate-400">根音区间</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ROOT_RANGES) as RootRangeId[]).map((id) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  settings.rootRange === id
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="rootRange"
                  checked={settings.rootRange === id}
                  onChange={() => updateSettings({ rootRange: id })}
                  className="accent-cyan-400"
                />
                {ROOT_RANGES[id].label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-400">单音考察</p>
          <div className="flex flex-wrap gap-2">
            {(['white', 'all'] as PitchKeyMode[]).map((key) => (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  settings.pitchKeyMode === key
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="pitchKey"
                  checked={settings.pitchKeyMode === key}
                  onChange={() => updateSettings({ pitchKeyMode: key })}
                  className="accent-cyan-400"
                />
                {key === 'white' ? '白键（自然音）' : '全键（含升降号）'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-400">音程考察</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {INTERVALS.map((i) => (
              <label
                key={i.semitones}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  settings.enabledIntervals.includes(i.semitones)
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={settings.enabledIntervals.includes(i.semitones)}
                  onChange={() => toggleInterval(i.semitones)}
                  className="accent-cyan-400"
                />
                {i.name}
                <span className="ml-auto text-xs text-slate-500">{i.semitones} 半音</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-400">和弦考察</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CHORDS.map((c) => (
              <label
                key={c.name}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  settings.enabledChords.includes(c.name)
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={settings.enabledChords.includes(c.name)}
                  onChange={() => toggleChord(c.name)}
                  className="accent-cyan-400"
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">提示：音程/和弦未勾选任何项时，将使用全部。</p>
      </section>
    </div>
  )
}
