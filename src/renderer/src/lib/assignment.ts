import type { Assignment } from '@shared/types'
import { assignmentKinds } from '@shared/assignmentKinds'

function assertNever(x: never): never {
  throw new Error(`Unreachable assignment kind: ${JSON.stringify(x)}`)
}

export function formatAssignment(a: Assignment | undefined): string {
  if (!a) return ''
  switch (a.kind) {
    case 'key':
      return assignmentKinds.key.format(a)
    case 'combo':
      return assignmentKinds.combo.format(a)
    case 'macro':
      return assignmentKinds.macro.format(a)
    case 'media':
      return assignmentKinds.media.format(a)
    case 'mouse':
      return assignmentKinds.mouse.format(a)
    case 'disabled':
      return assignmentKinds.disabled.format(a)
    default:
      return assertNever(a)
  }
}
