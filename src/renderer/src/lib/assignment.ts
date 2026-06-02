import type { Assignment } from '@shared/types'

export function formatAssignment(a: Assignment | undefined): string {
  if (!a) return ''
  switch (a.kind) {
    case 'key':
      return a.code.replace(/^(Key|Digit)/, '')
    case 'combo': {
      const mods = a.modifiers.join('+')
      const key = a.code.replace(/^(Key|Digit)/, '')
      return mods ? `${mods}+${key}` : key
    }
    case 'macro':
      return a.steps.map((s) => s.code.replace(/^(Key|Digit)/, '')).join('→')
    case 'media':
      return a.action
    case 'mouse':
      return `M:${a.button}`
    case 'disabled':
      return '—'
  }
}
