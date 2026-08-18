import { useState } from 'react'
import { playNote } from '../audio/playNotes'

const REFERENCE_NOTE = 'A4'

export default function ReferenceToneButton() {
  const [playing, setPlaying] = useState(false)

  const handleClick = async () => {
    if (playing) return
    setPlaying(true)
    try {
      await playNote(REFERENCE_NOTE, 0.8)
    } finally {
      window.setTimeout(() => setPlaying(false), 800)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={playing}
      title="试听参考音 · 确认有声音"
      className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-sm text-slate-300 transition-colors hover:border-cyan-500 hover:text-cyan-300 disabled:cursor-wait disabled:opacity-50"
    >
      {playing ? (
        <>
          <span aria-hidden>♪</span>播放中…
        </>
      ) : (
        <>
          <span aria-hidden>♪</span>试听
        </>
      )}
    </button>
  )
}
