import { describe, expect, it } from 'vitest'
import { migrate } from '../migrators'
import type { AppState } from '../../shared/types'

const VALID_V1: AppState = {
  profiles: [
    {
      id: 'p1',
      name: 'sample',
      theme: 'nes',
      mapping: { KeyA: { kind: 'key', code: 'KeyZ' } },
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    }
  ],
  activeProfileId: 'p1',
  version: 1
}

describe('migrate', () => {
  it('accepts a current-version AppState', () => {
    const result = migrate(VALID_V1)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.state).toEqual(VALID_V1)
  })

  it('rejects missing version', () => {
    const r = migrate({ profiles: [], activeProfileId: null })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-shape')
  })

  it('rejects unknown future version', () => {
    const r = migrate({ ...VALID_V1, version: 99 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('unknown-version')
  })

  it('rejects invalid profile shape', () => {
    const r = migrate({ ...VALID_V1, profiles: [{ id: 'bad' }] })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-shape')
  })

  it('accepts an unknown activeProfileId by normalising to null', () => {
    const r = migrate({ ...VALID_V1, activeProfileId: 42 })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.state.activeProfileId).toBeNull()
  })
})
