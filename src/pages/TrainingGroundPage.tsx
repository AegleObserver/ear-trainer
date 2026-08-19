import { useCallback, useEffect, useRef, useState } from 'react'
import { playChord, playInterval, playNote } from '../audio/playNotes'
import SoundDomainToggle from '../components/SoundDomainToggle'
import { useAppData } from '../context/AppDataContext'
import { CHORDS } from '../theory/chords'
import { INTERVALS } from '../theory/intervals'
import { formatNoteName, midiToNote, NOTE_NAMES, noteToMidi } from '../theory/notes'
import type { ChordDef, IntervalDef, SoundDomain } from '../types'
import RhythmGroundPage from './RhythmGroundPage'

type Selection = { type: 'interval'; def: IntervalDef } | { type: 'chord'; def: ChordDef }

const MIN_OCTAVE = 2
const MAX_OCTAVE = 6
const PLAY_DURATION_MS = 1300

const selectionKey = (sel: Selection) => `${sel.type}:${sel.def.name}`

export default function TrainingGroundPage() {
  const { settings } = useAppData()
  const [domain, setDomain] = useState<SoundDomain>('pitch')
  const [pitchClass, setPitchClass] = useState<(typeof NOTE_NAMES)[number]>('C')
  const [octave, setOctave] = useState(4)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [playingKey, setPlayingKey] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const rootName = `${pitchClass}${octave}`
  const rootMidi = noteToMidi(rootName)
  const playing = playingKey !== null

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const play = useCallback(
    async (key: string, notes: string[], kind: 'note' | 'interval' | 'chord') => {
      clearTimer()
      setPlayingKey(key)
      if (kind === 'note') await playNote(notes[0])
      else if (kind === 'interval') await playInterval(notes[0], notes[1])
      else await playChord(notes)
      timerRef.current = window.setTimeout(() => {
        setPlayingKey(null)
        timerRef.current = null
      }, PLAY_DURATION_MS)
    },
    [clearTimer],
  )

  const buildNotes = useCallback(
    (sel: Selection): string[] => {
      if (sel.type === 'interval') {
        return [midiToNote(rootMidi), midiToNote(rootMidi + sel.def.semitones)]
      }
      return sel.def.intervals.map((i) => midiToNote(rootMidi + i))
    },
    [rootMidi],
  )

  const isSelected = (sel: Selection) =>
    selection !== null && selectionKey(selection) === selectionKey(sel)

  const handleSelect = (sel: Selection) => {
    if (playing) return
    if (isSelected(sel)) {
      setSelection(null)
      return
    }
    setSelection(sel)
    play(sel.def.name, buildNotes(sel), sel.type === 'interval' ? 'interval' : 'chord')
  }

  const handleMainPlay = () => {
    if (playing) return
    if (selection) {
      play(selection.def.name, buildNotes(selection), selection.type === 'interval' ? 'interval' : 'chord')
    } else {
      play('root', [rootName], 'note')
    }
  }

  const soundLabel = selection
    ? `${selection.type === 'interval' ? '音程' : '和弦'} · ${selection.def.name}`
    : '仅根音'

  const activeNotes = selection ? buildNotes(selection) : [rootName]

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">训练场</h2>
        <SoundDomainToggle domain={domain} onChange={setDomain} />
      </div>

      {domain === 'rhythm' ? (
        <RhythmGroundPage />
      ) : (
        <>
          <p className="text-sm text-slate-400">选择根音，点击音程或和弦即可聆听对应声音；未勾选时只播放根音。</p>

          <section className="panel flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">当前根音</span>
                <span className="text-4xl font-bold tracking-tight text-cyan-400">
                  {formatNoteName(rootName, settings.blackKeyMode)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOctave((o) => Math.max(MIN_OCTAVE, o - 1))}
                  disabled={playing || octave <= MIN_OCTAVE}
                  className="btn-ghost !px-3 !py-1"
                >
                  −
                </button>
                <span className="w-8 text-center text-lg font-semibold">{octave}</span>
                <button
                  type="button"
                  onClick={() => setOctave((o) => Math.min(MAX_OCTAVE, o + 1))}
                  disabled={playing || octave >= MAX_OCTAVE}
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
                  } ${playing ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <input
                    type="radio"
                    name="rootPitch"
                    checked={pitchClass === name}
                    onChange={() => setPitchClass(name)}
                    disabled={playing}
                    className="sr-only"
                  />
                  {formatNoteName(name, settings.blackKeyMode)}
                </label>
              ))}
            </div>

            <div className="rounded-xl bg-slate-800/40 px-3 py-2 text-sm text-slate-300">
              将播放：{soundLabel}
              <span className="ml-2 text-slate-500">
                {activeNotes.map((n) => formatNoteName(n, settings.blackKeyMode)).join(' → ')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleMainPlay}
              disabled={playing}
              className="btn-primary"
            >
              {playing ? '播放中…' : '播放'}
            </button>
          </section>

          <section className="panel flex flex-col gap-3 p-4">
            <h3 className="font-semibold">音程（点击即播放）</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {INTERVALS.map((i) => {
                const sel: Selection = { type: 'interval', def: i }
                const active = playingKey === i.name && isSelected(sel)
                const selected = isSelected(sel)
                return (
                  <button
                    key={i.name}
                    type="button"
                    onClick={() => handleSelect(sel)}
                    disabled={playing}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selected
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-700 text-slate-300 hover:border-slate-500'
                    } ${active ? 'animate-pulse' : ''} ${playing ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <span>{i.name}</span>
                    <span className="text-xs text-slate-500">{i.semitones} 半音</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="panel flex flex-col gap-3 p-4">
            <h3 className="font-semibold">和弦（点击即播放）</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CHORDS.map((c) => {
                const sel: Selection = { type: 'chord', def: c }
                const active = playingKey === c.name && isSelected(sel)
                const selected = isSelected(sel)
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelect(sel)}
                    disabled={playing}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selected
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-700 text-slate-300 hover:border-slate-500'
                    } ${active ? 'animate-pulse' : ''} ${playing ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-slate-500">{c.intervals.length} 音</span>
                  </button>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
