import { describe, expect, it } from 'vitest'
import {
  MAX_MACRO_STEPS,
  MAX_MAPPING_KEYS,
  validateAssignment,
  validateProfile
} from '../validation'
import type { Profile } from '../types'

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'p1',
    name: 'sample',
    theme: 'nes',
    mapping: {},
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides
  }
}

describe('validateAssignment', () => {
  it.each([
    [{ kind: 'key', code: 'KeyA' }],
    [{ kind: 'combo', modifiers: ['Ctrl', 'Shift'], code: 'KeyC' }],
    [{ kind: 'macro', steps: [{ code: 'KeyA' }, { code: 'KeyB', delayMs: 10 }] }],
    [{ kind: 'media', action: 'PlayPause' }],
    [{ kind: 'mouse', button: 'Left' }],
    [{ kind: 'disabled' }]
  ])('accepts valid %j', (input) => {
    expect(validateAssignment(input)).toEqual(input)
  })

  it.each([
    null,
    {},
    { kind: 'unknown' },
    { kind: 'key' },
    { kind: 'key', code: 1 },
    { kind: 'combo', modifiers: ['Foo'], code: 'KeyA' },
    { kind: 'combo', modifiers: 'Ctrl', code: 'KeyA' },
    { kind: 'macro', steps: [] },
    { kind: 'macro', steps: [{ delayMs: 1 }] },
    { kind: 'macro', steps: [{ code: 'KeyA', delayMs: -1 }] },
    { kind: 'media', action: 'Hax' },
    { kind: 'mouse', button: 'Trigger' }
  ])('rejects %j', (input) => {
    expect(validateAssignment(input as unknown)).toBeNull()
  })

  it('rejects macros exceeding MAX_MACRO_STEPS', () => {
    const steps = Array.from({ length: MAX_MACRO_STEPS + 1 }, () => ({ code: 'KeyA' }))
    expect(validateAssignment({ kind: 'macro', steps })).toBeNull()
  })
})

describe('validateProfile', () => {
  it('accepts a minimal valid profile', () => {
    expect(validateProfile(makeProfile())).toEqual(makeProfile())
  })

  it('rejects when mapping is null (typeof null === object のすり抜け対策)', () => {
    expect(validateProfile(makeProfile({ mapping: null as never }))).toBeNull()
  })

  it('rejects when mapping is array', () => {
    expect(validateProfile(makeProfile({ mapping: [] as never }))).toBeNull()
  })

  it('rejects unknown theme', () => {
    expect(validateProfile(makeProfile({ theme: 'commodore' as never }))).toBeNull()
  })

  it('rejects when mapping contains broken assignment', () => {
    const profile = makeProfile({ mapping: { KeyA: { kind: 'key' } as never } })
    expect(validateProfile(profile)).toBeNull()
  })

  it('rejects when an ISO date is malformed', () => {
    expect(validateProfile(makeProfile({ createdAt: '2025-01-01' as never }))).toBeNull()
  })

  it('rejects when mapping exceeds MAX_MAPPING_KEYS', () => {
    const mapping: Record<string, { kind: 'key'; code: string }> = {}
    for (let i = 0; i <= MAX_MAPPING_KEYS; i++) mapping[`KeyA${i}`] = { kind: 'key', code: 'KeyA' }
    expect(validateProfile(makeProfile({ mapping: mapping as never }))).toBeNull()
  })

  it('rejects missing id', () => {
    const p = makeProfile()
    delete (p as unknown as Record<string, unknown>).id
    expect(validateProfile(p)).toBeNull()
  })
})
