import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AppState } from '../../shared/types'
import type { Command } from '../../shared/commands'

vi.mock('../src/lib/ipc', () => ({
  api: {
    getState: vi.fn(),
    mutate: vi.fn(),
    exportProfile: vi.fn(async () => null),
    importProfile: vi.fn(async () => null),
    onStoreError: vi.fn(() => () => {})
  }
}))

import { api } from '../src/lib/ipc'
import { useProfileStore, DEFAULT_SAMPLE_NAME } from '../src/store/useProfileStore'
import { useUiStore } from '../src/store/useUiStore'
import { PRESETS } from '../src/data/presets'

const emptyState = (): AppState => ({
  profiles: [],
  activeProfileId: null,
  version: 2,
  ui: { welcomeSeen: false }
})

let fakeState: AppState = emptyState()

function resetMutateMock(): void {
  fakeState = emptyState()
  vi.mocked(api.getState).mockResolvedValue(fakeState)
  vi.mocked(api.mutate).mockImplementation(async (command: Command): Promise<AppState> => {
    switch (command.type) {
      case 'profiles/save': {
        const idx = fakeState.profiles.findIndex((p) => p.id === command.profile.id)
        const profiles =
          idx >= 0
            ? fakeState.profiles.map((p) => (p.id === command.profile.id ? command.profile : p))
            : [...fakeState.profiles, command.profile]
        fakeState = { ...fakeState, profiles }
        return fakeState
      }
      case 'profiles/delete': {
        const profiles = fakeState.profiles.filter((p) => p.id !== command.id)
        const activeProfileId =
          fakeState.activeProfileId === command.id
            ? (profiles[0]?.id ?? null)
            : fakeState.activeProfileId
        fakeState = { ...fakeState, profiles, activeProfileId }
        return fakeState
      }
      case 'profiles/setActive':
        fakeState = { ...fakeState, activeProfileId: command.id }
        return fakeState
      case 'ui/setWelcomeSeen':
        fakeState = { ...fakeState, ui: { ...fakeState.ui, welcomeSeen: command.value } }
        return fakeState
    }
  })
}

function resetStore(): void {
  useProfileStore.setState({ profiles: [], activeProfileId: null, initialized: true })
  useUiStore.setState({ toasts: [] })
}

