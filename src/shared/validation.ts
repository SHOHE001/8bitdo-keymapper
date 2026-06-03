import type {
  AppState,
  Assignment,
  ComboAssignment,
  DisabledAssignment,
  KeyAssignment,
  KeyMapping,
  MacroAssignment,
  MacroStep,
  MediaAssignment,
  ModelTheme,
  MouseAssignment,
  Profile
} from './types'

export const MAX_SHARE_CODE_LENGTH = 65_536
export const MAX_PROFILE_JSON_BYTES = 256_000
export const MAX_MAPPING_KEYS = 256
export const MAX_MACRO_STEPS = 64

const ALLOWED_THEMES: ModelTheme[] = ['nes', 'famicom', 'c64', 'ibm', 'xbox']
const ALLOWED_MODIFIERS = new Set<ComboAssignment['modifiers'][number]>(['Ctrl', 'Shift', 'Alt', 'Meta'])
const ALLOWED_MEDIA: MediaAssignment['action'][] = ['PlayPause', 'Next', 'Prev', 'VolumeUp', 'VolumeDown', 'Mute']
const ALLOWED_MOUSE: MouseAssignment['button'][] = ['Left', 'Right', 'Middle', 'WheelUp', 'WheelDown']

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0
}

function isIsoDate(v: unknown): v is string {
  return typeof v === 'string' && ISO_DATE_RE.test(v)
}

function validateMacroStep(raw: unknown): MacroStep | null {
  if (!isObject(raw)) return null
  if (typeof raw.code !== 'string') return null
  const step: MacroStep = { code: raw.code }
  if (raw.delayMs !== undefined) {
    if (typeof raw.delayMs !== 'number' || !Number.isFinite(raw.delayMs) || raw.delayMs < 0) return null
    step.delayMs = raw.delayMs
  }
  return step
}

export function validateAssignment(raw: unknown): Assignment | null {
  if (!isObject(raw)) return null
  switch (raw.kind) {
    case 'key': {
      if (typeof raw.code !== 'string') return null
      const a: KeyAssignment = { kind: 'key', code: raw.code }
      return a
    }
    case 'combo': {
      if (typeof raw.code !== 'string') return null
      if (!Array.isArray(raw.modifiers)) return null
      const mods: ComboAssignment['modifiers'] = []
      for (const m of raw.modifiers) {
        if (typeof m !== 'string' || !ALLOWED_MODIFIERS.has(m as ComboAssignment['modifiers'][number])) return null
        mods.push(m as ComboAssignment['modifiers'][number])
      }
      const a: ComboAssignment = { kind: 'combo', modifiers: mods, code: raw.code }
      return a
    }
    case 'macro': {
      if (!Array.isArray(raw.steps)) return null
      if (raw.steps.length === 0 || raw.steps.length > MAX_MACRO_STEPS) return null
      const steps: MacroStep[] = []
      for (const s of raw.steps) {
        const step = validateMacroStep(s)
        if (!step) return null
        steps.push(step)
      }
      const a: MacroAssignment = { kind: 'macro', steps }
      return a
    }
    case 'media': {
      if (typeof raw.action !== 'string' || !ALLOWED_MEDIA.includes(raw.action as MediaAssignment['action'])) return null
      const a: MediaAssignment = { kind: 'media', action: raw.action as MediaAssignment['action'] }
      return a
    }
    case 'mouse': {
      if (typeof raw.button !== 'string' || !ALLOWED_MOUSE.includes(raw.button as MouseAssignment['button'])) return null
      const a: MouseAssignment = { kind: 'mouse', button: raw.button as MouseAssignment['button'] }
      return a
    }
    case 'disabled': {
      const a: DisabledAssignment = { kind: 'disabled' }
      return a
    }
    default:
      return null
  }
}

function validateMapping(raw: unknown): KeyMapping | null {
  if (!isObject(raw)) return null
  const keys = Object.keys(raw)
  if (keys.length > MAX_MAPPING_KEYS) return null
  const mapping: KeyMapping = {}
  for (const key of keys) {
    const assignment = validateAssignment(raw[key])
    if (!assignment) return null
    mapping[key] = assignment
  }
  return mapping
}

function isAllowedTheme(v: unknown): v is ModelTheme {
  return typeof v === 'string' && (ALLOWED_THEMES as string[]).includes(v)
}

export function validateProfile(raw: unknown): Profile | null {
  if (!isObject(raw)) return null
  if (!isNonEmptyString(raw.id)) return null
  if (!isNonEmptyString(raw.name)) return null
  if (!isAllowedTheme(raw.theme)) return null
  if (!isIsoDate(raw.createdAt)) return null
  if (!isIsoDate(raw.updatedAt)) return null
  const mapping = validateMapping(raw.mapping)
  if (!mapping) return null
  return {
    id: raw.id,
    name: raw.name,
    theme: raw.theme,
    mapping,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  }
}

export type DecodeFailureReason =
  | 'empty'
  | 'too-large'
  | 'invalid-prefix'
  | 'invalid-base64'
  | 'invalid-json'
  | 'invalid-shape'

export interface DecodeFailure {
  ok: false
  reason: DecodeFailureReason
  message: string
}

export interface DecodeSuccess {
  ok: true
  profile: Profile
}

export type DecodeResult = DecodeSuccess | DecodeFailure

export const DECODE_FAILURE_MESSAGES: Record<DecodeFailureReason, string> = {
  empty: '共有コードが空です',
  'too-large': '共有コードが大きすぎます',
  'invalid-prefix': '共有コードの形式が正しくありません',
  'invalid-base64': '共有コードを復号できませんでした',
  'invalid-json': '共有コードの中身を解析できませんでした',
  'invalid-shape': 'プロファイルの内容が不正です'
}

export function decodeFailure(reason: DecodeFailureReason): DecodeFailure {
  return { ok: false, reason, message: DECODE_FAILURE_MESSAGES[reason] }
}

// AppState の正規形は v2（最新版）のみ。v1 は migrate 経由で v2 化してから渡す前提なので、
// このバリデータは v2 形式しか受理しない。
export function validateAppState(raw: unknown): AppState | null {
  if (!isObject(raw)) return null
  if (raw.version !== 2) return null
  if (!isObject(raw.ui) || typeof raw.ui.welcomeSeen !== 'boolean') return null
  if (!Array.isArray(raw.profiles)) return null
  const profiles: Profile[] = []
  for (const p of raw.profiles) {
    const profile = validateProfile(p)
    if (!profile) return null
    profiles.push(profile)
  }
  const activeProfileId =
    raw.activeProfileId === null || typeof raw.activeProfileId === 'string'
      ? (raw.activeProfileId as string | null)
      : null
  return {
    profiles,
    activeProfileId: activeProfileId ?? null,
    version: 2,
    ui: { welcomeSeen: raw.ui.welcomeSeen }
  }
}
