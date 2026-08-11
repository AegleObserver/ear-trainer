import { useCallback, useEffect, useState } from 'react'
import { setVolume } from '../audio/engine'
import type { PageDef, PageId } from '../types'
import EarTrainingPage from '../pages/EarTrainingPage'
import PlayPage from '../pages/PlayPage'
import ProfilePage from '../pages/ProfilePage'
import SettingsPage from '../pages/SettingsPage'

const PAGES: PageDef[] = [
  { id: 'ear-training', label: '音感测试', icon: '🎧', enabled: true },
  { id: 'play', label: '演奏', icon: '🎹', enabled: false },
  { id: 'profile', label: '个人中心', icon: '👤', enabled: true },
  { id: 'settings', label: '设置', icon: '⚙️', enabled: false },
]

interface AppShellProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

export default function AppShell({ activePage, onNavigate }: AppShellProps) {
  const [volume, setVolumeState] = useState(0.8)

  useEffect(() => {
    setVolume(0.8)
  }, [])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolumeState(v)
    setVolume(v)
  }, [])

  const handleNavigate = useCallback(
    (page: PageDef) => {
      if (page.enabled) onNavigate(page.id)
    },
    [onNavigate],
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🎵
          </span>
          <h1 className="text-lg font-bold tracking-tight">
            Ear Trainer
            <span className="ml-2 text-sm font-normal text-slate-400">
              音感训练
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <label className="hidden items-center gap-2 sm:flex">
            <span>音量</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="h-1 w-24 accent-cyan-400"
            />
          </label>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activePage === 'ear-training' && <EarTrainingPage />}
        {activePage === 'play' && <PlayPage />}
        {activePage === 'profile' && <ProfilePage />}
        {activePage === 'settings' && <SettingsPage />}
      </main>

      {/* Bottom tabs */}
      <nav className="sticky bottom-0 z-10 border-t border-slate-800 bg-slate-950/80 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-center gap-2">
          {PAGES.map((page) => {
            const isActive = activePage === page.id
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => handleNavigate(page)}
                disabled={!page.enabled}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'tab-button border-b-2 border-cyan-400 bg-slate-800/60 text-cyan-300'
                    : page.enabled
                      ? 'tab-button text-slate-300 hover:bg-slate-800/50'
                      : 'tab-button cursor-not-allowed text-slate-600 hover:bg-transparent'
                }
              >
                <span aria-hidden>{page.icon}</span>
                {page.label}
                {!page.enabled && (
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">
                    开发中
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
