import { useCallback, useEffect, useRef, useState } from 'react'
import { playSequence, type PlaybackHandle } from '../audio/playSequence'
import {
  PLAY_BAR_COUNT,
  PLAY_BEATS_PER_BAR,
  PLAY_BPM_DEFAULT,
  PLAY_BPM_MAX,
  PLAY_BPM_MIN,
  PLAY_MIN_STEP_DEFAULT,
} from '../constants/playConfig'
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

  const bpmRef = useRef(bpm)
  useEffect(() => {
    bpmRef.current = bpm
  }, [bpm])

  const minStepRef = useRef(minStep)
  useEffect(() => {
    minStepRef.current = minStep
  }, [minStep])

  const totalSteps = PLAY_BAR_COUNT * PLAY_BEATS_PER_BAR * (minStep / 4)

  const [startTick, setStartTickState] = useState(0)
  const startTickRef = useRef(startTick)
  useEffect(() => {
    startTickRef.current = startTick
  }, [startTick])

  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const playingRef = useRef(false)
  const handleRef = useRef<PlaybackHandle | null>(null)

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
    const oldMinStep = minStepRef.current
    if (oldMinStep === step) return
    const factor = step / oldMinStep
    // 缩放所有音符：start/dur 按比例精确换算（1/16↔1/8 的因子为 2 或 0.5，
    // 奇数格在 1/8 下表现为半格，不四舍五入吸附）
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        notes: track.notes.map((note) => ({
          ...note,
          start: note.start * factor,
          dur: note.dur * factor,
        })),
      }))
    )
    setMinStepState(step)
  }, [minStepRef])

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

  const removeTrack = useCallback(
    (trackId: string) => {
      setTracks((prev) => {
        if (prev.length <= 1) return prev
        return prev.filter((t) => t.id !== trackId)
      })
      if (tracks.length > 1 && activeTrackId === trackId) {
        const next = tracks.filter((t) => t.id !== trackId)
        setActiveTrackId(next[0].id)
      }
    },
    [tracks, activeTrackId],
  )

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

  const setStartTick = useCallback(
    (tick: number) => {
      const clamped = Math.max(0, Math.min(Math.round(tick), totalSteps - 1))
      setStartTickState(clamped)
    },
    [totalSteps],
  )

  const play = useCallback(async () => {
    if (playingRef.current || handleRef.current) return
    playingRef.current = true
    setIsPlaying(true)
    setIsPaused(false)
    const handle = await playSequence(tracksRef.current, {
      bpm: bpmRef.current,
      minStep: minStepRef.current,
      startTick: startTickRef.current,
    })
    if (!playingRef.current) {
      handle.stop()
      return
    }
    handleRef.current = handle
    handle.promise.finally(() => {
      playingRef.current = false
      setIsPlaying(false)
      setIsPaused(false)
      handleRef.current = null
    })
  }, [])

  const pausePlayback = useCallback(() => {
    if (!playingRef.current || !handleRef.current) return
    handleRef.current.pause()
    setIsPaused(true)
  }, [])

  const resumePlayback = useCallback(() => {
    if (!handleRef.current) return
    handleRef.current.resume()
    setIsPaused(false)
  }, [])

  const stopPlayback = useCallback(() => {
    playingRef.current = false
    handleRef.current?.stop()
    handleRef.current = null
    setIsPlaying(false)
    setIsPaused(false)
  }, [])

  const locked = isPlaying || isPaused

  return {
    tracks,
    activeTrack,
    activeTrackId,
    bpm,
    minStep,
    totalSteps,
    startTick,
    isPlaying,
    isPaused,
    locked,
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
    setStartTick,
    play,
    pausePlayback,
    resumePlayback,
    stopPlayback,
  }
}
