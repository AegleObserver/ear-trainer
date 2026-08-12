import { useMemo } from 'react'
import {
  PLAY_BAR_COUNT,
  PLAY_BEATS_PER_BAR,
  PLAY_CELL_W,
  PLAY_PITCH_HI,
  PLAY_PITCH_LO,
  PLAY_ROW_H,
} from '../constants/playConfig'
import { midiToNote } from '../theory/notes'
import type { MinStep, PlayTrack } from '../types'

const TRACK_COLORS = ['bg-cyan-400', 'bg-emerald-400', 'bg-violet-400', 'bg-amber-400']

interface PitchGridProps {
  tracks: PlayTrack[]
  activeTrackId: string
  minStep: MinStep
}

export default function PitchGrid({ tracks, activeTrackId, minStep }: PitchGridProps) {
  const stepsPerBeat = minStep / 4
  const stepsPerBar = PLAY_BEATS_PER_BAR * stepsPerBeat
  const totalSteps = PLAY_BAR_COUNT * stepsPerBar
  const rowCount = PLAY_PITCH_HI - PLAY_PITCH_LO + 1
  const width = totalSteps * PLAY_CELL_W
  const height = rowCount * PLAY_ROW_H

  const pitches = useMemo(() => {
    const rows: number[] = []
    for (let p = PLAY_PITCH_HI; p >= PLAY_PITCH_LO; p -= 1) rows.push(p)
    return rows
  }, [])

  const gridBackground = useMemo(() => {
    const stepLines =
      `repeating-linear-gradient(to right, transparent 0 ${PLAY_CELL_W - 1}px, rgba(148,163,184,0.15) ${PLAY_CELL_W - 1}px ${PLAY_CELL_W}px), ` +
      `repeating-linear-gradient(to bottom, transparent 0 ${PLAY_ROW_H - 1}px, rgba(148,163,184,0.12) ${PLAY_ROW_H - 1}px ${PLAY_ROW_H}px)`
    const barLines = `repeating-linear-gradient(to right, transparent 0 ${stepsPerBar * PLAY_CELL_W - 1}px, rgba(148,163,184,0.35) ${stepsPerBar * PLAY_CELL_W - 1}px ${stepsPerBar * PLAY_CELL_W}px)`
    return `${stepLines}, ${barLines}`
  }, [stepsPerBar])

  const notes = useMemo(
    () =>
      tracks.flatMap((track, trackIndex) =>
        track.notes.map((n) => ({
          key: `${track.id}:${n.pitch}:${n.start}:${n.dur}`,
          left: n.start * PLAY_CELL_W,
          top: (PLAY_PITCH_HI - n.pitch) * PLAY_ROW_H,
          width: n.dur * PLAY_CELL_W,
          color: TRACK_COLORS[trackIndex % TRACK_COLORS.length],
          isActive: track.id === activeTrackId,
          muted: track.muted,
        })),
      ),
    [tracks, activeTrackId],
  )

  return (
    <section className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <div className="flex min-w-max">
          <div className="sticky left-0 z-10 border-r border-slate-800 bg-slate-900">
            <div className="flex h-6 items-center justify-end pr-2 text-[10px] text-slate-500">音高</div>
            {pitches.map((p) => (
              <div
                key={p}
                className="flex items-center justify-end pr-2 text-[10px] text-slate-400"
                style={{ height: PLAY_ROW_H }}
              >
                {midiToNote(p)}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            <div
              className="flex h-6 items-center border-b border-slate-800 text-[10px] text-slate-500"
              style={{ width }}
            >
              {Array.from({ length: PLAY_BAR_COUNT }, (_, bar) => (
                <div key={bar} className="flex items-center pl-1" style={{ width: stepsPerBar * PLAY_CELL_W }}>
                  小节 {bar + 1}
                </div>
              ))}
            </div>
            <div className="relative" style={{ width, height }}>
              <div className="absolute inset-0" style={{ backgroundImage: gridBackground }} />
              {notes.map((n) => (
                <div
                  key={n.key}
                  className={`absolute rounded-sm ${n.color} ${
                    n.isActive ? 'ring-1 ring-white/60' : ''
                  } ${n.muted ? 'opacity-30' : 'opacity-80'}`}
                  style={{ left: n.left + 1, top: n.top + 1, width: n.width - 2, height: PLAY_ROW_H - 2 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
