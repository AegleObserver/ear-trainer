import { useCallback, useEffect, useRef, useState } from 'react'
import { playSequence, type PlaybackHandle } from '../audio/playSequence'
import {
  PLAY_BAR_COUNT,
  PLAY_BPM_DEFAULT,
  PLAY_BPM_MAX,
  PLAY_BPM_MIN,
  PLAY_MIN_STEP_DEFAULT,
} from '../constants/playConfig'
import type { Manuscript, MinStep, PlayNote, PlayTrack, RhythmVoiceId, TimeSignature } from '../types'

const INITIAL_TRACKS: PlayTrack[] = [{ id: 'track-1', voice: 'triangle', muted: false, notes: [] }]

let trackSeq = 1
const nextTrackId = () => `track-${++trackSeq}`

export default function usePlayEditor() {
  const [tracks, setTracks] = useState<PlayTrack[]>(INITIAL_TRACKS)
  const [activeTrackId, setActiveTrackId] = useState(INITIAL_TRACKS[0].id)
  const [bpm, setBpmState] = useState(PLAY_BPM_DEFAULT)
  const [minStep, setMinStepState] = useState<MinStep>(PLAY_MIN_STEP_DEFAULT)
  const [timeSignature, setTimeSignatureState] = useState<TimeSignature>('4/4')
  const [activeManuscriptId, setActiveManuscriptId] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

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

  const beatsPerBar = timeSignature === '3/4' ? 3 : 4
  const totalSteps = PLAY_BAR_COUNT * beatsPerBar * (minStep / 4)

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

  const markDirty = useCallback(() => setIsDirty(true), [])

  const setBpm = useCallback(
    (value: number) => {
      const clamped = Math.min(PLAY_BPM_MAX, Math.max(PLAY_BPM_MIN, Math.round(value)))
      setBpmState(clamped)
      markDirty()
    },
    [markDirty],
  )

  const setMinStep = useCallback(
    (step: MinStep) => {
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
      markDirty()
    },
    [minStepRef, markDirty],
  )

  const updateTrack = useCallback((trackId: string, updater: (t: PlayTrack) => PlayTrack) => {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? updater(t) : t)))
  }, [])

  const pushHistory = useCallback(() => {
    undoStack.current.push(tracksRef.current)
    redoStack.current = []
    setCanUndo(true)
    setCanRedo(false)
  }, [])

  const setTimeSignature = useCallback(
    (ts: TimeSignature) => {
      if (ts === timeSignature) return
      // 切换拍号：保存当前快照（可撤回），清空全部音符，复位起点
      pushHistory()
      setTracks((prev) => prev.map((t) => ({ ...t, notes: [] })))
      setTimeSignatureState(ts)
      setStartTickState(0)
      markDirty()
    },
    [timeSignature, pushHistory, markDirty],
  )

  const addNote = useCallback(
    (trackId: string, note: PlayNote) => {
      pushHistory()
      updateTrack(trackId, (t) => ({ ...t, notes: [...t.notes, note] }))
      markDirty()
    },
    [pushHistory, updateTrack, markDirty],
  )

  const removeNote = useCallback(
    (trackId: string, note: PlayNote) => {
      pushHistory()
      updateTrack(trackId, (t) => ({
        ...t,
        notes: t.notes.filter((n) => !(n.pitch === note.pitch && n.start === note.start && n.dur === note.dur)),
      }))
      markDirty()
    },
    [pushHistory, updateTrack, markDirty],
  )

  const undo = useCallback(
    () => {
      const prev = undoStack.current.pop()
      if (!prev) return
      redoStack.current.push(tracksRef.current)
      setTracks(prev)
      setCanUndo(undoStack.current.length > 0)
      setCanRedo(true)
      markDirty()
    },
    [markDirty],
  )

  const redo = useCallback(
    () => {
      const next = redoStack.current.pop()
      if (!next) return
      undoStack.current.push(tracksRef.current)
      setTracks(next)
      setCanRedo(redoStack.current.length > 0)
      setCanUndo(true)
      markDirty()
    },
    [markDirty],
  )

  const addTrack = useCallback(
    (voice: RhythmVoiceId) => {
      const track: PlayTrack = { id: nextTrackId(), voice, muted: false, notes: [] }
      setTracks((prev) => [...prev, track])
      setActiveTrackId(track.id)
      markDirty()
    },
    [markDirty],
  )

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
      markDirty()
    },
    [tracks, activeTrackId, markDirty],
  )

  const selectTrack = useCallback((trackId: string) => {
    setActiveTrackId(trackId)
  }, [])

  const setTrackVoice = useCallback(
    (trackId: string, voice: RhythmVoiceId) => {
      updateTrack(trackId, (t) => ({ ...t, voice }))
      markDirty()
    },
    [updateTrack, markDirty],
  )

  const toggleTrackMuted = useCallback(
    (trackId: string) => {
      updateTrack(trackId, (t) => ({ ...t, muted: !t.muted }))
      markDirty()
    },
    [updateTrack, markDirty],
  )

  const loadManuscript = useCallback((m: Manuscript) => {
    setTracks(m.tracks.map((t) => ({ ...t, notes: t.notes.map((n) => ({ ...n })) })))
    setActiveTrackId(m.tracks[0]?.id ?? 'track-1')
    setBpmState(m.bpm)
    setMinStepState(m.minStep)
    setTimeSignatureState(m.timeSignature)
    setStartTickState(0)
    setActiveManuscriptId(m.id)
    setIsDirty(false)
    undoStack.current = []
    redoStack.current = []
    setCanUndo(false)
    setCanRedo(false)
  }, [])

  const toManuscript = useCallback(
    (): Omit<Manuscript, 'id' | 'name' | 'createdAt' | 'updatedAt'> => ({
      tracks: tracksRef.current,
      bpm: bpmRef.current,
      minStep: minStepRef.current,
      timeSignature,
    }),
    [timeSignature],
  )

  const resetEditor = useCallback(() => {
    const fresh: PlayTrack = { id: 'track-1', voice: 'triangle', muted: false, notes: [] }
    setTracks([fresh])
    setActiveTrackId('track-1')
    setBpmState(PLAY_BPM_DEFAULT)
    setMinStepState(PLAY_MIN_STEP_DEFAULT)
    setTimeSignatureState('4/4')
    setStartTickState(0)
    setActiveManuscriptId(null)
    setIsDirty(false)
    undoStack.current = []
    redoStack.current = []
    setCanUndo(false)
    setCanRedo(false)
  }, [])

  const markSaved = useCallback(() => setIsDirty(false), [])

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
    timeSignature,
    beatsPerBar,
    totalSteps,
    startTick,
    isPlaying,
    isPaused,
    locked,
    canUndo,
    canRedo,
    setBpm,
    setMinStep,
    setTimeSignature,
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
    activeManuscriptId,
    isDirty,
    loadManuscript,
    toManuscript,
    resetEditor,
    markSaved,
    play,
    pausePlayback,
    resumePlayback,
    stopPlayback,
  }
}
