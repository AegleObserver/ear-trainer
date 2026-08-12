interface PlayAreaProps {
  isPlaying: boolean
  finished?: boolean
  onPlay: () => void
}

export default function PlayArea({ isPlaying, finished, onPlay }: PlayAreaProps) {
  return (
    <div className="panel flex flex-col items-center gap-3 p-6">
      <button type="button" onClick={onPlay} disabled={isPlaying} className="btn-primary px-8 text-lg">
        {isPlaying ? '⏳ 播放中…' : finished ? '🔁 重新挑战' : '▶ 播放题目'}
      </button>
      <p className="text-xs text-slate-500">仔细聆听，然后选择你的答案</p>
    </div>
  )
}
