import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadRecords, loadSettings, saveRecords, saveSettings } from '../data/storage'
import type { QuizRecord, UserSettings } from '../types'

interface AppDataContextValue {
  settings: UserSettings
  updateSettings: (patch: Partial<UserSettings>) => void
  records: QuizRecord[]
  addRecord: (record: Omit<QuizRecord, 'id' | 'timestamp'>) => void
  clearRecords: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings())
  const [records, setRecords] = useState<QuizRecord[]>(() => loadRecords())

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  const addRecord = useCallback((record: Omit<QuizRecord, 'id' | 'timestamp'>) => {
    setRecords((prev) => {
      const next = [
        {
          ...record,
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 100)
      saveRecords(next)
      return next
    })
  }, [])

  const clearRecords = useCallback(() => {
    setRecords([])
    saveRecords([])
  }, [])

  const value = useMemo(
    () => ({ settings, updateSettings, records, addRecord, clearRecords }),
    [settings, updateSettings, records, addRecord, clearRecords],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
