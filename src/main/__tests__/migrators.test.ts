import { describe, expect, it } from 'vitest'
import { migrate } from '../migrators'
import type { Profile } from '../../shared/types'

const SAMPLE_PROFILE: Profile = {
  id: 'p1',
  name: 'sample',
  theme: 'nes',
  mapping: { KeyA: { kind: 'key', code: 'KeyZ' } },
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}

describe('migrate', () => {
  it('migrates v1 to v2 by adding ui.welcomeSeen=false', () => {
    const v1 = {
      profiles: [SAMPLE_PROFILE],
      activeProfileId: 'p1',
      version: 1
    }
    const result = migrate(v1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.version).toBe(2)
      expect(result.state.ui).toEqual({ welcomeSeen: false })
      expect(result.state.profiles).toEqual(v1.profiles)
    }
  })

  it('accepts a current v2 state as-is', () => {
    const v2 = {
      profiles: [SAMPLE_PROFILE],
      activeProfileId: 'p1',
      version: 2,
      ui: { welcomeSeen: true }
    }
    const result = migrate(v2)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.state).toEqual(v2)
  })

  it('rejects missing version', () => {
    const r = migrate({ profiles: [], activeProfileId: null })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-shape')
  })

  it('rejects unknown future version', () => {
    const r = migrate({ profiles: [], activeProfileId: null, version: 99 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('unknown-version')
  })

  it('rejects invalid profile shape after migration', () => {
    const r = migrate({ profiles: [{ id: 'bad' }], activeProfileId: null, version: 1 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-shape')
  })

  it('normalises non-string/null activeProfileId to null', () => {
    const r = migrate({
      profiles: [SAMPLE_PROFILE],
      activeProfileId: 42,
      version: 2,
      ui: { welcomeSeen: false }
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.state.activeProfileId).toBeNull()
  })

  it('rejects v2 state missing ui field', () => {
    const r = migrate({
      profiles: [SAMPLE_PROFILE],
      activeProfileId: 'p1',
      version: 2
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-shape')
  })
})
