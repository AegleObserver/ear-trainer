import { useCallback, useEffect, useState } from 'react'
import { configurePlayback, configureRhythmVoice, configureSynth, setVolume } from '../audio/engine'
import ReferenceToneButton from '../components/ReferenceToneButton'
import { useAppData } from '../context/AppDataContext'
import type { PageDef, PageId } from '../types'
import TestPage from '../pages/TestPage'
import TrainingGroundPage from '../pages/TrainingGroundPage'
import TunerPage from '../pages/TunerPage'
import PlayPage from '../pages/PlayPage'
import ProfilePage from '../pages/ProfilePage'
import SettingsPage from '../pages/SettingsPage'

const PAGES: PageDef[] = [
  { id: 'test', label: '测试', icon: '🎧', enabled: true },
  { id: 'training', label: '训练场', icon: '🎼', enabled: true },
  { id: 'tuner', label: '调音', icon: '🎚️', enabled: true },
  { id: 'play', label: '演奏', icon: '🎹', enabled: true },
  { id: 'profile', label: '个人中心', icon: '👤', enabled: true },
  { id: 'settings', label: '设置', icon: '⚙️', enabled: true },
]

interface AppShellProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

export default function AppShell({ activePage, onNavigate }: AppShellProps) {
  const { settings, updateSettings } = useAppData()
  const [volume, setVolumeState] = useState(settings.volume)

  useEffect(() => {
    setVolume(settings.volume)
  }, [settings.volume])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  useEffect(() => {
    configureSynth(settings.timbre)
  }, [settings.timbre])

  useEffect(() => {
    configurePlayback(settings.playbackMode)
  }, [settings.playbackMode])

  useEffect(() => {
    configureRhythmVoice(settings.rhythmVoice)
  }, [settings.rhythmVoice])

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value)
      setVolumeState(v)
      setVolume(v)
      updateSettings({ volume: v })
    },
    [updateSettings],
  )

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
        <div className="flex items-center gap-2 text-sm text-slate-400 sm:gap-3">
          <ReferenceToneButton />
          <label className="flex items-center gap-2">
            <span className="hidden sm:inline">音量</span>
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
        <div className={activePage === 'test' ? '' : 'hidden'}>
          <TestPage />
        </div>
        <div className={activePage === 'training' ? '' : 'hidden'}>
          <TrainingGroundPage />
        </div>
        <div className={activePage === 'tuner' ? '' : 'hidden'}>
          <TunerPage active={activePage === 'tuner'} />
        </div>
        <div className={activePage === 'play' ? '' : 'hidden'}>
          <PlayPage />
        </div>
        <div className={activePage === 'profile' ? '' : 'hidden'}>
          <ProfilePage />
        </div>
        <div className={activePage === 'settings' ? '' : 'hidden'}>
          <SettingsPage />
        </div>
      </main>

      {/* Bottom tabs */}
      <nav className="sticky bottom-0 z-10 border-t border-slate-800 bg-slate-950/80 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-center gap-1 sm:gap-2">
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
                    ? 'tab-button !px-2 sm:!px-3 border-b-2 border-cyan-400 bg-slate-800/60 text-cyan-300'
                    : page.enabled
                      ? 'tab-button !px-2 sm:!px-3 text-slate-300 hover:bg-slate-800/50'
                      : 'tab-button !px-2 sm:!px-3 cursor-not-allowed text-slate-600 hover:bg-transparent'
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
