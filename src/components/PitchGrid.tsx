import { useEffect, useMemo, useRef, useState } from 'react'
import {
  PLAY_BAR_COUNT,
  PLAY_BEATS_PER_BAR,
  PLAY_CELL_W,
  PLAY_PITCH_HI,
  PLAY_PITCH_LO,
  PLAY_ROW_H,
  PLAY_TRACK_COLORS,
} from '../constants/playConfig'
import { midiToNote } from '../theory/notes'
import type { MinStep, PlayNote, PlayTrack } from '../types'

interface PitchGridProps {
  tracks: PlayTrack[]
  activeTrackId: string
  minStep: MinStep
  startTick: number
  editable: boolean
  onAddNote: (trackId: string, note: PlayNote) => void
  onRemoveNote: (trackId: string, note: PlayNote) => void
  onSetStartTick: (tick: number) => void
}

interface DragState {
  pitch: number
  start: number
  end: number
}

export default function PitchGrid({
  tracks,
  activeTrackId,
  minStep,
  startTick,
  editable,
  onAddNote,
  onRemoveNote,
  onSetStartTick,
}: PitchGridProps) {
  const stepsPerBeat = minStep / 4
  const stepsPerBar = PLAY_BEATS_PER_BAR * stepsPerBeat
  const totalSteps = PLAY_BAR_COUNT * stepsPerBar
  const rowCount = PLAY_PITCH_HI - PLAY_PITCH_LO + 1
  const width = totalSteps * PLAY_CELL_W
  const height = rowCount * PLAY_ROW_H

  const areaRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)

  useEffect(() => {
    setDrag(null)
  }, [activeTrackId])

  const activeTrack = tracks.find((t) => t.id === activeTrackId) ?? tracks[0]

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
          color: PLAY_TRACK_COLORS[trackIndex % PLAY_TRACK_COLORS.length],
          isActive: track.id === activeTrackId,
          muted: track.muted,
        })),
      ),
    [tracks, activeTrackId],
  )

  const occupiedCells = useMemo(() => {
    const map = new Set<string>()
    for (const n of activeTrack.notes) {
      for (let i = 0; i < n.dur; i += 1) map.add(`${n.pitch}:${n.start + i}`)
    }
    return map
  }, [activeTrack])

  const cellFromEvent = (e: React.PointerEvent) => {
    const rect = areaRef.current!.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / PLAY_CELL_W)
    const y = Math.floor((e.clientY - rect.top) / PLAY_ROW_H)
    const step = Math.min(Math.max(x, 0), totalSteps - 1)
    const pitch = Math.min(Math.max(PLAY_PITCH_HI - y, PLAY_PITCH_LO), PLAY_PITCH_HI)
    return { step, pitch }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!editable) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const { step, pitch } = cellFromEvent(e)
    if (occupiedCells.has(`${pitch}:${step}`)) {
      const note = activeTrack.notes.find((n) => n.pitch === pitch && n.start <= step && step < n.start + n.dur)
      if (note) onRemoveNote(activeTrackId, note)
      return
    }
    setDrag({ pitch, start: step, end: step })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!editable || !drag) return
    const { step } = cellFromEvent(e)
    setDrag((d) => (d ? { ...d, end: Math.max(d.start, Math.min(step, totalSteps - 1)) } : d))
  }

  const handlePointerUp = () => {
    if (!editable || !drag) return
    onAddNote(activeTrackId, { pitch: drag.pitch, start: drag.start, dur: drag.end - drag.start + 1 })
    setDrag(null)
  }

  const handlePointerCancel = () => {
    setDrag(null)
  }

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
                <button
                  key={bar}
                  type="button"
                  onClick={() => onSetStartTick(bar * stepsPerBar)}
                  disabled={!editable}
                  title="点击设为播放起点"
                  className="flex h-full cursor-pointer items-center pl-1 text-left transition-colors hover:bg-cyan-500/10 hover:text-cyan-300 disabled:cursor-not-allowed"
                  style={{ width: stepsPerBar * PLAY_CELL_W }}
                >
                  小节 {bar + 1}
                </button>
              ))}
            </div>
            <div
              ref={areaRef}
              className="relative cursor-crosshair touch-none select-none"
              style={{ width, height }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <div className="absolute inset-0" style={{ backgroundImage: gridBackground }} />
              {startTick > 0 && (
                <div
                  className="absolute bottom-0 top-0 z-10 w-0.5 bg-rose-400/80"
                  style={{ left: startTick * PLAY_CELL_W }}
                  title={`播放起点 ${startTick}`}
                />
              )}
              {notes.map((n) => (
                <div
                  key={n.key}
                  className={`absolute rounded-sm ${n.color} ${
                    n.isActive ? 'ring-1 ring-white/60' : ''
                  } ${n.muted ? 'opacity-30' : 'opacity-80'}`}
                  style={{ left: n.left + 1, top: n.top + 1, width: n.width - 2, height: PLAY_ROW_H - 2 }}
                />
              ))}
              {drag && (
                <div
                  className="absolute rounded-sm bg-cyan-300/70"
                  style={{
                    left: drag.start * PLAY_CELL_W + 1,
                    top: (PLAY_PITCH_HI - drag.pitch) * PLAY_ROW_H + 1,
                    width: (drag.end - drag.start + 1) * PLAY_CELL_W - 2,
                    height: PLAY_ROW_H - 2,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
