import { useEffect } from 'react'
import { useUiStore } from '../store/useUiStore'
import { Panel } from './Panel'

export function ConfirmDialog() {
  const confirm = useUiStore((s) => s.confirmDialog)
  const resolveConfirm = useUiStore((s) => s.resolveConfirm)

  useEffect(() => {
    if (!confirm) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resolveConfirm(false)
      if (e.key === 'Enter') resolveConfirm(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [confirm, resolveConfirm])

  if (!confirm) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && resolveConfirm(false)}
    >
      <Panel className="w-80 shadow-2xl" style={{ borderWidth: 2 }}>
        <div className="px-5 py-4 text-sm whitespace-pre-line">{confirm.message}</div>
        <div
          className="flex justify-end gap-2 px-5 py-3 border-t"
          style={{ borderColor: 'var(--keycap-border)' }}
        >
          <button
            onClick={() => resolveConfirm(false)}
            className="px-4 py-1.5 rounded text-sm border hover:border-[var(--accent)]"
            style={{
              borderColor: 'var(--keycap-border)',
              color: 'var(--keycap-text)'
            }}
          >
            キャンセル
          </button>
          <button
            autoFocus
            onClick={() => resolveConfirm(true)}
            className="px-4 py-1.5 rounded text-sm font-bold bg-[var(--accent)] text-white hover:opacity-80"
          >
            OK
          </button>
        </div>
      </Panel>
    </div>
  )
}
