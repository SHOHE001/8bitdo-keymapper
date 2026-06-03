import type { Profile } from '@shared/types'
import {
  decodeFailure,
  MAX_SHARE_CODE_LENGTH,
  validateProfile,
  type DecodeResult
} from '@shared/validation'

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

export function decodeProfile(code: string): DecodeResult {
  const raw = code.trim()
  if (!raw) return decodeFailure('empty')
  if (raw.length > MAX_SHARE_CODE_LENGTH) return decodeFailure('too-large')
  if (!raw.startsWith(PREFIX)) return decodeFailure('invalid-prefix')

  let jsonText: string
  try {
    jsonText = base64ToUtf8(raw.slice(PREFIX.length))
  } catch {
    return decodeFailure('invalid-base64')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return decodeFailure('invalid-json')
  }

  const profile = validateProfile(parsed)
  if (!profile) return decodeFailure('invalid-shape')
  return { ok: true, profile }
}
