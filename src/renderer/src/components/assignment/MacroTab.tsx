import type { MacroStep } from '@shared/types'

interface Props {
  steps: MacroStep[]
  onChange(value: MacroStep[]): void
}

export function MacroTab({ steps, onChange }: Props) {
  const setCode = (i: number, code: string): void => {
    onChange(steps.map((s, j) => (j === i ? { ...s, code } : s)))
  }
  const setDelay = (i: number, raw: string): void => {
    onChange(
      steps.map((s, j) =>
        j === i ? { ...s, delayMs: raw ? Number(raw) : undefined } : s
      )
    )
  }
  const remove = (i: number): void => onChange(steps.filter((_, j) => j !== i))
  const add = (): void => onChange([...steps, { code: '' }])

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--keycap-text-label)]">連続入力ステップ</p>
      {steps.map((step, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="flex-1 rounded px-2 py-1 text-sm"
            style={{
              background: 'var(--kb-bg)',
              border: '1px solid var(--keycap-border)',
              color: 'var(--keycap-text)'
            }}
            value={step.code}
            onChange={(e) => setCode(i, e.target.value)}
            placeholder="KeyCode"
          />
          <input
            type="number"
            className="w-16 rounded px-2 py-1 text-sm"
            style={{
              background: 'var(--kb-bg)',
              border: '1px solid var(--keycap-border)',
              color: 'var(--keycap-text)'
            }}
            value={step.delayMs ?? ''}
            onChange={(e) => setDelay(i, e.target.value)}
            placeholder="ms"
          />
          <button
            onClick={() => remove(i)}
            className="text-[var(--keycap-text-label)] hover:text-red-400 text-sm"
          >
            ✕
          </button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-[var(--accent)] hover:opacity-80">
        + ステップ追加
      </button>
    </div>
  )
}
