import type { Profile } from '@shared/types'

const PREFIX = 'BKM1:'

export function encodeProfile(profile: Profile): string {
  return PREFIX + btoa(JSON.stringify(profile))
}

export function decodeProfile(code: string): Profile | null {
  try {
    const raw = code.trim()
    if (!raw.startsWith(PREFIX)) return null
    const json = JSON.parse(atob(raw.slice(PREFIX.length))) as Profile
    if (!json.id || !json.name || typeof json.mapping !== 'object') return null
    return json
  } catch {
    return null
  }
}
