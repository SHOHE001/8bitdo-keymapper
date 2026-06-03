import { describe, expect, it } from 'vitest'
import { prettyKeyCode } from '../prettyKeyCode'

describe('prettyKeyCode', () => {
  it('strips Key prefix', () => {
    expect(prettyKeyCode('KeyA')).toBe('A')
  })
  it('strips Digit prefix', () => {
    expect(prettyKeyCode('Digit1')).toBe('1')
  })
  it('keeps unstrippable codes intact', () => {
    expect(prettyKeyCode('Space')).toBe('Space')
    expect(prettyKeyCode('ArrowLeft')).toBe('ArrowLeft')
    expect(prettyKeyCode('Numpad1')).toBe('Numpad1')
  })
  it('keeps Key/Digit with no suffix intact', () => {
    expect(prettyKeyCode('Key')).toBe('Key')
    expect(prettyKeyCode('Digit')).toBe('Digit')
  })
})
