import { clsx } from 'clsx'
import type { MouseAssignment } from '@shared/types'

const MOUSE_BUTTONS: MouseAssignment['button'][] = [
  'Left',
  'Right',
  'Middle',
  'WheelUp',
  'WheelDown'
]

interface Props {
  button: MouseAssignment['button']
  onChange(value: MouseAssignment['button']): void
}

export function MouseTab({ button, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--keycap-text-label)]">マウスボタン</p>
      <div className="grid grid-cols-3 gap-2">
        {MOUSE_BUTTONS.map((b) => (
          <button
            key={b}
            onClick={() => onChange(b)}
            className={clsx(
              'py-2 rounded text-xs border',
              button === b
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : 'border-[var(--keycap-border)] text-[var(--keycap-text-label)]'
            )}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  )
}
