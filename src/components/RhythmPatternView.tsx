import { NOTE_VALUE_BY_LABEL } from '../theory/rhythm'
import NoteGlyph from './NoteGlyph'

interface RhythmPatternViewProps {
  labels: string[]
}

export default function RhythmPatternView({ labels }: RhythmPatternViewProps) {
  const defs = labels.map((l) => NOTE_VALUE_BY_LABEL[l])
  return (
    <div className="flex items-end justify-center">
      {defs.map((def, i) => (
        <div
          key={i}
          className="flex flex-col items-center"
          style={{ flexGrow: def.beats, flexBasis: 0 }}
        >
          <NoteGlyph def={def} />
        </div>
      ))}
    </div>
  )
}
