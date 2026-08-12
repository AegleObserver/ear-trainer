import PitchGrid from '../components/PitchGrid'
import PlayStatusBar from '../components/PlayStatusBar'
import usePlayEditor from '../hooks/usePlayEditor'

export default function PlayPage() {
  const editor = usePlayEditor()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
      <h2 className="text-xl font-bold">演奏</h2>
      <p className="text-sm text-slate-400">
        步进网格编辑器：纵轴 = 音高、横轴 = 时间（4/4 拍，默认 120 BPM，最小分度 1/8 / 1/16）。多音轨与播放功能后续开放。
      </p>
      <PlayStatusBar
        bpm={editor.bpm}
        minStep={editor.minStep}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onBpmChange={editor.setBpm}
        onMinStepChange={editor.setMinStep}
        onUndo={editor.undo}
        onRedo={editor.redo}
      />
      <PitchGrid
        tracks={editor.tracks}
        activeTrackId={editor.activeTrackId}
        minStep={editor.minStep}
        onAddNote={editor.addNote}
        onRemoveNote={editor.removeNote}
      />
    </div>
  )
}
