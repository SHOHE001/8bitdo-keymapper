import { describe, expect, it } from 'vitest'
import {
  buildAssignment,
  type AssignmentFormState
} from '../src/components/assignment/buildAssignment'

function base(overrides: Partial<AssignmentFormState> = {}): AssignmentFormState {
  return {
    tab: 'key',
    keyCode: '',
    comboMods: [],
    comboCode: '',
    macroSteps: [{ code: '' }],
    mediaAction: 'PlayPause',
    mouseButton: 'Left',
    ...overrides
  }
}

describe('buildAssignment', () => {
  it('returns null when key tab has empty code', () => {
    expect(buildAssignment(base())).toBeNull()
  })

  it('builds key assignment', () => {
    expect(buildAssignment(base({ keyCode: 'KeyA' }))).toEqual({ kind: 'key', code: 'KeyA' })
  })

  it('returns null when combo tab has empty code', () => {
    expect(buildAssignment(base({ tab: 'combo', comboMods: ['Ctrl'] }))).toBeNull()
  })

  it('builds combo assignment', () => {
    expect(
      buildAssignment(base({ tab: 'combo', comboMods: ['Ctrl', 'Shift'], comboCode: 'KeyC' }))
    ).toEqual({ kind: 'combo', modifiers: ['Ctrl', 'Shift'], code: 'KeyC' })
  })

  it('returns null when all macro steps are empty', () => {
    expect(buildAssignment(base({ tab: 'macro', macroSteps: [{ code: '' }] }))).toBeNull()
  })

  it('filters empty macro steps before saving', () => {
    expect(
      buildAssignment(
        base({
          tab: 'macro',
          macroSteps: [{ code: 'KeyA' }, { code: '' }, { code: 'KeyB', delayMs: 5 }]
        })
      )
    ).toEqual({
      kind: 'macro',
      steps: [{ code: 'KeyA' }, { code: 'KeyB', delayMs: 5 }]
    })
  })

  it('builds media assignment', () => {
    expect(buildAssignment(base({ tab: 'media', mediaAction: 'Next' }))).toEqual({
      kind: 'media',
      action: 'Next'
    })
  })

  it('builds mouse assignment', () => {
    expect(buildAssignment(base({ tab: 'mouse', mouseButton: 'Middle' }))).toEqual({
      kind: 'mouse',
      button: 'Middle'
    })
  })

  it('builds disabled assignment', () => {
    expect(buildAssignment(base({ tab: 'disabled' }))).toEqual({ kind: 'disabled' })
  })
})
