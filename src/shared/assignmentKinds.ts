import type {
  Assignment,
  ComboAssignment,
  DisabledAssignment,
  KeyAssignment,
  MacroAssignment,
  MediaAssignment,
  MouseAssignment
} from './types'
import { prettyKeyCode } from './prettyKeyCode'

export interface AssignmentKindSpec<T extends Assignment> {
  label: string
  defaults: T
  format(a: T): string
}

const key: AssignmentKindSpec<KeyAssignment> = {
  label: 'キー',
  defaults: { kind: 'key', code: '' },
  format: (a) => prettyKeyCode(a.code)
}

const combo: AssignmentKindSpec<ComboAssignment> = {
  label: 'コンボ',
  defaults: { kind: 'combo', modifiers: [], code: '' },
  format: (a) => {
    const mods = a.modifiers.join('+')
    const k = prettyKeyCode(a.code)
    return mods ? `${mods}+${k}` : k
  }
}

const macro: AssignmentKindSpec<MacroAssignment> = {
  label: 'マクロ',
  defaults: { kind: 'macro', steps: [] },
  format: (a) => a.steps.map((s) => prettyKeyCode(s.code)).join('→')
}

const media: AssignmentKindSpec<MediaAssignment> = {
  label: 'メディア',
  defaults: { kind: 'media', action: 'PlayPause' },
  format: (a) => a.action
}

const mouse: AssignmentKindSpec<MouseAssignment> = {
  label: 'マウス',
  defaults: { kind: 'mouse', button: 'Left' },
  format: (a) => `M:${a.button}`
}

const disabled: AssignmentKindSpec<DisabledAssignment> = {
  label: '無効',
  defaults: { kind: 'disabled' },
  format: () => '—'
}

export const assignmentKinds = { key, combo, macro, media, mouse, disabled }

export const ASSIGNMENT_KIND_ORDER: Array<Assignment['kind']> = [
  'key',
  'combo',
  'macro',
  'media',
  'mouse',
  'disabled'
]
