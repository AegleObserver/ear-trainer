import { useState } from 'react'
import type { Manuscript } from '../types'

interface ManuscriptListProps {
  manuscripts: Manuscript[]
  activeManuscriptId: string | null
  maxCount: number
  onLoad: (m: Manuscript) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  return `${Math.floor(diff / 86_400_000)} 天前`
}

export default function ManuscriptList({
  manuscripts,
  activeManuscriptId,
  maxCount,
  onLoad,
  onRename,
  onDelete,
  onNew,
}: ManuscriptListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')

  const startRename = (m: Manuscript) => {
    setRenamingId(m.id)
    setDraftName(m.name)
  }

  const commitRename = (id: string) => {
    const name = draftName.trim()
    if (name) onRename(id, name)
    setRenamingId(null)
  }

  return (
    <aside className="panel flex w-56 shrink-0 flex-col gap-2 self-start p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">手稿</h3>
        <span className="text-xs text-slate-500">
          {manuscripts.length}/{maxCount}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {manuscripts.map((m) => {
          const isActive = m.id === activeManuscriptId
          const isRenaming = renamingId === m.id
          return (
            <li
              key={m.id}
              onClick={() => {
                if (!isRenaming) onLoad(m)
              }}
              className={`rounded-lg border p-2 transition-colors ${
                isActive
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-900/40 hover:border-slate-500'
              } cursor-pointer`}
            >
              {isRenaming ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => commitRename(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(m.id)
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded border border-cyan-500 bg-slate-900 px-1.5 py-0.5 text-sm text-slate-200 outline-none"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.name}</span>
                  <button
                    type="button"
                    title="重命名"
                    onClick={(e) => {
                      e.stopPropagation()
                      startRename(m)
                    }}
                    className="text-xs text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    title="删除手稿"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(m.id)
                    }}
                    className="text-xs text-slate-400 transition-colors hover:text-rose-400"
                  >
                    🗑
                  </button>
                </div>
              )}
              <div className="mt-1 text-[10px] text-slate-500" title={new Date(m.updatedAt).toLocaleString()}>
                {formatRelativeTime(m.updatedAt)}
              </div>
            </li>
          )
        })}
        {manuscripts.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-700 p-3 text-center text-xs text-slate-500">
            暂无手稿
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={onNew}
        className="rounded-lg border border-slate-700 px-2 py-1.5 text-sm text-slate-300 transition-colors hover:border-cyan-500 hover:bg-slate-800/60"
      >
        ＋ 新建
      </button>
    </aside>
  )
}
