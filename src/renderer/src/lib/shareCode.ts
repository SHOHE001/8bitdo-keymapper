import type { Profile } from '@shared/types'

const PREFIX = 'BKM1:'

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function encodeProfile(profile: Profile): string {
  return PREFIX + utf8ToBase64(JSON.stringify(profile))
}

export function decodeProfile(code: string): Profile | null {
  try {
    const raw = code.trim()
    if (!raw.startsWith(PREFIX)) return null
    const json = JSON.parse(base64ToUtf8(raw.slice(PREFIX.length))) as Profile
    if (!json.id || !json.name || typeof json.mapping !== 'object') return null
    return json
  } catch {
    return null
  }
}
