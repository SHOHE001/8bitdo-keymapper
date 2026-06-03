import type {
  Assignment,
  ComboAssignment,
  MacroStep,
  MediaAssignment,
  MouseAssignment
} from '@shared/types'

export interface AssignmentFormState {
  tab: Assignment['kind']
  keyCode: string
  comboMods: ComboAssignment['modifiers']
  comboCode: string
  macroSteps: MacroStep[]
  mediaAction: MediaAssignment['action']
  mouseButton: MouseAssignment['button']
}

// (tab + 各タブの form state) → 保存される Assignment への純粋変換。
// 値が不十分なときは null を返し、呼び出し側で保存をスキップする。
export function buildAssignment(state: AssignmentFormState): Assignment | null {
  switch (state.tab) {
    case 'key':
      if (!state.keyCode) return null
      return { kind: 'key', code: state.keyCode }
    case 'combo':
      if (!state.comboCode) return null
      return { kind: 'combo', modifiers: state.comboMods, code: state.comboCode }
    case 'macro': {
      const steps = state.macroSteps.filter((s) => s.code)
      if (!steps.length) return null
      return { kind: 'macro', steps }
    }
    case 'media':
      return { kind: 'media', action: state.mediaAction }
    case 'mouse':
      return { kind: 'mouse', button: state.mouseButton }
    case 'disabled':
      return { kind: 'disabled' }
  }
}
