import { useCallback, useEffect, useRef, useState } from 'react'
import { PLAY_BPM_DEFAULT, PLAY_BPM_MAX, PLAY_BPM_MIN, PLAY_MIN_STEP_DEFAULT } from '../constants/playConfig'
import type { MinStep, PlayNote, PlayTrack, RhythmVoiceId } from '../types'

const INITIAL_TRACKS: PlayTrack[] = [{ id: 'track-1', voice: 'triangle', muted: false, notes: [] }]

let trackSeq = 1
const nextTrackId = () => `track-${++trackSeq}`

export default function usePlayEditor() {
  const [tracks, setTracks] = useState<PlayTrack[]>(INITIAL_TRACKS)
  const [activeTrackId, setActiveTrackId] = useState(INITIAL_TRACKS[0].id)
  const [bpm, setBpmState] = useState(PLAY_BPM_DEFAULT)
  const [minStep, setMinStepState] = useState<MinStep>(PLAY_MIN_STEP_DEFAULT)

  const tracksRef = useRef(tracks)
  useEffect(() => {
    tracksRef.current = tracks
  }, [tracks])

  const undoStack = useRef<PlayTrack[][]>([])
  const redoStack = useRef<PlayTrack[][]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const activeTrack = tracks.find((t) => t.id === activeTrackId) ?? tracks[0]

  const setBpm = useCallback((value: number) => {
    const clamped = Math.min(PLAY_BPM_MAX, Math.max(PLAY_BPM_MIN, Math.round(value)))
    setBpmState(clamped)
  }, [])

  const setMinStep = useCallback((step: MinStep) => {
    setMinStepState(step)
  }, [])

  const updateTrack = useCallback((trackId: string, updater: (t: PlayTrack) => PlayTrack) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? updater(t) : t)))
  }, [])

  const pushHistory = useCallback(() => {
    undoStack.current.push(tracksRef.current)
    redoStack.current = []
    setCanUndo(true)
    setCanRedo(false)
  }, [])

  const addNote = useCallback(
    (trackId: string, note: PlayNote) => {
      pushHistory()
      updateTrack(trackId, (t) => ({ ...t, notes: [...t.notes, note] }))
    },
    [pushHistory, updateTrack],
  )

  const removeNote = useCallback(
    (trackId: string, note: PlayNote) => {
      pushHistory()
      updateTrack(trackId, (t) => ({
        ...t,
        notes: t.notes.filter((n) => !(n.pitch === note.pitch && n.start === note.start && n.dur === note.dur)),
      }))
    },
    [pushHistory, updateTrack],
  )

  const undo = useCallback(() => {
    const prev = undoStack.current.pop()
    if (!prev) return
    redoStack.current.push(tracksRef.current)
    setTracks(prev)
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(true)
  }, [])

  const redo = useCallback(() => {
    const next = redoStack.current.pop()
    if (!next) return
    undoStack.current.push(tracksRef.current)
    setTracks(next)
    setCanRedo(redoStack.current.length > 0)
    setCanUndo(true)
  }, [])

  const addTrack = useCallback((voice: RhythmVoiceId) => {
    const track: PlayTrack = { id: nextTrackId(), voice, muted: false, notes: [] }
    setTracks((prev) => [...prev, track])
    setActiveTrackId(track.id)
  }, [])

  const removeTrack = useCallback((trackId: string) => {
    setTracks((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((t) => t.id !== trackId)
      setActiveTrackId((current) => (current === trackId ? next[0].id : current))
      return next
    })
  }, [])

  const selectTrack = useCallback((trackId: string) => {
    setActiveTrackId(trackId)
  }, [])

  const setTrackVoice = useCallback(
    (trackId: string, voice: RhythmVoiceId) => {
      updateTrack(trackId, (t) => ({ ...t, voice }))
    },
    [updateTrack],
  )

  const toggleTrackMuted = useCallback(
    (trackId: string) => {
      updateTrack(trackId, (t) => ({ ...t, muted: !t.muted }))
    },
    [updateTrack],
  )

  return {
    tracks,
    activeTrack,
    activeTrackId,
    bpm,
    minStep,
    canUndo,
    canRedo,
    setBpm,
    setMinStep,
    addNote,
    removeNote,
    undo,
    redo,
    addTrack,
    removeTrack,
    selectTrack,
    setTrackVoice,
    toggleTrackMuted,
  }
}
