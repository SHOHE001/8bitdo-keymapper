import { useState } from 'react'
import { clsx } from 'clsx'
import { useProfileStore } from '../store/useProfileStore'
import { api } from '../lib/ipc'

export function ProfileSidebar() {
  const { profiles, activeProfileId, createProfile, renameProfile, deleteProfile, setActive } =
    useProfileStore()
  const activeProfile = useProfileStore((s) => s.activeProfile())

  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    await createProfile(name)
    setNewName('')
  }

  const handleRenameStart = (id: string, currentName: string) => {
    setEditId(id)
    setEditName(currentName)
  }

  const handleRenameSubmit = async (id: string) => {
    const name = editName.trim()
    if (name) await renameProfile(id, name)
    setEditId(null)
  }

  const handleExport = async () => {
    if (!activeProfile) return
    await api.exportProfile(activeProfile)
  }

  const handleImport = async () => {
    const imported = await api.importProfile()
    if (!imported) return
    await useProfileStore.getState().applyMapping(imported.id, imported.mapping)
  }

  return (
    <div
      className="w-52 flex flex-col shrink-0 border-r"
      style={{
        background: 'var(--kb-bg)',
        borderColor: 'var(--keycap-border)',
        color: 'var(--keycap-text)'
      }}
    >
      <div className="p-3 border-b text-xs font-bold tracking-wider" style={{ borderColor: 'var(--keycap-border)' }}>
        プロファイル
      </div>

      <div className="flex-1 overflow-y-auto">
        {profiles.map((p) => (
          <div
            key={p.id}
            className={clsx(
              'group flex items-center gap-1 px-3 py-2 cursor-pointer transition-colors',
              p.id === activeProfileId
                ? 'bg-[var(--keycap-bg-active)] text-white'
                : 'hover:bg-[var(--keycap-bg-hover)]'
            )}
            onClick={() => setActive(p.id)}
          >
            {editId === p.id ? (
              <input
                autoFocus
                className="flex-1 bg-transparent border-b border-[var(--accent)] outline-none text-sm"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRenameSubmit(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit(p.id)
                  if (e.key === 'Escape') setEditId(null)
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 text-sm truncate">{p.name}</span>
            )}
            <button
              className="opacity-0 group-hover:opacity-100 text-xs hover:text-[var(--accent)] ml-1"
              title="リネーム"
              onClick={(e) => { e.stopPropagation(); handleRenameStart(p.id, p.name) }}
            >
              ✎
            </button>
            <button
              className="opacity-0 group-hover:opacity-100 text-xs hover:text-red-400"
              title="削除"
              onClick={(e) => { e.stopPropagation(); deleteProfile(p.id) }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 新規作成 */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--keycap-border)' }}>
        <div className="flex gap-1">
          <input
            className="flex-1 rounded px-2 py-1 text-xs"
            style={{
              background: 'var(--keycap-bg)',
              border: '1px solid var(--keycap-border)',
              color: 'var(--keycap-text)'
            }}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="プロファイル名"
          />
          <button
            onClick={handleCreate}
            className="px-2 py-1 rounded text-xs font-bold bg-[var(--accent)] text-white hover:opacity-80"
          >
            +
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleExport}
            disabled={!activeProfile}
            className="flex-1 py-1 rounded text-xs border border-[var(--keycap-border)] hover:border-[var(--accent)] disabled:opacity-40"
          >
            Export
          </button>
          <button
            onClick={handleImport}
            className="flex-1 py-1 rounded text-xs border border-[var(--keycap-border)] hover:border-[var(--accent)]"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  )
}
