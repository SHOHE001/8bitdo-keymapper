import { useState } from 'react'
import { useUiStore } from '../store/useUiStore'
import { useProfileStore } from '../store/useProfileStore'
import { encodeProfile, decodeProfile } from '../lib/shareCode'

export function ShareDialog() {
  const { isShareDialogOpen, closeShareDialog } = useUiStore()
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const { profiles } = useProfileStore()
  const applyMapping = useProfileStore((s) => s.applyMapping)
  const createProfile = useProfileStore((s) => s.createProfile)

  const [importCode, setImportCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [importError, setImportError] = useState('')

  const shareCode = activeProfile ? encodeProfile(activeProfile) : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = async () => {
    const profile = decodeProfile(importCode.trim())
    if (!profile) {
      setImportError('無効なコードです')
      return
    }
    setImportError('')
    const existing = profiles.find((p) => p.id === profile.id)
    if (existing) {
      await applyMapping(profile.id, profile.mapping)
    } else {
      await createProfile(profile.name)
      const newId = useProfileStore.getState().profiles.at(-1)?.id
      if (newId) await applyMapping(newId, profile.mapping)
    }
    setImportCode('')
    closeShareDialog()
  }

  if (!isShareDialogOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && closeShareDialog()}
    >
      <div
        className="rounded-xl shadow-2xl w-[480px] p-6 space-y-4"
        style={{ background: 'var(--keycap-bg)', border: '2px solid var(--keycap-border)' }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-[var(--keycap-text)] font-bold">プロファイルを共有</h2>
          <button onClick={closeShareDialog} className="text-[var(--keycap-text-label)] hover:text-[var(--keycap-text)]">✕</button>
        </div>

        {/* エクスポート */}
        <div className="space-y-2">
          <p className="text-xs text-[var(--keycap-text-label)] font-medium uppercase tracking-wide">共有コードをコピー</p>
          <div className="flex gap-2">
            <input
              readOnly
              className="flex-1 rounded px-3 py-2 text-xs font-mono"
              style={{
                background: 'var(--kb-bg)',
                border: '1px solid var(--keycap-border)',
                color: 'var(--keycap-text)'
              }}
              value={shareCode}
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded text-xs font-medium bg-[var(--accent)] text-white hover:opacity-80 min-w-[64px]"
            >
              {copied ? '✓ コピー済み' : 'コピー'}
            </button>
          </div>
        </div>

        {/* インポート */}
        <div className="space-y-2">
          <p className="text-xs text-[var(--keycap-text-label)] font-medium uppercase tracking-wide">共有コードからインポート</p>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded px-3 py-2 text-xs font-mono"
              style={{
                background: 'var(--kb-bg)',
                border: '1px solid var(--keycap-border)',
                color: 'var(--keycap-text)'
              }}
              value={importCode}
              onChange={(e) => { setImportCode(e.target.value); setImportError('') }}
              placeholder="BKM1:..."
            />
            <button
              onClick={handleImport}
              disabled={!importCode.trim()}
              className="px-3 py-2 rounded text-xs font-medium bg-[var(--accent)] text-white hover:opacity-80 disabled:opacity-40"
            >
              インポート
            </button>
          </div>
          {importError && <p className="text-xs text-red-400">{importError}</p>}
        </div>
      </div>
    </div>
  )
}
