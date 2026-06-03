import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../src/lib/ipc', () => {
  const calls = {
    saveProfile: [] as unknown[],
    setActive: [] as unknown[],
    deleteProfile: [] as unknown[]
  }
  return {
    api: {
      getState: vi.fn(async () => ({ profiles: [], activeProfileId: null, version: 1 })),
      saveProfile: vi.fn(async (p: unknown) => {
        calls.saveProfile.push(p)
      }),
      deleteProfile: vi.fn(async (id: unknown) => {
        calls.deleteProfile.push(id)
      }),
      setActive: vi.fn(async (id: unknown) => {
        calls.setActive.push(id)
      }),
      exportProfile: vi.fn(async () => null),
      importProfile: vi.fn(async () => null)
    },
    __calls: calls
  }
})

import { useProfileStore, DEFAULT_SAMPLE_NAME } from '../src/store/useProfileStore'
import { PRESETS } from '../src/data/presets'

function resetStore(): void {
  useProfileStore.setState({
    profiles: [],
    activeProfileId: null,
    initialized: true
  })
}

describe('useProfileStore', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  it('createProfile は作成した Profile を返す', async () => {
    const created = await useProfileStore.getState().createProfile('テスト1')
    expect(created.name).toBe('テスト1')
    expect(created.theme).toBe('nes')
    expect(created.mapping).toEqual({})
    expect(created.id).toBeTruthy()
    expect(useProfileStore.getState().profiles).toHaveLength(1)
    expect(useProfileStore.getState().activeProfileId).toBe(created.id)
  })

  it('createSampleProfile はデフォルト名で空 mapping の Profile を返す', async () => {
    const created = await useProfileStore.getState().createSampleProfile()
    expect(created.name).toBe(DEFAULT_SAMPLE_NAME)
    expect(created.mapping).toEqual({})
  })

  it('同名が既にあるときは「マイプロファイル 2」と採番される', async () => {
    await useProfileStore.getState().createSampleProfile()
    const second = await useProfileStore.getState().createSampleProfile()
    expect(second.name).toBe(`${DEFAULT_SAMPLE_NAME} 2`)
    const third = await useProfileStore.getState().createSampleProfile()
    expect(third.name).toBe(`${DEFAULT_SAMPLE_NAME} 3`)
  })

  it('presetId を指定すると当該プリセットの mapping が適用される', async () => {
    const created = await useProfileStore
      .getState()
      .createSampleProfile({ presetId: 'famicom' })
    const famicom = PRESETS.find((p) => p.id === 'famicom')!
    const stored = useProfileStore.getState().profiles.find((p) => p.id === created.id)!
    expect(stored.mapping).toEqual(famicom.mapping)
  })

  it('baseName を指定するとそれが採番ベースになる', async () => {
    const created = await useProfileStore.getState().createSampleProfile({ baseName: 'ゲーム用' })
    expect(created.name).toBe('ゲーム用')
  })
})
