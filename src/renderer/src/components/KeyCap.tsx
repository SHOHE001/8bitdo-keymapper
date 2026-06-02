import { clsx } from 'clsx'
import type { Assignment } from '@shared/types'
import { formatAssignment } from '../lib/assignment'

interface Props {
  id: string
  label: string
  w: number
  h: number
  col: number
  row: number
  assignment?: Assignment
  isSelected: boolean
  onClick(): void
  isSuper?: boolean
}

export function KeyCap({ id: _id, label, w, h, col, row, assignment, isSelected, onClick, isSuper }: Props) {
  const assignLabel = formatAssignment(assignment)

  const style: React.CSSProperties = {
    gridColumn: `${Math.round(col * 4)} / span ${Math.round(w * 4)}`,
    gridRow: `${Math.round(row * 4)} / span ${Math.round(h * 4)}`
  }

  return (
    <button
      style={style}
      onClick={onClick}
      className={clsx(
        'relative flex flex-col items-center justify-center select-none',
        'rounded transition-colors duration-100 border',
        'text-[var(--keycap-text)] border-[var(--keycap-border)]',
        isSuper
          ? 'bg-[var(--super-bg)] border-[var(--super-border)] text-[var(--super-text)]'
          : 'bg-[var(--keycap-bg)] hover:bg-[var(--keycap-bg-hover)]',
        isSelected && !isSuper && 'bg-[var(--keycap-bg-active)]',
        isSelected && isSuper && 'opacity-80',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
      )}
      title={label}
    >
      <span className={clsx('font-bold leading-none', isSuper ? 'text-2xl' : 'text-xs')}>
        {label}
      </span>
      {assignLabel && (
        <span
          className={clsx(
            'mt-0.5 leading-none truncate max-w-full px-0.5',
            'text-[var(--keycap-text-label)]',
            isSuper ? 'text-xs' : 'text-[9px]'
          )}
        >
          {assignLabel}
        </span>
      )}
    </button>
  )
}
