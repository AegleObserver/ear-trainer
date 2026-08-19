import { PLAY_PREVIEW_MIDI, PLAY_TRACK_COLORS } from '../constants/playConfig'
import { RHYTHM_VOICES } from '../data/storage'
import { previewPlayNote } from '../audio/playSequence'
import type { PlayTrack, RhythmVoiceId } from '../types'

interface TrackListProps {
  tracks: PlayTrack[]
  activeTrackId: string
  locked: boolean
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onSetVoice: (id: string, voice: RhythmVoiceId) => void
  onToggleMuted: (id: string) => void
}

export default function TrackList({
  tracks,
  activeTrackId,
  locked,
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
          disabled={locked}
          className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 transition-colors hover:border-cyan-500 hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-40"
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
              onClick={() => {
                if (!locked) onSelect(track.id)
              }}
              className={`rounded-lg border p-2 transition-colors ${
                isActive
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-900/40 hover:border-slate-500'
              } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title={`试听音色（A4）· ${RHYTHM_VOICES[track.voice].label}`}
                  disabled={locked}
                  onClick={(e) => {
                    e.stopPropagation()
                    previewPlayNote(track.voice, PLAY_PREVIEW_MIDI)
                  }}
                  className={`inline-block h-3 w-3 shrink-0 cursor-pointer rounded-full transition-shadow hover:ring-2 hover:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40 ${PLAY_TRACK_COLORS[index % PLAY_TRACK_COLORS.length]}`}
                />
                <span className="flex-1 text-sm font-medium">音轨 {index + 1}</span>
                <button
                  type="button"
                  title={track.muted ? '取消静音' : '静音'}
                  disabled={locked}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleMuted(track.id)
                  }}
                  className={`text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    track.muted ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {track.muted ? '🔇' : '🔊'}
                </button>
                <button
                  type="button"
                  title="删除音轨"
                  disabled={tracks.length <= 1 || locked}
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
                disabled={locked}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onSetVoice(track.id, e.target.value as RhythmVoiceId)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
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
