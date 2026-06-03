import { describe, it, expect } from 'vitest'
import { encodeProfile, decodeProfile } from '../src/lib/shareCode'
import { MAX_SHARE_CODE_LENGTH } from '../../shared/validation'
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
    const result = decodeProfile(code)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.profile).toEqual(SAMPLE)
  })

  it('プレフィックスなしコードは invalid-prefix', () => {
    const r = decodeProfile('invalid-code')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-prefix')
  })

  it('空文字は empty', () => {
    const r = decodeProfile('   ')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('empty')
  })

  it('壊れた base64 は invalid-base64', () => {
    const r = decodeProfile('BKM1:!!!!')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-base64')
  })

  it('壊れた JSON は invalid-json', () => {
    const r = decodeProfile('BKM1:' + btoa('not json'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-json')
  })

  it('必須フィールド欠落は invalid-shape', () => {
    const broken = 'BKM1:' + btoa(JSON.stringify({ id: 'x' }))
    const r = decodeProfile(broken)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-shape')
  })

  it('mapping が null の壊れたプロファイルは invalid-shape (typeof null === object の罠)', () => {
    const broken = 'BKM1:' + btoa(JSON.stringify({ ...SAMPLE, mapping: null }))
    const r = decodeProfile(broken)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-shape')
  })

  it('Assignment kind が不正なものは invalid-shape', () => {
    const broken = 'BKM1:' + btoa(JSON.stringify({ ...SAMPLE, mapping: { KeyA: { kind: 'evil' } } }))
    const r = decodeProfile(broken)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid-shape')
  })

  it('巨大な共有コードは too-large', () => {
    const huge = 'BKM1:' + 'A'.repeat(MAX_SHARE_CODE_LENGTH + 1)
    const r = decodeProfile(huge)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('too-large')
  })

  it('日本語プロファイル名でも encode/decode が往復する', () => {
    const jp: Profile = { ...SAMPLE, name: 'マイプロファイル' }
    const code = encodeProfile(jp)
    const r = decodeProfile(code)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.profile).toEqual(jp)
  })
})