describe('useProfileStore - 正常系', () => {
  beforeEach(() => {
    resetMutateMock()
    resetStore()
  })

  it('createProfile は作成した Profile を返す', async () => {
    const created = await useProfileStore.getState().createProfile('テスト1')
    expect(created.name).toBe('テスト1')
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

  it('setAssignment は profile の mapping を更新する', async () => {
    const created = await useProfileStore.getState().createProfile('テスト')
    await useProfileStore
      .getState()
      .setAssignment(created.id, 'KeyA', { kind: 'key', code: 'KeyZ' })
    const stored = useProfileStore.getState().profiles.find((p) => p.id === created.id)!
    expect(stored.mapping['KeyA']).toEqual({ kind: 'key', code: 'KeyZ' })
  })

  it('renameProfile は名前を更新する', async () => {
    const created = await useProfileStore.getState().createProfile('旧')
    await useProfileStore.getState().renameProfile(created.id, '新')
    expect(useProfileStore.getState().profiles[0].name).toBe('新')
  })

  it('setTheme はテーマを更新する', async () => {
    const created = await useProfileStore.getState().createProfile('テスト')
    await useProfileStore.getState().setTheme(created.id, 'c64')
    expect(useProfileStore.getState().profiles[0].theme).toBe('c64')
  })

  it('deleteProfile は profile を削除しアクティブを差し替える', async () => {
    const a = await useProfileStore.getState().createProfile('A')
    await useProfileStore.getState().createProfile('B')
    await useProfileStore.getState().deleteProfile(a.id)
    const remaining = useProfileStore.getState().profiles
    expect(remaining).toHaveLength(1)
    expect(remaining[0].name).toBe('B')
  })

  it('applyMapping は mapping を丸ごと差し替える', async () => {
    const created = await useProfileStore.getState().createProfile('テスト')
    await useProfileStore
      .getState()
      .applyMapping(created.id, { KeyA: { kind: 'key', code: 'KeyB' } })
    expect(useProfileStore.getState().profiles[0].mapping).toEqual({
      KeyA: { kind: 'key', code: 'KeyB' }
    })
  })
})

describe('useProfileStore - 失敗系（mutate reject）', () => {
  beforeEach(() => {
    resetMutateMock()
    resetStore()
  })

  it('setAssignment 失敗時は state がロールバックされ、error toast が追加される', async () => {
    const created = await useProfileStore.getState().createProfile('テスト')
    vi.mocked(api.mutate).mockRejectedValueOnce(new Error('disk full'))
    await expect(
      useProfileStore
        .getState()
        .setAssignment(created.id, 'KeyA', { kind: 'key', code: 'KeyZ' })
    ).rejects.toThrow('disk full')
    const stored = useProfileStore.getState().profiles.find((p) => p.id === created.id)!
    expect(stored.mapping['KeyA']).toBeUndefined()
    const toasts = useUiStore.getState().toasts
    expect(toasts.some((t) => t.type === 'error')).toBe(true)
  })

  it('renameProfile 失敗時は名前がロールバックされる', async () => {
    const created = await useProfileStore.getState().createProfile('旧')
    vi.mocked(api.mutate).mockRejectedValueOnce(new Error('boom'))
    await expect(useProfileStore.getState().renameProfile(created.id, '新')).rejects.toThrow('boom')
    expect(useProfileStore.getState().profiles[0].name).toBe('旧')
  })

  it('setTheme 失敗時はテーマがロールバックされる', async () => {
    const created = await useProfileStore.getState().createProfile('テスト')
    vi.mocked(api.mutate).mockRejectedValueOnce(new Error('boom'))
    await expect(useProfileStore.getState().setTheme(created.id, 'c64')).rejects.toThrow('boom')
    expect(useProfileStore.getState().profiles[0].theme).toBe('nes')
  })

  it('deleteProfile 失敗時は profile が復元される', async () => {
    const created = await useProfileStore.getState().createProfile('テスト')
    vi.mocked(api.mutate).mockRejectedValueOnce(new Error('boom'))
    await expect(useProfileStore.getState().deleteProfile(created.id)).rejects.toThrow('boom')
    expect(useProfileStore.getState().profiles).toHaveLength(1)
  })

  it('setActive 失敗時は activeProfileId がロールバックされる', async () => {
    const a = await useProfileStore.getState().createProfile('A')
    const b = await useProfileStore.getState().createProfile('B')
    vi.mocked(api.mutate).mockRejectedValueOnce(new Error('boom'))
    await expect(useProfileStore.getState().setActive(b.id)).rejects.toThrow('boom')
    expect(useProfileStore.getState().activeProfileId).toBe(a.id)
  })

  it('applyMapping 失敗時は mapping がロールバックされる', async () => {
    const created = await useProfileStore.getState().createProfile('テスト')
    vi.mocked(api.mutate).mockRejectedValueOnce(new Error('boom'))
    await expect(
      useProfileStore
        .getState()
        .applyMapping(created.id, { KeyA: { kind: 'key', code: 'KeyB' } })
    ).rejects.toThrow('boom')
    expect(useProfileStore.getState().profiles[0].mapping).toEqual({})
  })

  it('createProfile の saveProfile 失敗時は state からも消える', async () => {
    vi.mocked(api.mutate).mockRejectedValueOnce(new Error('boom'))
    await expect(useProfileStore.getState().createProfile('落ちる')).rejects.toThrow('boom')
    expect(useProfileStore.getState().profiles).toHaveLength(0)
    expect(useProfileStore.getState().activeProfileId).toBeNull()
  })
})
