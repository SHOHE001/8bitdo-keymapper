export type BuiltinTheme = 'nes' | 'famicom' | 'c64' | 'ibm' | 'xbox'
// 将来テーマ追加（ユーザー定義等）に向けた拡張ポイント。型は string 全体に開きつつ、
// 既知のビルトイン名はリテラル型として補完候補に出る形（"string & {}" イディオム）。
// runtime 上では validateProfile が現状ビルトイン whitelist でのみ受理する。
export type ModelTheme = BuiltinTheme | (string & {})

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

// AppState は常に「最新版に正規化された状態」を表す。
// version フィールドは「永続ファイルが何バージョンだったか」のメタ情報として保持し、
// 旧バージョンを読み込んだ場合は migrate 経由で必ず最新版（v2）の形にしてから渡す。
export interface AppState {
  profiles: Profile[]
  activeProfileId: string | null
  version: AppStateVersion
  ui: AppUiState
}

export interface AppUiState {
  welcomeSeen: boolean
}

import type { Command } from './commands'

/** AutoHotkey 書き出しの結果。warnings は変換できずスキップした項目の説明（日本語）。 */
export interface AhkExportResult {
  path: string
  warnings: string[]
}

export interface IpcApi {
  getState(): Promise<AppState>
  mutate(command: Command): Promise<AppState>
  exportProfile(profile: Profile): Promise<string | null>
  exportProfileAhk(profile: Profile): Promise<AhkExportResult | null>
  importProfile(): Promise<Profile | null>
  onStoreError(callback: (message: string) => void): () => void
}
