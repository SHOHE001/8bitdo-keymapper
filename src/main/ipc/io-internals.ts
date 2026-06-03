import { MAX_PROFILE_JSON_BYTES, validateProfile } from '../../shared/validation'
import type { Profile } from '../../shared/types'

export type ParseImportFailure =
  | { ok: false; reason: 'too-large' }
  | { ok: false; reason: 'invalid-json' }
  | { ok: false; reason: 'invalid-shape' }

export type ParseImportResult = { ok: true; profile: Profile } | ParseImportFailure

export function parseImportedProfile(text: string, byteSize: number): ParseImportResult {
  if (byteSize > MAX_PROFILE_JSON_BYTES) return { ok: false, reason: 'too-large' }
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'invalid-json' }
  }
  const profile = validateProfile(parsed)
  if (!profile) return { ok: false, reason: 'invalid-shape' }
  return { ok: true, profile }
}
