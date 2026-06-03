import { clsx } from 'clsx'
import type { ComboAssignment } from '@shared/types'

const MODIFIERS: ComboAssignment['modifiers'] = ['Ctrl', 'Shift', 'Alt', 'Meta']

interface Props {
  modifiers: ComboAssignment['modifiers']
  onModifiersChange(value: ComboAssignment['modifiers']): void
  code: string
  onCodeChange(value: string): void
  capturing: boolean
  onStartCapture(): void
}

export function ComboTab({
  modifiers,
  onModifiersChange,
  code,
  onCodeChange,
  capturing,
  onStartCapture
}: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--keycap-text-label)]">修飾キー + キーコード</p>
      <div className="flex gap-2 flex-wrap">
        {MODIFIERS.map((mod) => (
          <button
            key={mod}
            onClick={() =>
              onModifiersChange(
                modifiers.includes(mod)
                  ? modifiers.filter((m) => m !== mod)
                  : [...modifiers, mod]
              )
            }
            className={clsx(
              'px-3 py-1 rounded text-xs border',
              modifiers.includes(mod)
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : 'border-[var(--keycap-border)] text-[var(--keycap-text-label)]'
            )}
          >
            {mod}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded px-3 py-2 text-sm"
          style={{
            background: 'var(--kb-bg)',
            border: '1px solid var(--keycap-border)',
            color: 'var(--keycap-text)'
          }}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="例: KeyC"
        />
        <button
          onClick={onStartCapture}
          className={clsx(
            'px-3 py-2 rounded text-xs font-medium bg-[var(--accent)] text-white hover:opacity-80',
            capturing && 'animate-pulse'
          )}
        >
          {capturing ? '押してください' : 'キャプチャ'}
        </button>
      </div>
    </div>
  )
}
