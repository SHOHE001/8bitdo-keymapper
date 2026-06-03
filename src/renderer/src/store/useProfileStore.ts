import { create } from 'zustand'
import type { Profile, KeyId, Assignment, ModelTheme, KeyMapping, AppState, IpcApi } from '@shared/types'
import type { Command } from '@shared/commands'
import { api as realApi } from '../lib/ipc'
import { PRESETS } from '../data/presets'
import { useUiStore } from './useUiStore'
import { withErrorToast, type Toaster } from '../lib/storeErrors'
import { toastMessages } from '../lib/toastMessages'

export const DEFAULT_SAMPLE_NAME = 'マイプロファイル'

export interface ProfileStore {
  profiles: Profile[]
  activeProfileId: string | null
  initialized: boolean

  init(): Promise<void>
  activeProfile(): Profile | null
  createProfile(name: string): Promise<Profile>
  createSampleProfile(opts?: { presetId?: string; baseName?: string }): Promise<Profile>
  renameProfile(id: string, name: string): Promise<void>
  deleteProfile(id: string): Promise<void>
  setActive(id: string): Promise<void>
  setTheme(id: string, theme: ModelTheme): Promise<void>
  setAssignment(profileId: string, keyId: KeyId, assignment: Assignment): Promise<void>
  applyMapping(profileId: string, mapping: KeyMapping): Promise<void>
}

export interface ProfileStoreDeps {
  api: IpcApi
  toaster: Toaster
}

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

function uniqueProfileName(existing: Profile[], baseName: string): string {
  if (!existing.some((p) => p.name === baseName)) return baseName
  let n = 2
  while (existing.some((p) => p.name === `${baseName} ${n}`)) n += 1
  return `${baseName} ${n}`
}

