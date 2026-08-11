import { useState } from 'react'
import AppShell from './components/AppShell'
import type { PageId } from './types'

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('ear-training')

  return <AppShell activePage={activePage} onNavigate={setActivePage} />
}
