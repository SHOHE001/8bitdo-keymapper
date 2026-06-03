import { useState, useRef, useEffect } from 'react'
import { PRESETS } from '../data/presets'
import { useProfileStore } from '../store/useProfileStore'
import { useUiStore } from '../store/useUiStore'
import { toastMessages } from '../lib/toastMessages'

export function PresetMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const createSampleProfile = useProfileStore((s) => s.createSampleProfile)
  const applyMapping = useProfileStore((s) => s.applyMapping)
  const addToast = useUiStore((s) => s.addToast)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleApply = async (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setOpen(false)

    if (!activeProfile) {
      const created = await createSampleProfile({ presetId })
      addToast(toastMessages.sampleCreated(created.name), 'success')
      return
    }

    await applyMapping(activeProfile.id, preset.mapping)
    addToast(toastMessages.presetApplied(preset.name), 'success')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1 rounded text-sm border border-[var(--keycap-border)] text-[var(--keycap-text)] hover:border-[var(--accent)]"
        title="あらかじめ用意された割り当てセットを適用"
      >
        プリセットから選ぶ ▾
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-1 w-64 rounded shadow-xl z-50 overflow-hidden"
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
          <div
            className="px-4 py-2 text-[10px] leading-relaxed border-t"
            style={{
              background: 'var(--keycap-bg)',
              borderColor: 'var(--keycap-border)',
              color: 'var(--keycap-text-label)'
            }}
          >
            ※ 適用すると現在のプロファイルの割り当てが上書きされます
          </div>
        </div>
      )}
    </div>
  )
}
