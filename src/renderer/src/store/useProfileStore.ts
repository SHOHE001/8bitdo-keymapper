import { create } from 'zustand'
import type { Profile, KeyId, Assignment, ModelTheme } from '@shared/types'
import { api } from '../lib/ipc'

interface ProfileStore {
  profiles: Profile[]
  activeProfileId: string | null
  initialized: boolean

  init(): Promise<void>
  activeProfile(): Profile | null
  createProfile(name: string): Promise<void>
  renameProfile(id: string, name: string): Promise<void>
  deleteProfile(id: string): Promise<void>
  setActive(id: string): Promise<void>
  setTheme(id: string, theme: ModelTheme): Promise<void>
  setAssignment(profileId: string, keyId: KeyId, assignment: Assignment): Promise<void>
  applyMapping(profileId: string, mapping: Profile['mapping']): Promise<void>
}

function makeId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
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
    set((s) => ({
      profiles: [...s.profiles, profile],
      activeProfileId: s.activeProfileId ?? profile.id
    }))
    if (get().activeProfileId === profile.id) {
      await api.setActive(profile.id)
    }
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
