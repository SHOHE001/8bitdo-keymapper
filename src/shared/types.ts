export type ModelTheme = 'nes' | 'famicom' | 'c64' | 'ibm' | 'xbox'

export type KeyId = string

export interface KeyAssignment {
  kind: 'key'
  code: string
}
export interface ComboAssignment {
  kind: 'combo'
  modifiers: Array<'Ctrl' | 'Shift' | 'Alt' | 'Meta'>
  code: string
}
export interface MacroStep {
  code: string
  delayMs?: number
}
export interface MacroAssignment {
  kind: 'macro'
  steps: MacroStep[]
}
export interface MediaAssignment {
  kind: 'media'
  action: 'PlayPause' | 'Next' | 'Prev' | 'VolumeUp' | 'VolumeDown' | 'Mute'
}
export interface MouseAssignment {
  kind: 'mouse'
  button: 'Left' | 'Right' | 'Middle' | 'WheelUp' | 'WheelDown'
}
export interface DisabledAssignment {
  kind: 'disabled'
}

export type Assignment =
  | KeyAssignment
  | ComboAssignment
  | MacroAssignment
  | MediaAssignment
  | MouseAssignment
  | DisabledAssignment

export type KeyMapping = Record<KeyId, Assignment>

export interface Profile {
  id: string
  name: string
  theme: ModelTheme
  mapping: KeyMapping
  createdAt: string
  updatedAt: string
}

export type AppStateVersion = 1 | 2

export interface AppState {
  profiles: Profile[]
  activeProfileId: string | null
  version: AppStateVersion
}

import type { Command } from './commands'

export interface IpcApi {
  getState(): Promise<AppState>
  mutate(command: Command): Promise<AppState>
  exportProfile(profile: Profile): Promise<string | null>
  importProfile(): Promise<Profile | null>
  onStoreError(callback: (message: string) => void): () => void
}
