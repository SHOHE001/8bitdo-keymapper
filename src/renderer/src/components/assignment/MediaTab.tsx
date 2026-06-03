import { clsx } from 'clsx'
import type { MediaAssignment } from '@shared/types'

const MEDIA_ACTIONS: MediaAssignment['action'][] = [
  'PlayPause',
  'Next',
  'Prev',
  'VolumeUp',
  'VolumeDown',
  'Mute'
]

interface Props {
  action: MediaAssignment['action']
  onChange(value: MediaAssignment['action']): void
}

export function MediaTab({ action, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--keycap-text-label)]">メディアアクション</p>
      <div className="grid grid-cols-3 gap-2">
        {MEDIA_ACTIONS.map((a) => (
          <button
            key={a}
            onClick={() => onChange(a)}
            className={clsx(
              'py-2 rounded text-xs border',
              action === a
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : 'border-[var(--keycap-border)] text-[var(--keycap-text-label)]'
            )}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  )
}
