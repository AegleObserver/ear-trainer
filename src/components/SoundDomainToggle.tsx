import type { SoundDomain } from '../types'

interface SoundDomainToggleProps {
  domain: SoundDomain
  onChange: (domain: SoundDomain) => void
}

const OPTIONS: { id: SoundDomain; label: string; icon: string }[] = [
  { id: 'pitch', label: '音高', icon: '🎵' },
  { id: 'rhythm', label: '节奏', icon: '🥁' },
]

export default function SoundDomainToggle({ domain, onChange }: SoundDomainToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={domain === 'rhythm'}
      tabIndex={0}
      onClick={() => onChange(domain === 'pitch' ? 'rhythm' : 'pitch')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onChange(domain === 'pitch' ? 'rhythm' : 'pitch')
        }
      }}
      className="relative grid cursor-pointer grid-cols-2 select-none items-center rounded-full border border-slate-700 bg-slate-800/60 p-1"
    >
      <span
        aria-hidden
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-cyan-500 transition-transform duration-200 ${
          domain === 'rhythm' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`relative z-10 flex items-center justify-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
            domain === opt.id ? 'text-slate-950' : 'text-slate-400'
          }`}
        >
          <span aria-hidden>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}
