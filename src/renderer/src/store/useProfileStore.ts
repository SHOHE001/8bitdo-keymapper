import { create } from 'zustand'
import type { Profile, KeyId, Assignment, ModelTheme, KeyMapping } from '@shared/types'
import { api } from '../lib/ipc'
import { PRESETS } from '../data/presets'
import { useUiStore } from './useUiStore'
import { withErrorToast } from '../lib/storeErrors'
import { toastMessages } from '../lib/toastMessages'

export const DEFAULT_SAMPLE_NAME = 'マイプロファイル'

interface ProfileStore {
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

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  initialized: false,

  async init() {
    api.onStoreError((message) => {
      useUiStore.getState().addToast(message, 'error')
    })
    try {
      const state = await api.getState()
      set({ profiles: state.profiles, activeProfileId: state.activeProfileId, initialized: true })
    } catch (err) {
      useUiStore.getState().addToast(toastMessages.stateLoadFailed(), 'error')
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
    const prevProfiles = get().profiles
    set((s) => ({
      profiles: [...s.profiles, profile],
      activeProfileId: s.activeProfileId ?? profile.id
    }))
    try {
      await withErrorToast(toastMessages.saveProfileFailed(), () => api.saveProfile(profile))
      if (previousActive === null) {
        await withErrorToast(toastMessages.setActiveFailed(), () => api.setActive(profile.id))
      }
    } catch (err) {
      set({ profiles: prevProfiles, activeProfileId: previousActive })
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
    const prev = get().profiles
    set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? updated : p)) }))
    try {
      await withErrorToast(toastMessages.saveProfileFailed(), () => api.saveProfile(updated))
    } catch (err) {
      set({ profiles: prev })
      throw err
    }
  },

  async deleteProfile(id) {
    const prevProfiles = get().profiles
    const prevActive = get().activeProfileId
    const nextProfiles = prevProfiles.filter((p) => p.id !== id)
    const nextActive = prevActive === id ? (nextProfiles[0]?.id ?? null) : prevActive
    set({ profiles: nextProfiles, activeProfileId: nextActive })
    try {
      await withErrorToast(toastMessages.deleteProfileFailed(), () => api.deleteProfile(id))
      if (prevActive === id) {
        await withErrorToast(toastMessages.setActiveFailed(), () => api.setActive(nextActive))
      }
    } catch (err) {
      set({ profiles: prevProfiles, activeProfileId: prevActive })
      throw err
    }
  },

  async setActive(id) {
    const prev = get().activeProfileId
    set({ activeProfileId: id })
    try {
      await withErrorToast(toastMessages.setActiveFailed(), () => api.setActive(id))
    } catch (err) {
      set({ activeProfileId: prev })
      throw err
    }
  },

  async setTheme(id, theme) {
    const profile = get().profiles.find((p) => p.id === id)
    if (!profile) return
    const updated = { ...profile, theme, updatedAt: now() }
    const prev = get().profiles
    set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? updated : p)) }))
    try {
      await withErrorToast(toastMessages.saveProfileFailed(), () => api.saveProfile(updated))
    } catch (err) {
      set({ profiles: prev })
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
    const prev = get().profiles
    set((s) => ({ profiles: s.profiles.map((p) => (p.id === profileId ? updated : p)) }))
    try {
      await withErrorToast(toastMessages.saveProfileFailed(), () => api.saveProfile(updated))
    } catch (err) {
      set({ profiles: prev })
      throw err
    }
  },

  async applyMapping(profileId, mapping) {
    const profile = get().profiles.find((p) => p.id === profileId)
    if (!profile) return
    const updated = { ...profile, mapping, updatedAt: now() }
    const prev = get().profiles
    set((s) => ({ profiles: s.profiles.map((p) => (p.id === profileId ? updated : p)) }))
    try {
      await withErrorToast(toastMessages.saveProfileFailed(), () => api.saveProfile(updated))
    } catch (err) {
      set({ profiles: prev })
      throw err
    }
  }
}))
