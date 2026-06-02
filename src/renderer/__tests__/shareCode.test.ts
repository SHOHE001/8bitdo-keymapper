import { describe, it, expect } from 'vitest'
import { encodeProfile, decodeProfile } from '../src/lib/shareCode'
import type { Profile } from '../../shared/types'

const SAMPLE: Profile = {
  id: 'test-id',
  name: 'Test Profile',
  theme: 'nes',
  mapping: {
    SuperA: { kind: 'key', code: 'KeyZ' },
    KeyA: { kind: 'combo', modifiers: ['Ctrl'], code: 'KeyA' }
  },
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

describe('shareCode', () => {
  it('encode/decode が往復する', () => {
    const code = encodeProfile(SAMPLE)
    expect(code).toMatch(/^BKM1:/)
    const decoded = decodeProfile(code)
    expect(decoded).toEqual(SAMPLE)
  })

  it('プレフィックスなしコードは null を返す', () => {
    expect(decodeProfile('invalid-code')).toBeNull()
  })

  it('壊れた base64 は null を返す', () => {
    expect(decodeProfile('BKM1:!!!!')).toBeNull()
  })

  it('必須フィールド欠落で null を返す', () => {
    const broken = 'BKM1:' + btoa(JSON.stringify({ id: 'x' }))
    expect(decodeProfile(broken)).toBeNull()
  })
})
