import { describe, it, expect } from 'vitest'
import { PRESETS } from '../src/data/presets'

describe('PRESETS', () => {
  it('3つのプリセットがある', () => {
    expect(PRESETS).toHaveLength(3)
  })

  it('各プリセットに id / name / description / mapping がある', () => {
    for (const p of PRESETS) {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.description).toBeTruthy()
      expect(typeof p.mapping).toBe('object')
    }
  })

  it('famicom プリセットに SuperA/SuperB が含まれる', () => {
    const fc = PRESETS.find((p) => p.id === 'famicom')!
    expect(fc.mapping['SuperA']).toBeDefined()
    expect(fc.mapping['SuperB']).toBeDefined()
  })

  it('fps プリセットに SuperA/SuperB が含まれる', () => {
    const fps = PRESETS.find((p) => p.id === 'fps')!
    expect(fps.mapping['SuperA']).toBeDefined()
    expect(fps.mapping['SuperB']).toBeDefined()
  })
})
