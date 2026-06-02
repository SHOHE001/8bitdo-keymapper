import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import type { AppState, Profile } from '../shared/types'

const storePath = join(app.getPath('userData'), 'app-state.json')

const DEFAULT_STATE: AppState = {
  profiles: [],
  activeProfileId: null,
  version: 1
}

export function readState(): AppState {
  try {
    if (existsSync(storePath)) {
      const raw = JSON.parse(readFileSync(storePath, 'utf-8')) as AppState
      if (raw.version === 1) return raw
    }
  } catch {
    // fall through to default
  }
  return structuredClone(DEFAULT_STATE)
}

export function writeState(state: AppState): void {
  mkdirSync(join(storePath, '..'), { recursive: true })
  writeFileSync(storePath, JSON.stringify(state, null, 2), 'utf-8')
}

export function saveProfile(profile: Profile): void {
  const state = readState()
  const idx = state.profiles.findIndex((p) => p.id === profile.id)
  if (idx >= 0) {
    state.profiles[idx] = profile
  } else {
    state.profiles.push(profile)
  }
  writeState(state)
}

export function deleteProfile(id: string): void {
  const state = readState()
  state.profiles = state.profiles.filter((p) => p.id !== id)
  if (state.activeProfileId === id) {
    state.activeProfileId = state.profiles[0]?.id ?? null
  }
  writeState(state)
}

export function setActive(id: string | null): void {
  const state = readState()
  state.activeProfileId = id
  writeState(state)
}
