import PitchGrid from '../components/PitchGrid'
import PlayStatusBar from '../components/PlayStatusBar'
import TrackList from '../components/TrackList'
import usePlayEditor from '../hooks/usePlayEditor'

export default function PlayPage() {
  const editor = usePlayEditor()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      <h2 className="text-xl font-bold">演奏</h2>
      <p className="text-sm text-slate-400">
        步进网格编辑器：纵轴 = 音高、横轴 = 时间（4/4 拍，默认 120 BPM，最小分度 1/8 / 1/16）。点击网格顶部小节可设置播放起点；左侧音轨栏可切换 / 新增 / 删除音轨并独立配置音色与静音。
      </p>
      <PlayStatusBar
        bpm={editor.bpm}
        minStep={editor.minStep}
        startTick={editor.startTick}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        locked={editor.locked}
        isPlaying={editor.isPlaying}
        isPaused={editor.isPaused}
        onBpmChange={editor.setBpm}
        onMinStepChange={editor.setMinStep}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onResetStartTick={() => editor.setStartTick(0)}
        onPlay={editor.play}
        onPause={editor.pausePlayback}
        onResume={editor.resumePlayback}
        onStop={editor.stopPlayback}
      />
      <div className="flex items-start gap-3">
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
        <div className="min-w-0 flex-1">
          <PitchGrid
            tracks={editor.tracks}
            activeTrackId={editor.activeTrackId}
            minStep={editor.minStep}
            startTick={editor.startTick}
            editable={!editor.locked}
            onAddNote={editor.addNote}
            onRemoveNote={editor.removeNote}
            onSetStartTick={editor.setStartTick}
          />
        </div>
      </div>
    </div>
  )
}
