import { describe, expect, it } from 'vitest'
import { parseImportedProfile } from '../ipc/io-internals'
import { MAX_PROFILE_JSON_BYTES } from '../../shared/validation'
import type { Profile } from '../../shared/types'

const VALID: Profile = {
  id: 'p1',
  name: 'sample',
  theme: 'nes',
  mapping: { KeyA: { kind: 'key', code: 'KeyZ' } },
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}

describe('parseImportedProfile', () => {
  it('accepts a valid profile JSON', () => {
    const text = JSON.stringify(VALID)
    const r = parseImportedProfile(text, text.length)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.profile).toEqual(VALID)
  })

  it('rejects oversized files', () => {
    const r = parseImportedProfile('{}', MAX_PROFILE_JSON_BYTES + 1)
    expect(r).toEqual({ ok: false, reason: 'too-large' })
  })

  it('rejects invalid JSON', () => {
    const r = parseImportedProfile('not-json', 8)
    expect(r).toEqual({ ok: false, reason: 'invalid-json' })
  })

  it('rejects broken shape (mapping null)', () => {
    const text = JSON.stringify({ ...VALID, mapping: null })
    const r = parseImportedProfile(text, text.length)
    expect(r).toEqual({ ok: false, reason: 'invalid-shape' })
  })

  it('rejects broken assignment kind', () => {
    const text = JSON.stringify({ ...VALID, mapping: { KeyA: { kind: 'evil' } } })
    const r = parseImportedProfile(text, text.length)
    expect(r).toEqual({ ok: false, reason: 'invalid-shape' })
  })
})
