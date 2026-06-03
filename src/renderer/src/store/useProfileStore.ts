import { create } from 'zustand'
import type { Profile, KeyId, Assignment, ModelTheme, KeyMapping } from '@shared/types'
import { api } from '../lib/ipc'
import { PRESETS } from '../data/presets'

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
    const state = await api.getState()
    set({ profiles: state.profiles, activeProfileId: state.activeProfileId, initialized: true })
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
    await api.saveProfile(profile)
    const previousActive = get().activeProfileId
    set((s) => ({
      profiles: [...s.profiles, profile],
      activeProfileId: s.activeProfileId ?? profile.id
    }))
    if (previousActive === null) {
      await api.setActive(profile.id)
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
    await api.saveProfile(updated)
    set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? updated : p)) }))
  },

  async deleteProfile(id) {
    await api.deleteProfile(id)
    set((s) => {
      const profiles = s.profiles.filter((p) => p.id !== id)
      const activeProfileId =
        s.activeProfileId === id ? (profiles[0]?.id ?? null) : s.activeProfileId
      return { profiles, activeProfileId }
    })
    await api.setActive(get().activeProfileId)
  },

  async setActive(id) {
    await api.setActive(id)
    set({ activeProfileId: id })
  },

  async setTheme(id, theme) {
    const profile = get().profiles.find((p) => p.id === id)
    if (!profile) return
    const updated = { ...profile, theme, updatedAt: now() }
    await api.saveProfile(updated)
    set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? updated : p)) }))
  },

  async setAssignment(profileId, keyId, assignment) {
    const profile = get().profiles.find((p) => p.id === profileId)
    if (!profile) return
    const updated = {
      ...profile,
      mapping: { ...profile.mapping, [keyId]: assignment },
      updatedAt: now()
    }
    await api.saveProfile(updated)
    set((s) => ({ profiles: s.profiles.map((p) => (p.id === profileId ? updated : p)) }))
  },

  async applyMapping(profileId, mapping) {
    const profile = get().profiles.find((p) => p.id === profileId)
    if (!profile) return
    const updated = { ...profile, mapping, updatedAt: now() }
    await api.saveProfile(updated)
    set((s) => ({ profiles: s.profiles.map((p) => (p.id === profileId ? updated : p)) }))
  }
}))
