import { useState } from 'react'
import AppShell from './components/AppShell'
import { AppDataProvider } from './context/AppDataContext'
import type { PageId } from './types'

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('ear-training')

  return (
    <AppDataProvider>
      <AppShell activePage={activePage} onNavigate={setActivePage} />
    </AppDataProvider>
  )
}
