import { describe, expect, it, vi } from 'vitest'
import { createProfileStore } from '../src/store/useProfileStore'
import type { AppState, IpcApi } from '../../shared/types'

function makeApi(): IpcApi {
  let state: AppState = {
    profiles: [],
    activeProfileId: null,
    version: 2,
    ui: { welcomeSeen: false }
  }
  return {
    getState: vi.fn(async () => state),
    mutate: vi.fn(async (command): Promise<AppState> => {
      switch (command.type) {
        case 'profiles/save': {
          const idx = state.profiles.findIndex((p) => p.id === command.profile.id)
          const profiles =
            idx >= 0
              ? state.profiles.map((p) => (p.id === command.profile.id ? command.profile : p))
              : [...state.profiles, command.profile]
          state = { ...state, profiles }
          return state
        }
        case 'profiles/delete':
          state = { ...state, profiles: state.profiles.filter((p) => p.id !== command.id) }
          return state
        case 'profiles/setActive':
          state = { ...state, activeProfileId: command.id }
          return state
        case 'ui/setWelcomeSeen':
          state = { ...state, ui: { ...state.ui, welcomeSeen: command.value } }
          return state
        default:
          return state
      }
    }),
    exportProfile: vi.fn(async () => null),
    importProfile: vi.fn(async () => null),
    onStoreError: vi.fn(() => () => {})
  }
}

describe('createProfileStore (DI)', () => {
  it('uses the injected api for mutate', async () => {
    const api = makeApi()
    const toaster = vi.fn()
    const store = createProfileStore({ api, toaster })
    await store.getState().createProfile('テスト')
    expect(api.mutate).toHaveBeenCalled()
    expect(store.getState().profiles).toHaveLength(1)
  })

  it('routes mutation failures to the injected toaster, not the global store', async () => {
    const api = makeApi()
    vi.mocked(api.mutate).mockRejectedValueOnce(new Error('boom'))
    const toaster = vi.fn()
    const store = createProfileStore({ api, toaster })
    await expect(store.getState().createProfile('落ちる')).rejects.toThrow('boom')
    expect(toaster).toHaveBeenCalledWith(expect.any(String), 'error')
    expect(store.getState().profiles).toHaveLength(0)
  })

  it('init subscribes onStoreError via the injected api and forwards messages to toaster', async () => {
    const api = makeApi()
    const captured: { cb: ((m: string) => void) | null } = { cb: null }
    vi.mocked(api.onStoreError).mockImplementationOnce((cb) => {
      captured.cb = cb
      return () => {}
    })
    const toaster = vi.fn()
    const store = createProfileStore({ api, toaster })
    await store.getState().init()
    expect(captured.cb).toBeTypeOf('function')
    captured.cb?.('disk full')
    expect(toaster).toHaveBeenCalledWith('disk full', 'error')
  })
})
