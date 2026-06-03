import { clsx } from 'clsx'

interface Props {
  keyCode: string
  onChange(value: string): void
  capturing: boolean
  onStartCapture(): void
}

export function KeyTab({ keyCode, onChange, capturing, onStartCapture }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--keycap-text-label)]">割り当てるキーコード</p>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded px-3 py-2 text-sm"
          style={{
            background: 'var(--kb-bg)',
            border: '1px solid var(--keycap-border)',
            color: 'var(--keycap-text)'
          }}
          value={keyCode}
          onChange={(e) => onChange(e.target.value)}
          placeholder="例: KeyA"
        />
        <button
          onClick={onStartCapture}
          className={clsx(
            'px-3 py-2 rounded text-xs font-medium',
            'bg-[var(--accent)] text-white hover:opacity-80',
            capturing && 'animate-pulse'
          )}
        >
          {capturing ? '押してください' : 'キャプチャ'}
        </button>
      </div>
    </div>
  )
}