// テスト可能性のためファクトリ関数として export。
// 本番では既定の deps を束ねた useProfileStore を使う。
export function createProfileStore(deps: ProfileStoreDeps) {
  const { api, toaster } = deps

  function syncFromState(set: (s: Partial<ProfileStore>) => void, state: AppState): void {
    set({ profiles: state.profiles, activeProfileId: state.activeProfileId })
  }

  async function runCommand(message: string, command: Command): Promise<AppState> {
    return withErrorToast(toaster, message, () => api.mutate(command))
  }

  return create<ProfileStore>((set, get) => ({
    profiles: [],
    activeProfileId: null,
    initialized: false,

    async init() {
      api.onStoreError((message) => {
        toaster(message, 'error')
      })
      try {
        const state = await api.getState()
        set({ profiles: state.profiles, activeProfileId: state.activeProfileId, initialized: true })
        useUiStore.setState({ welcomeSeen: state.ui.welcomeSeen })
      } catch (err) {
        toaster(toastMessages.stateLoadFailed(), 'error')
        set({ initialized: true })
        throw err
      }
    },

    activeProfile() {
      const { profiles, activeProfileId } = get()
      return profiles.find((p) => p.id === activeProfileId) ?? profiles[0] ?? null
    },

    async createProfile(name) {
      const profile: Profile = {
        id: makeId(),
        name,
        theme: 'nes',
        mapping: {},
        createdAt: now(),
        updatedAt: now()
      }
      const previousActive = get().activeProfileId
      const prev = { profiles: get().profiles, activeProfileId: get().activeProfileId }
      set({ profiles: [...prev.profiles, profile], activeProfileId: prev.activeProfileId ?? profile.id })
      try {
        let newState = await runCommand(toastMessages.saveProfileFailed(), {
          type: 'profiles/save',
          profile
        })
        if (previousActive === null) {
          newState = await runCommand(toastMessages.setActiveFailed(), {
            type: 'profiles/setActive',
            id: profile.id
          })
        }
        syncFromState(set, newState)
      } catch (err) {
        set(prev)
        throw err
      }
      return profile
    },

    async createSampleProfile(opts) {
      const baseName = opts?.baseName ?? DEFAULT_SAMPLE_NAME
      const name = uniqueProfileName(get().profiles, baseName)
      const created = await get().createProfile(name)
      if (opts?.presetId) {
        const preset = PRESETS.find((p) => p.id === opts.presetId)
        if (preset && Object.keys(preset.mapping).length > 0) {
          await get().applyMapping(created.id, preset.mapping)
          return { ...created, mapping: preset.mapping }
        }
      }
      return created
    },

    async renameProfile(id, name) {
      const profile = get().profiles.find((p) => p.id === id)
      if (!profile) return
      const updated = { ...profile, name, updatedAt: now() }
      const prev = { profiles: get().profiles, activeProfileId: get().activeProfileId }
      set({ profiles: prev.profiles.map((p) => (p.id === id ? updated : p)) })
      try {
        const newState = await runCommand(toastMessages.saveProfileFailed(), {
          type: 'profiles/save',
          profile: updated
        })
        syncFromState(set, newState)
      } catch (err) {
        set(prev)
        throw err
      }
    },

    async deleteProfile(id) {
      const prev = { profiles: get().profiles, activeProfileId: get().activeProfileId }
      const nextProfiles = prev.profiles.filter((p) => p.id !== id)
      const nextActive =
        prev.activeProfileId === id ? (nextProfiles[0]?.id ?? null) : prev.activeProfileId
      set({ profiles: nextProfiles, activeProfileId: nextActive })
      try {
        const newState = await runCommand(toastMessages.deleteProfileFailed(), {
          type: 'profiles/delete',
          id
        })
        syncFromState(set, newState)
      } catch (err) {
        set(prev)
        throw err
      }
    },

    async setActive(id) {
      const prev = { activeProfileId: get().activeProfileId }
      set({ activeProfileId: id })
      try {
        const newState = await runCommand(toastMessages.setActiveFailed(), {
          type: 'profiles/setActive',
          id
        })
        syncFromState(set, newState)
      } catch (err) {
        set(prev)
        throw err
      }
    },

    async setTheme(id, theme) {
      const profile = get().profiles.find((p) => p.id === id)
      if (!profile) return
      const updated = { ...profile, theme, updatedAt: now() }
      const prev = { profiles: get().profiles, activeProfileId: get().activeProfileId }
      set({ profiles: prev.profiles.map((p) => (p.id === id ? updated : p)) })
      try {
        const newState = await runCommand(toastMessages.saveProfileFailed(), {
          type: 'profiles/save',
          profile: updated
        })
        syncFromState(set, newState)
      } catch (err) {
        set(prev)
        throw err
      }
    },

    async setAssignment(profileId, keyId, assignment) {
      const profile = get().profiles.find((p) => p.id === profileId)
      if (!profile) return
      const updated = {
        ...profile,
        mapping: { ...profile.mapping, [keyId]: assignment },
        updatedAt: now()
      }
      const prev = { profiles: get().profiles, activeProfileId: get().activeProfileId }
      set({ profiles: prev.profiles.map((p) => (p.id === profileId ? updated : p)) })
      try {
        const newState = await runCommand(toastMessages.saveProfileFailed(), {
          type: 'profiles/save',
          profile: updated
        })
        syncFromState(set, newState)
      } catch (err) {
        set(prev)
        throw err
      }
    },

    async applyMapping(profileId, mapping) {
      const profile = get().profiles.find((p) => p.id === profileId)
      if (!profile) return
      const updated = { ...profile, mapping, updatedAt: now() }
      const prev = { profiles: get().profiles, activeProfileId: get().activeProfileId }
      set({ profiles: prev.profiles.map((p) => (p.id === profileId ? updated : p)) })
      try {
        const newState = await runCommand(toastMessages.saveProfileFailed(), {
          type: 'profiles/save',
          profile: updated
        })
        syncFromState(set, newState)
      } catch (err) {
        set(prev)
        throw err
      }
    }
  }))
}

export const useProfileStore = createProfileStore({
  api: realApi,
  toaster: (message, type) => useUiStore.getState().addToast(message, type)
})
