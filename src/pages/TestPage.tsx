import { useState } from 'react'
import SoundDomainToggle from '../components/SoundDomainToggle'
import type { SoundDomain } from '../types'
import EarTrainingPage from './EarTrainingPage'
import RhythmTestPage from './RhythmTestPage'

export default function TestPage() {
  const [domain, setDomain] = useState<SoundDomain>('pitch')

  return (
    <div className="flex flex-col">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-6">
        <h2 className="text-xl font-bold">测试</h2>
        <SoundDomainToggle domain={domain} onChange={setDomain} />
      </div>
      {domain === 'pitch' ? <EarTrainingPage /> : <RhythmTestPage />}
    </div>
  )
}
