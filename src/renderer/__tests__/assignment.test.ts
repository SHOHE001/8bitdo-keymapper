import { describe, it, expect } from 'vitest'
import { formatAssignment } from '../src/lib/assignment'
import type { Assignment } from '../../shared/types'

describe('formatAssignment', () => {
  it('undefined は空文字を返す', () => {
    expect(formatAssignment(undefined)).toBe('')
  })

  it('key: KeyA → "A"', () => {
    const a: Assignment = { kind: 'key', code: 'KeyA' }
    expect(formatAssignment(a)).toBe('A')
  })

  it('combo: Ctrl+Shift+KeyC → "Ctrl+Shift+C"', () => {
    const a: Assignment = { kind: 'combo', modifiers: ['Ctrl', 'Shift'], code: 'KeyC' }
    expect(formatAssignment(a)).toBe('Ctrl+Shift+C')
  })

  it('macro: KeyA→KeyB', () => {
    const a: Assignment = { kind: 'macro', steps: [{ code: 'KeyA' }, { code: 'KeyB' }] }
    expect(formatAssignment(a)).toBe('A→B')
  })

  it('media: PlayPause', () => {
    const a: Assignment = { kind: 'media', action: 'PlayPause' }
    expect(formatAssignment(a)).toBe('PlayPause')
  })

  it('mouse: Left → "M:Left"', () => {
    const a: Assignment = { kind: 'mouse', button: 'Left' }
    expect(formatAssignment(a)).toBe('M:Left')
  })

  it('disabled → "—"', () => {
    const a: Assignment = { kind: 'disabled' }
    expect(formatAssignment(a)).toBe('—')
  })
})
