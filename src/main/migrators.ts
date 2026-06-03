import type { AppState } from '../shared/types'

type Migrator = (state: unknown) => unknown

// version N → N+1 への変換を順に並べる。フェーズ10で v1→v2 の実体を入れる。
const migrators: Record<number, Migrator> = {}

function readVersion(raw: unknown): number | null {
  if (typeof raw !== 'object' || raw === null) return null
  const v = (raw as { version?: unknown }).version
  return typeof v === 'number' ? v : null
}

const LATEST_VERSION = 1

export interface MigrateSuccess {
  ok: true
  state: AppState
}
export interface MigrateFailure {
  ok: false
  reason: 'unknown-version' | 'migration-failed' | 'invalid-shape'
}
export type MigrateResult = MigrateSuccess | MigrateFailure

import { validateAppState } from '../shared/validation'

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
