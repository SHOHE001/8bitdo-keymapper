import type { AppState } from '../shared/types'
import { validateAppState } from '../shared/validation'

type Migrator = (state: unknown) => unknown

// 各キーは「version N → N+1」への変換。
// 例: 1: (v1) => v2 は v1 を読み込んだとき v2 形式に持ち上げる。
const migrators: Record<number, Migrator> = {
  1: (state) => {
    const s = (state ?? {}) as Record<string, unknown>
    return {
      ...s,
      version: 2,
      ui: { welcomeSeen: false }
    }
  }
}

function readVersion(raw: unknown): number | null {
  if (typeof raw !== 'object' || raw === null) return null
  const v = (raw as { version?: unknown }).version
  return typeof v === 'number' ? v : null
}

const LATEST_VERSION = 2

export interface MigrateSuccess {
  ok: true
  state: AppState
}
export interface MigrateFailure {
  ok: false
  reason: 'unknown-version' | 'migration-failed' | 'invalid-shape'
}
export type MigrateResult = MigrateSuccess | MigrateFailure

export function migrate(raw: unknown): MigrateResult {
  const version = readVersion(raw)
  if (version === null) return { ok: false, reason: 'invalid-shape' }
  if (version > LATEST_VERSION) return { ok: false, reason: 'unknown-version' }

  let current: unknown = raw
  for (let v = version; v < LATEST_VERSION; v++) {
    const m = migrators[v]
    if (!m) return { ok: false, reason: 'migration-failed' }
    try {
      current = m(current)
    } catch {
      return { ok: false, reason: 'migration-failed' }
    }
  }
  const state = validateAppState(current)
  if (!state) return { ok: false, reason: 'invalid-shape' }
  return { ok: true, state }
}
