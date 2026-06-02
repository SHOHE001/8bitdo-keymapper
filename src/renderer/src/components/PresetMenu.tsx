import { useState, useRef, useEffect } from 'react'
import { PRESETS } from '../data/presets'
import { useProfileStore } from '../store/useProfileStore'

export function PresetMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const applyMapping = useProfileStore((s) => s.applyMapping)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleApply = async (presetId: string) => {
    if (!activeProfile) return
    const preset = PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    await applyMapping(activeProfile.id, preset.mapping)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1 rounded text-sm border border-[var(--keycap-border)] text-[var(--keycap-text)] hover:border-[var(--accent)]"
      >
        プリセット ▾
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-48 rounded shadow-xl z-50 overflow-hidden"
          style={{
            background: 'var(--kb-bg)',
            border: '1px solid var(--keycap-border)'
          }}
        >
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApply(p.id)}
              className="w-full text-left px-4 py-2 text-sm text-[var(--keycap-text)] hover:bg-[var(--keycap-bg-hover)]"
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-[var(--keycap-text-label)]">{p.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
