import { app } from 'electron'
import { join } from 'path'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from 'fs'
import type { AppState, Profile } from '../shared/types'
import { migrate } from './migrators'
import { notifyStoreError } from './notifications'

const storePath = join(app.getPath('userData'), 'app-state.json')
const tmpPath = `${storePath}.tmp`

const DEFAULT_STATE: AppState = {
  profiles: [],
  activeProfileId: null,
  version: 1
}

function backupCorruptFile(): string | null {
  if (!existsSync(storePath)) return null
  const backupPath = `${storePath}.bak-${Date.now()}`
  try {
    copyFileSync(storePath, backupPath)
    return backupPath
  } catch {
    return null
  }
}

export function readState(): AppState {
  if (!existsSync(storePath)) return structuredClone(DEFAULT_STATE)
  let raw: string
  try {
    raw = readFileSync(storePath, 'utf-8')
  } catch (err) {
    notifyStoreError(`設定ファイルの読み込みに失敗しました: ${(err as Error).message}`)
    return structuredClone(DEFAULT_STATE)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    const backup = backupCorruptFile()
    notifyStoreError(
      backup
        ? `設定ファイルが壊れていたため ${backup} に退避しました`
        : '設定ファイルが壊れていました'
    )
    return structuredClone(DEFAULT_STATE)
  }
  const result = migrate(parsed)
  if (!result.ok) {
    const backup = backupCorruptFile()
    notifyStoreError(
      backup
        ? `設定ファイルの形式を解釈できなかったため ${backup} に退避しました`
        : '設定ファイルの形式を解釈できませんでした'
    )
    return structuredClone(DEFAULT_STATE)
  }
  return result.state
}

export function writeState(state: AppState): void {
  mkdirSync(join(storePath, '..'), { recursive: true })
  writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8')
  try {
    renameSync(tmpPath, storePath)
  } catch (err) {
    // rename 失敗時は tmp を消して整合を保つ
    try {
      unlinkSync(tmpPath)
    } catch {
      /* ignore */
    }
    throw err
  }
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
