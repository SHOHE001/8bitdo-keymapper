import { describe, expect, it } from 'vitest'
import { generateAhkScript } from '../ahk/generateAhk'
import type { KeyMapping, Profile } from '../types'

function profile(mapping: KeyMapping, name = 'sample'): Profile {
  return {
    id: 'p1',
    name,
    theme: 'nes',
    mapping,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
}

describe('generateAhkScript', () => {
  it('常に v2 ヘッダと SingleInstance を先頭に出す', () => {
    const { script } = generateAhkScript(profile({}))
    const head = script.split('\n')
    expect(head[0]).toBe('#Requires AutoHotkey v2.0')
    expect(head[1]).toBe('#SingleInstance Force')
  })

  it('key は native remap（src::dst）に変換する', () => {
    const { script, warnings } = generateAhkScript(
      profile({ KeyA: { kind: 'key', code: 'KeyZ' } })
    )
    expect(script).toContain('a::z')
    expect(warnings).toEqual([])
  })

  it('combo は修飾記号付き Send に変換する', () => {
    const { script } = generateAhkScript(
      profile({ KeyA: { kind: 'combo', modifiers: ['Ctrl', 'Shift'], code: 'KeyS' } })
    )
    expect(script).toContain('a::Send "^+s"')
  })

  it('修飾なし combo は native remap にフォールバックする', () => {
    const { script } = generateAhkScript(
      profile({ KeyA: { kind: 'combo', modifiers: [], code: 'KeyZ' } })
    )
    expect(script).toContain('a::z')
  })

  it('macro は複数行ブロックにし、delayMs はステップ送出前の Sleep にする', () => {
    const { script } = generateAhkScript(
      profile({
        KeyA: {
          kind: 'macro',
          steps: [{ code: 'KeyH' }, { code: 'KeyI', delayMs: 200 }]
        }
      })
    )
    expect(script).toContain('a:: {')
    // KeyH を送る → 200ms 待つ → KeyI を送る、の順
    const block = script.slice(script.indexOf('a:: {'))
    expect(block).toContain('    Send "h"\n    Sleep 200\n    Send "i"')
  })

  it('media 全 6 種を変換する', () => {
    const cases: Array<[string, string]> = [
      ['PlayPause', '{Media_Play_Pause}'],
      ['Next', '{Media_Next}'],
      ['Prev', '{Media_Prev}'],
      ['VolumeUp', '{Volume_Up}'],
      ['VolumeDown', '{Volume_Down}'],
      ['Mute', '{Volume_Mute}']
    ]
    for (const [action, send] of cases) {
      const { script } = generateAhkScript(
        profile({ KeyA: { kind: 'media', action: action as never } })
      )
      expect(script).toContain(`a::Send "${send}"`)
    }
  })

  it('mouse 全 5 種を変換する', () => {
    const map: Array<[string, string]> = [
      ['Left', 'a::Click'],
      ['Right', 'a::Click "Right"'],
      ['Middle', 'a::Click "Middle"'],
      ['WheelUp', 'a::Send "{WheelUp}"'],
      ['WheelDown', 'a::Send "{WheelDown}"']
    ]
    for (const [button, expected] of map) {
      const { script } = generateAhkScript(
        profile({ KeyA: { kind: 'mouse', button: button as never } })
      )
      expect(script).toContain(expected)
    }
  })

  it('disabled は return でキーを潰す', () => {
    const { script } = generateAhkScript(profile({ KeyA: { kind: 'disabled' } }))
    expect(script).toContain('a::return')
  })

  it('記号キーは AHK 表現に変換する（左辺は SC、送出は安全な表現）', () => {
    const { script } = generateAhkScript(
      profile({
        Backquote: { kind: 'key', code: 'Semicolon' },
        Comma: { kind: 'key', code: 'Period' }
      })
    )
    // Backquote 左辺は SC029、Semicolon 右辺も SC027（native remap の右辺）
    expect(script).toContain('SC029::SC027')
    expect(script).toContain(',::.')
  })

  it('SuperA / SuperB は OS 上の code 不明のためスキップ + 警告', () => {
    const { script, warnings } = generateAhkScript(
      profile({ SuperA: { kind: 'key', code: 'KeyA' }, SuperB: { kind: 'disabled' } })
    )
    expect(script).toContain('; SKIPPED')
    expect(warnings.some((w) => w.includes('SuperA'))).toBe(true)
    expect(warnings.some((w) => w.includes('SuperB'))).toBe(true)
  })

  it('割り当て先が未設定/未対応ならスキップ + 警告', () => {
    const { warnings } = generateAhkScript(profile({ KeyA: { kind: 'key', code: '' } }))
    expect(warnings.length).toBe(1)
    expect(warnings[0]).toContain('KeyA')
  })

  it('プロファイル名の改行はコメント行を壊さない', () => {
    const { script } = generateAhkScript(profile({}, 'evil\nname'))
    const commentLine = script.split('\n').find((l) => l.includes('プロファイル:'))
    expect(commentLine).toContain('evil name')
    expect(commentLine).not.toContain('\n')
  })
})
