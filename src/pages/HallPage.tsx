import { useState } from 'react'
import type { HallSectionId } from '../types'
import TrainingGroundPage from './TrainingGroundPage'
import TunerPage from './TunerPage'
import PlayPage from './PlayPage'

const SECTIONS: { id: HallSectionId; label: string; icon: string }[] = [
  { id: 'training', label: '训练场', icon: '🎼' },
  { id: 'tuner', label: '调音', icon: '🎚️' },
  { id: 'play', label: '演奏', icon: '🎹' },
]

interface HallPageProps {
  active: boolean
}

export default function HallPage({ active }: HallPageProps) {
  const [section, setSection] = useState<HallSectionId>('training')

  return (
    <div className="flex flex-col">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 pt-6">
        <h2 className="text-xl font-bold">大厅</h2>
        <nav
          aria-label="大厅子导航"
          className="flex rounded-lg border border-slate-700 p-0.5"
        >
          {SECTIONS.map((s) => {
            const isActive = section === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span aria-hidden>{s.icon}</span>
                {s.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className={section === 'training' ? '' : 'hidden'}>
        <TrainingGroundPage />
      </div>
      <div className={section === 'tuner' ? '' : 'hidden'}>
        <TunerPage active={active && section === 'tuner'} />
      </div>
      <div className={section === 'play' ? '' : 'hidden'}>
        <PlayPage />
      </div>
    </div>
  )
}
