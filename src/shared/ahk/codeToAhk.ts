// DOM の `KeyboardEvent.code`（KeyA / Digit1 / ArrowLeft / ControlLeft 等。layout.ts の KEY_DEFS.id と同じ体系）
// を AutoHotkey v2 のキー指定へ変換するための純データ + lookup。
// Node / ブラウザ / Electron いずれの API にも依存しない（テキスト変換のみ）。
//
// 各エントリは 2 つの表現を持つ:
//   hk   … ホットキー左辺、および key リマップの右辺（native remap `src::dst`）で使う「素のキー名」
//   send … `Send "..."` の中に置く表現（名前付きキーは波括弧で囲む / 文字キーは素の文字）
//
// 左右で挙動が変わる修飾キーは LCtrl / RCtrl 等で厳密化する。
// パーサ上の曖昧さがあるキー（Backquote は AHK のエスケープ文字 ` 、Semicolon は行頭でコメント扱い）は
// スキャンコード（SC029 / SC027）で左辺指定し、送出側は vk / 文字で表す。

interface AhkKey {
  hk: string
  send: string
}

const TABLE: Record<string, AhkKey> = {}

// --- 英字 KeyA..KeyZ ---
for (let i = 0; i < 26; i++) {
  const upper = String.fromCharCode(65 + i) // A..Z
  const lower = upper.toLowerCase()
  TABLE[`Key${upper}`] = { hk: lower, send: lower }
}

// --- 数字 Digit0..Digit9 ---
for (let n = 0; n <= 9; n++) {
  TABLE[`Digit${n}`] = { hk: `${n}`, send: `${n}` }
}

// --- ファンクション F1..F12 ---
for (let n = 1; n <= 12; n++) {
  TABLE[`F${n}`] = { hk: `F${n}`, send: `{F${n}}` }
}

// --- 名前付きキー ---
const NAMED: Record<string, AhkKey> = {
  Escape: { hk: 'Escape', send: '{Escape}' },
  Tab: { hk: 'Tab', send: '{Tab}' },
  Space: { hk: 'Space', send: '{Space}' },
  Enter: { hk: 'Enter', send: '{Enter}' },
  Backspace: { hk: 'Backspace', send: '{Backspace}' },
  CapsLock: { hk: 'CapsLock', send: '{CapsLock}' },

  ShiftLeft: { hk: 'LShift', send: '{LShift}' },
  ShiftRight: { hk: 'RShift', send: '{RShift}' },
  ControlLeft: { hk: 'LCtrl', send: '{LCtrl}' },
  ControlRight: { hk: 'RCtrl', send: '{RCtrl}' },
  AltLeft: { hk: 'LAlt', send: '{LAlt}' },
  AltRight: { hk: 'RAlt', send: '{RAlt}' },
  MetaLeft: { hk: 'LWin', send: '{LWin}' },
  MetaRight: { hk: 'RWin', send: '{RWin}' },
  ContextMenu: { hk: 'AppsKey', send: '{AppsKey}' },

  ArrowUp: { hk: 'Up', send: '{Up}' },
  ArrowDown: { hk: 'Down', send: '{Down}' },
  ArrowLeft: { hk: 'Left', send: '{Left}' },
  ArrowRight: { hk: 'Right', send: '{Right}' },

  Insert: { hk: 'Insert', send: '{Insert}' },
  Delete: { hk: 'Delete', send: '{Delete}' },
  Home: { hk: 'Home', send: '{Home}' },
  End: { hk: 'End', send: '{End}' },
  PageUp: { hk: 'PgUp', send: '{PgUp}' },
  PageDown: { hk: 'PgDn', send: '{PgDn}' },

  PrintScreen: { hk: 'PrintScreen', send: '{PrintScreen}' },
  ScrollLock: { hk: 'ScrollLock', send: '{ScrollLock}' },
  Pause: { hk: 'Pause', send: '{Pause}' },

  // 記号（US 配列前提）。送出側は二重引用符の中に置くため素の文字で安全。
  // Backquote: ` は AHK のエスケープ文字なので左辺は SC029、送出は vkC0 で表す。
  Backquote: { hk: 'SC029', send: '{vkC0}' },
  Minus: { hk: '-', send: '-' },
  Equal: { hk: '=', send: '=' },
  BracketLeft: { hk: '[', send: '[' },
  BracketRight: { hk: ']', send: ']' },
  Backslash: { hk: '\\', send: '\\' },
  // Semicolon: 行頭の ; はコメント扱いになるため左辺は SC027 を使う。
  Semicolon: { hk: 'SC027', send: ';' },
  Quote: { hk: "'", send: "'" },
  Comma: { hk: ',', send: ',' },
  Period: { hk: '.', send: '.' },
  Slash: { hk: '/', send: '/' }
}

Object.assign(TABLE, NAMED)

/** ホットキー左辺 / key リマップ右辺で使う素のキー名。未対応 code は null。 */
export function toHotkey(code: string): string | null {
  return TABLE[code]?.hk ?? null
}

/** `Send "..."` の中に置く表現。未対応 code は null。 */
export function toSend(code: string): string | null {
  return TABLE[code]?.send ?? null
}

/** combo の修飾キー → AutoHotkey の Send 修飾記号。 */
export const MODIFIER_SYMBOL: Record<'Ctrl' | 'Shift' | 'Alt' | 'Meta', string> = {
  Ctrl: '^',
  Shift: '+',
  Alt: '!',
  Meta: '#'
}

/** media action → Send に置くキー名。 */
export const MEDIA_SEND: Record<string, string> = {
  PlayPause: '{Media_Play_Pause}',
  Next: '{Media_Next}',
  Prev: '{Media_Prev}',
  VolumeUp: '{Volume_Up}',
  VolumeDown: '{Volume_Down}',
  Mute: '{Volume_Mute}'
}
