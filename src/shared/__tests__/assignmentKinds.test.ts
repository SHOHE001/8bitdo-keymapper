import { describe, expect, it } from 'vitest'
import { assignmentKinds, ASSIGNMENT_KIND_ORDER } from '../assignmentKinds'

describe('assignmentKinds registry', () => {
  it('covers every Assignment kind exactly once', () => {
    const keys = Object.keys(assignmentKinds).sort()
    expect(keys).toEqual([...ASSIGNMENT_KIND_ORDER].sort())
  })

  it('format key uses prettyKeyCode', () => {
    expect(assignmentKinds.key.format({ kind: 'key', code: 'KeyA' })).toBe('A')
  })

  it('format combo joins modifiers + key', () => {
    expect(
      assignmentKinds.combo.format({ kind: 'combo', modifiers: ['Ctrl', 'Shift'], code: 'KeyC' })
    ).toBe('Ctrl+Shift+C')
  })

  it('format combo without modifiers omits separator', () => {
    expect(assignmentKinds.combo.format({ kind: 'combo', modifiers: [], code: 'KeyA' })).toBe('A')
  })

  it('format macro joins steps with arrow', () => {
    expect(
      assignmentKinds.macro.format({
        kind: 'macro',
        steps: [{ code: 'KeyA' }, { code: 'KeyB' }]
      })
    ).toBe('A→B')
  })

  it('format media returns action', () => {
    expect(assignmentKinds.media.format({ kind: 'media', action: 'PlayPause' })).toBe('PlayPause')
  })

  it('format mouse prefixes M:', () => {
    expect(assignmentKinds.mouse.format({ kind: 'mouse', button: 'Left' })).toBe('M:Left')
  })

  it('format disabled returns em dash', () => {
    expect(assignmentKinds.disabled.format({ kind: 'disabled' })).toBe('—')
  })
})
