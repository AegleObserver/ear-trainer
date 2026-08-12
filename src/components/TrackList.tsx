import { PLAY_TRACK_COLORS } from '../constants/playConfig'
import { RHYTHM_VOICES } from '../data/storage'
import type { PlayTrack, RhythmVoiceId } from '../types'

interface TrackListProps {
  tracks: PlayTrack[]
  activeTrackId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onSetVoice: (id: string, voice: RhythmVoiceId) => void
  onToggleMuted: (id: string) => void
}

export default function TrackList({
  tracks,
  activeTrackId,
  onSelect,
  onAdd,
  onRemove,
  onSetVoice,
  onToggleMuted,
}: TrackListProps) {
  return (
    <aside className="panel flex w-56 shrink-0 flex-col gap-2 self-start p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">音轨</h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 transition-colors hover:border-cyan-500 hover:bg-slate-800/60"
        >
          ＋ 新增
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {tracks.map((track, index) => {
          const isActive = track.id === activeTrackId
          return (
            <li
              key={track.id}
              onClick={() => onSelect(track.id)}
              className={`cursor-pointer rounded-lg border p-2 transition-colors ${
                isActive
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-900/40 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-3 w-3 shrink-0 rounded-full ${PLAY_TRACK_COLORS[index % PLAY_TRACK_COLORS.length]}`}
                />
                <span className="flex-1 text-sm font-medium">音轨 {index + 1}</span>
                <button
                  type="button"
                  title={track.muted ? '取消静音' : '静音'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleMuted(track.id)
                  }}
                  className={`text-sm transition-colors ${
                    track.muted ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {track.muted ? '🔇' : '🔊'}
                </button>
                <button
                  type="button"
                  title="删除音轨"
                  disabled={tracks.length <= 1}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(track.id)
                  }}
                  className="text-sm text-slate-400 transition-colors hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  🗑
                </button>
              </div>
              <select
                value={track.voice}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onSetVoice(track.id, e.target.value as RhythmVoiceId)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500"
              >
                {(Object.keys(RHYTHM_VOICES) as RhythmVoiceId[]).map((voice) => (
                  <option key={voice} value={voice}>
                    {RHYTHM_VOICES[voice].label}
                  </option>
                ))}
              </select>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
