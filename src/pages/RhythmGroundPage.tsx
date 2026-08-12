import { useCallback, useMemo, useRef, useState } from 'react'
import { playRhythmQuestion } from '../audio/rhythmPlay'
import RhythmPatternView from '../components/RhythmPatternView'
import { NOTE_VALUES, NOTE_VALUE_BY_ID, patternToLabel } from '../theory/rhythm'
import type { NoteValueId } from '../theory/rhythm'

const MAX_NOTES = 4
const MAX_BEATS = 4

export default function RhythmGroundPage() {
  const [pattern, setPattern] = useState<NoteValueId[]>([])
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)

  const labels = pattern.map((id) => NOTE_VALUE_BY_ID[id].label)
  const full = pattern.length >= MAX_NOTES
  const beats = useMemo(
    () => pattern.reduce((sum, id) => sum + NOTE_VALUE_BY_ID[id].beats, 0),
    [pattern],
  )

  const play = useCallback(async () => {
    if (playingRef.current || pattern.length === 0) return
    playingRef.current = true
    setPlaying(true)
    try {
      await playRhythmQuestion(labels)
    } finally {
      playingRef.current = false
      setPlaying(false)
    }
  }, [labels, pattern.length])

  const append = (id: NoteValueId) => {
    if (playing || full) return
    const beatsToAdd = NOTE_VALUE_BY_ID[id].beats
    setPattern((p) => {
      const sum = p.reduce((acc, pid) => acc + NOTE_VALUE_BY_ID[pid].beats, 0)
      if (sum + beatsToAdd > MAX_BEATS) return p
      return [...p, id]
    })
  }

  const removeLast = () => {
    if (playing) return
    setPattern((p) => p.slice(0, -1))
  }

  const clear = () => {
    if (playing) return
    setPattern([])
  }

  const canAdd = (beatsToAdd: number) => !playing && !full && beats + beatsToAdd <= MAX_BEATS

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-400">
        点选音符值拼接节奏型，总时值不超过一个小节（最多 {MAX_BEATS} 拍）。播放时将直接奏出节奏（仅一遍）。
      </p>

      <section className="panel flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">当前节奏</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={removeLast}
              disabled={playing || pattern.length === 0}
              className="btn-ghost !px-3 !py-1 text-sm"
            >
              删末位
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={playing || pattern.length === 0}
              className="btn-ghost !px-3 !py-1 text-sm"
            >
              清空
            </button>
          </div>
        </div>

        {pattern.length === 0 ? (
          <p className="rounded-xl bg-slate-800/40 px-3 py-6 text-center text-sm text-slate-500">
            尚未添加音符
          </p>
        ) : (
          <div className="rounded-xl bg-slate-800/40 px-3 py-4">
            <RhythmPatternView labels={labels} />
            <p className="mt-2 text-center text-xs text-slate-500">{patternToLabel(pattern)}</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-500">
          当前时值 {beats} / {MAX_BEATS} 拍{beats >= MAX_BEATS ? '（已满一个小节）' : `（还差 ${MAX_BEATS - beats} 拍）`}
        </p>

        <button
          type="button"
          onClick={play}
          disabled={playing || pattern.length === 0}
          className="btn-primary"
        >
          {playing ? '播放中…' : '播放节奏'}
        </button>
      </section>

      <section className="panel flex flex-col gap-3 p-4">
        <h3 className="font-semibold">音符值（点击添加）</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {NOTE_VALUES.map((v) => {
            const addable = canAdd(v.beats)
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => append(v.id)}
                disabled={!addable}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-sm transition-colors ${
                  !addable
                    ? 'cursor-not-allowed border-slate-800 text-slate-600 opacity-50'
                    : 'border-slate-700 text-slate-300 hover:border-cyan-500'
                }`}
              >
                <span>{v.label}</span>
                <span className="text-xs text-slate-500">{v.beats} 拍</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
