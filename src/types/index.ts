export type PageId = 'ear-training' | 'play' | 'settings'

export interface PageDef {
  id: PageId
  label: string
  icon: string
  enabled: boolean
}
