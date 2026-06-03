import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { useProfileStore } from '../store/useProfileStore'
import { useUiStore } from '../store/useUiStore'
import { toastMessages } from '../lib/toastMessages'
import { api } from '../lib/ipc'

export function ProfileSidebar() {
  const { profiles, activeProfileId, createProfile, renameProfile, deleteProfile, setActive } =
    useProfileStore()
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const addToast = useUiStore((s) => s.addToast)
  const requestConfirm = useUiStore((s) => s.requestConfirm)
  const focusToken = useUiStore((s) => s.focusProfileInputToken)

  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const newNameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusToken === 0) return
    newNameInputRef.current?.focus()
  }, [focusToken])

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) {
      addToast(toastMessages.profileNameRequired(), 'error')
      newNameInputRef.current?.focus()
      return
    }
    await createProfile(name)
    setNewName('')
    addToast(toastMessages.profileCreated(name), 'success')
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

  const handleDelete = async (id: string, name: string) => {
    const ok = await requestConfirm(toastMessages.confirmDeleteProfile(name))
    if (!ok) return
    await deleteProfile(id)
    addToast(toastMessages.profileDeleted(name), 'info')
  }

  const handleExport = async () => {
    if (!activeProfile) return
    const path = await api.exportProfile(activeProfile)
    if (path) addToast(toastMessages.profileExported(), 'success')
  }

  const handleImport = async () => {
    const imported = await api.importProfile()
    if (!imported) return
    await useProfileStore.getState().applyMapping(imported.id, imported.mapping)
    addToast(toastMessages.profileImported(imported.name), 'success')
  }

  const isEmpty = profiles.length === 0

  return (
    <div
      className="w-56 flex flex-col shrink-0 border-r"
      style={{
        background: 'var(--kb-bg)',
        borderColor: 'var(--keycap-border)',
        color: 'var(--keycap-text)'
      }}
    >
      <div
        className="px-3 py-2 border-b text-xs font-bold tracking-wider flex items-center justify-between"
        style={{ borderColor: 'var(--keycap-border)' }}
      >
        <span>プロファイル</span>
        {!isEmpty && (
          <span className="text-[10px] opacity-60 font-normal">{profiles.length} 件</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="px-3 py-4 text-xs opacity-70 leading-relaxed">
            <p className="mb-2 font-bold">まだプロファイルがありません</p>
            <p>
              下の入力欄に名前を入れて
              <span className="font-bold text-[var(--accent)]">「＋ 作成」</span>
              を押すと、ここに表示されます。
            </p>
            <div className="text-center text-2xl mt-3 opacity-50">↓</div>
          </div>
        ) : (
          profiles.map((p) => (
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
                className="opacity-40 group-hover:opacity-100 text-xs hover:text-[var(--accent)] ml-1 transition-opacity"
                title="名前を変更"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRenameStart(p.id, p.name)
                }}
              >
                ✎
              </button>
              <button
                className="opacity-40 group-hover:opacity-100 text-xs hover:text-red-400 transition-opacity"
                title="削除"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(p.id, p.name)
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* 新規作成 */}
      <div
        className="p-3 border-t space-y-2"
        style={{ borderColor: 'var(--keycap-border)' }}
      >
        <div className="text-[10px] font-bold tracking-wider opacity-70">新規作成</div>
        <div className="flex gap-1">
          <input
            ref={newNameInputRef}
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
            title="名前を入力して Enter または ＋ 作成 ボタン"
          />
          <button
            onClick={handleCreate}
            className="px-2 py-1 rounded text-xs font-bold bg-[var(--accent)] text-white hover:opacity-80 whitespace-nowrap"
            title="新しいプロファイルを作成"
          >
            ＋ 作成
          </button>
        </div>

        <div className="pt-2 border-t" style={{ borderColor: 'var(--keycap-border)' }}>
          <div className="text-[10px] font-bold tracking-wider opacity-70 mb-1">
            保存・読み込み
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleExport}
              disabled={!activeProfile}
              className="flex-1 py-1 rounded text-xs border border-[var(--keycap-border)] hover:border-[var(--accent)] disabled:opacity-40"
              title={activeProfile ? 'JSON ファイルに書き出し' : 'プロファイルを選択してください'}
            >
              Export
            </button>
            <button
              onClick={handleImport}
              className="flex-1 py-1 rounded text-xs border border-[var(--keycap-border)] hover:border-[var(--accent)]"
              title="JSON ファイルから読み込み"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
