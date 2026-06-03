import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export type PanelVariant = 'card' | 'well' | 'dashed' | 'ghost'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant
}

const VARIANT_STYLES: Record<PanelVariant, CSSProperties> = {
  card: {
    background: 'var(--keycap-bg)',
    border: '1px solid var(--keycap-border)',
    color: 'var(--keycap-text)'
  },
  well: {
    background: 'var(--kb-bg)',
    border: '1px solid var(--keycap-border)',
    color: 'var(--keycap-text-label)'
  },
  dashed: {
    background: 'var(--keycap-bg)',
    border: '2px dashed var(--keycap-border)',
    color: 'var(--keycap-text)'
  },
  ghost: {
    background: 'transparent',
    border: '1px solid var(--keycap-border)',
    color: 'var(--keycap-text)'
  }
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { variant = 'card', className, style, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx('rounded', className)}
      style={{ ...VARIANT_STYLES[variant], ...style }}
      {...rest}
    >
      {children}
    </div>
  )
})
