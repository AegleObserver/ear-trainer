import { useCallback, useEffect, useRef, useState } from 'react'
import ManuscriptList from '../components/ManuscriptList'
import PitchGrid from '../components/PitchGrid'
import PlayStatusBar from '../components/PlayStatusBar'
import TrackList from '../components/TrackList'
import {
  MANUSCRIPT_MAX_COUNT,
  PLAY_BAR_COUNT,
  PLAY_BPM_DEFAULT,
  PLAY_CELL_W,
  PLAY_MIN_STEP_DEFAULT,
} from '../constants/playConfig'
import { useAppData } from '../context/AppDataContext'
import { loadManuscripts, nextManuscriptName, saveManuscripts } from '../data/storage'
import usePlayEditor from '../hooks/usePlayEditor'
import type { Manuscript } from '../types'

function newManuscriptId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `manuscript-${Date.now()}`
}

// 侧栏固定宽（w-56 = 224px）与列间距（gap-3 = 12px），用于三栏宽度判定
const SIDE_W = 224
const GAP_W = 12

export default function PlayPage() {
  const editor = usePlayEditor()
  const { settings } = useAppData()
  const [manuscripts, setManuscripts] = useState<Manuscript[]>(() => loadManuscripts())
  const layoutRef = useRef<HTMLDivElement>(null)
  const [layoutW, setLayoutW] = useState(0)

  useEffect(() => {
    const el = layoutRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setLayoutW(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 网格默认宽度 = 4 小节 × 步数 × 默认格宽；三栏并排时网格可用宽 = 行宽 − 两个侧栏与间距。
  // 网格可用宽低于默认宽度时，手稿栏移至音轨正下方（左侧堆叠），保证网格不被压缩得比默认还小。
  const naturalGridW = PLAY_BAR_COUNT * editor.beatsPerBar * (editor.minStep / 4) * PLAY_CELL_W
  const wide = layoutW === 0 || layoutW >= naturalGridW + 2 * (SIDE_W + GAP_W)

  const commitManuscripts = useCallback((next: Manuscript[]) => {
    setManuscripts(next)
    saveManuscripts(next)
  }, [])

  const handleLoad = useCallback(
    (m: Manuscript) => {
      if (editor.isDirty && !window.confirm('当前修改未保存，仍要加载该手稿吗？')) return
      editor.loadManuscript(m)
    },
    [editor],
  )

  const handleSave = useCallback(() => {
    const now = Date.now()
    const state = editor.toManuscript()
    if (editor.activeManuscriptId) {
      const next = manuscripts.map((m) =>
        m.id === editor.activeManuscriptId ? { ...m, ...state, updatedAt: now } : m,
      )
      commitManuscripts(next)
    } else {
      const m: Manuscript = {
        id: newManuscriptId(),
        name: nextManuscriptName(manuscripts),
        ...state,
        createdAt: now,
        updatedAt: now,
      }
      const next = [...manuscripts, m]
      if (next.length > MANUSCRIPT_MAX_COUNT) {
        window.alert(`手稿数量已达上限（${MANUSCRIPT_MAX_COUNT} 条），请先删除部分手稿`)
        return
      }
      commitManuscripts(next)
      editor.loadManuscript(m)
    }
    editor.markSaved()
  }, [editor, manuscripts, commitManuscripts])

  const handleDelete = useCallback(
    (id: string) => {
      const target = manuscripts.find((m) => m.id === id)
      if (!target) return
      if (!window.confirm(`确定删除手稿「${target.name}」吗？此操作不可恢复。`)) return
      const next = manuscripts.filter((m) => m.id !== id)
      commitManuscripts(next)
      if (editor.activeManuscriptId === id) {
        editor.resetEditor()
      }
    },
    [manuscripts, commitManuscripts, editor],
  )

  const handleRename = useCallback(
    (id: string, name: string) => {
      const next = manuscripts.map((m) => (m.id === id ? { ...m, name, updatedAt: Date.now() } : m))
      commitManuscripts(next)
    },
    [manuscripts, commitManuscripts],
  )

  const handleNew = useCallback(() => {
    if (editor.isDirty && !window.confirm('当前修改未保存，仍要新建空白手稿吗？')) return
    if (manuscripts.length >= MANUSCRIPT_MAX_COUNT) {
      window.alert(`手稿数量已达上限（${MANUSCRIPT_MAX_COUNT} 条），请先删除部分手稿`)
      return
    }
    const now = Date.now()
    const m: Manuscript = {
      id: newManuscriptId(),
      name: nextManuscriptName(manuscripts),
      tracks: [{ id: 'track-1', voice: 'triangle', muted: false, notes: [] }],
      bpm: PLAY_BPM_DEFAULT,
      minStep: PLAY_MIN_STEP_DEFAULT,
      timeSignature: '4/4',
      createdAt: now,
      updatedAt: now,
    }
    setManuscripts((prev) => [...prev, m])
    editor.loadManuscript(m)
  }, [editor, manuscripts])

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
      <p className="text-sm text-slate-400">
        步进网格编辑器：纵轴 = 音高、横轴 = 时间（{editor.timeSignature} 拍，默认 120 BPM，最小分度 1/8 / 1/16）。点击网格顶部小节可设置播放起点；左侧音轨栏可切换 / 新增 / 删除音轨并独立配置音色与静音；右侧手稿栏可保存 / 加载 / 重命名 / 删除创作。
      </p>
      <PlayStatusBar
        bpm={editor.bpm}
        minStep={editor.minStep}
        timeSignature={editor.timeSignature}
        startTick={editor.startTick}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        locked={editor.locked}
        isPlaying={editor.isPlaying}
        isPaused={editor.isPaused}
        onBpmChange={editor.setBpm}
        onMinStepChange={editor.setMinStep}
        onTimeSignatureChange={editor.setTimeSignature}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onResetStartTick={() => editor.setStartTick(0)}
        onPlay={editor.play}
        onPause={editor.pausePlayback}
        onResume={editor.resumePlayback}
        onStop={editor.stopPlayback}
        onSave={handleSave}
        isDirty={editor.isDirty}
      />
      <div ref={layoutRef} className="flex items-start gap-3">
        <div className="flex w-56 shrink-0 flex-col gap-3">
          <TrackList
            tracks={editor.tracks}
            activeTrackId={editor.activeTrackId}
            locked={editor.locked}
            onSelect={editor.selectTrack}
            onAdd={() => editor.addTrack('triangle')}
            onRemove={editor.removeTrack}
            onSetVoice={editor.setTrackVoice}
            onToggleMuted={editor.toggleTrackMuted}
          />
          {!wide && (
            <ManuscriptList
              manuscripts={manuscripts}
              activeManuscriptId={editor.activeManuscriptId}
              maxCount={MANUSCRIPT_MAX_COUNT}
              onLoad={handleLoad}
              onRename={handleRename}
              onDelete={handleDelete}
              onNew={handleNew}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <PitchGrid
            tracks={editor.tracks}
            activeTrackId={editor.activeTrackId}
            beatsPerBar={editor.beatsPerBar}
            minStep={editor.minStep}
            startTick={editor.startTick}
            editable={!editor.locked}
            blackKeyMode={settings.blackKeyMode}
            onAddNote={editor.addNote}
            onRemoveNote={editor.removeNote}
            onSetStartTick={editor.setStartTick}
          />
        </div>
        {wide && (
          <ManuscriptList
            manuscripts={manuscripts}
            activeManuscriptId={editor.activeManuscriptId}
            maxCount={MANUSCRIPT_MAX_COUNT}
            onLoad={handleLoad}
            onRename={handleRename}
            onDelete={handleDelete}
            onNew={handleNew}
          />
        )}
      </div>
    </div>
  )
}
