import type { NoteValueDef } from '../theory/rhythm'

export default function NoteGlyph({ def }: { def: NoteValueDef }) {
  const isWhole = def.beats >= 4
  const hasStem = !isWhole
  return (
    <svg width="34" height="52" viewBox="0 0 34 52" className="text-slate-200" aria-hidden>
      {hasStem && (
        <line x1="22" y1="44" x2="22" y2="10" stroke="currentColor" strokeWidth="2" />
      )}
      {def.flags >= 1 && (
        <path d="M22 10 q14 5 7 13" fill="none" stroke="currentColor" strokeWidth="2.5" />
      )}
      {def.flags >= 2 && (
        <path d="M22 21 q14 5 7 13" fill="none" stroke="currentColor" strokeWidth="2.5" />
      )}
      <ellipse
        cx="16"
        cy="44"
        rx="9"
        ry="6.5"
        fill={def.hollow ? 'none' : 'currentColor'}
        stroke="currentColor"
        strokeWidth="2"
        transform="rotate(-18 16 44)"
      />
      {def.dotted && <circle cx="30" cy="42" r="3" fill="currentColor" />}
      {def.triplet && (
        <text x="16" y="8" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">
          3
        </text>
      )}
    </svg>
  )
}
