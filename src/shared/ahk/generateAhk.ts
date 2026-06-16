// Profile（キーマッププロファイル）から AutoHotkey v2 スクリプト文字列を生成する純関数。
// このアプリは OS / 実機キーボードへ直接適用しないため、生成した .ahk を
// AutoHotkey v2 で実行（＝Windows のスタートアップ登録）することで初めてリマップが効く。
// 詳細は docs/ahk-setup.md を参照。

import type { Assignment, ComboAssignment, MacroStep, Profile } from '../types'
import { MEDIA_SEND, MODIFIER_SYMBOL, toHotkey, toSend } from './codeToAhk'

export interface AhkResult {
  /** 生成された .ahk の全文。 */
  script: string
  /** 変換できずスキップした項目の警告（日本語）。UI / CLI で提示する。 */
  warnings: string[]
}

/** コメント行に入れる文字列から改行を除去（コメントの行はみ出しを防ぐ）。 */
function sanitizeComment(text: string): string {
  return text.replace(/[\r\n]+/g, ' ')
}

/** combo の修飾キー配列 → "^+" のような記号列。 */
function modifierPrefix(modifiers: ComboAssignment['modifiers']): string {
  return modifiers.map((m) => MODIFIER_SYMBOL[m]).join('')
}

/**
 * 1 つの (リマップ元 code, 割り当て) を AutoHotkey の行へ変換する。
 * 変換できない場合は null を返し、warnings に理由を push する。
 */
function buildEntry(srcCode: string, srcHk: string, a: Assignment, warnings: string[]): string | null {
  switch (a.kind) {
    case 'key': {
      const dstHk = toHotkey(a.code)
      if (!dstHk) {
        warnings.push(`「${srcCode}」の割り当て先「${a.code || '(未設定)'}」は AutoHotkey で扱えないためスキップしました`)
        return null
      }
      // native remap（押しっぱなしの連打・修飾の透過を AHK が面倒見てくれる）
      return `${srcHk}::${dstHk}`
    }
    case 'combo': {
      if (a.modifiers.length === 0) {
        // 修飾なしコンボは単キーと同じ → native remap にフォールバック
        const dstHk = toHotkey(a.code)
        if (!dstHk) {
          warnings.push(`「${srcCode}」の割り当て先「${a.code || '(未設定)'}」は AutoHotkey で扱えないためスキップしました`)
          return null
        }
        return `${srcHk}::${dstHk}`
      }
      const dstSend = toSend(a.code)
      if (!dstSend) {
        warnings.push(`「${srcCode}」のコンボ送出先「${a.code || '(未設定)'}」は AutoHotkey で扱えないためスキップしました`)
        return null
      }
      return `${srcHk}::Send "${modifierPrefix(a.modifiers)}${dstSend}"`
    }
    case 'macro': {
      const body: string[] = []
      for (const step of a.steps as MacroStep[]) {
        const send = toSend(step.code)
        if (!send) {
          warnings.push(`「${srcCode}」のマクロに未対応/空のステップ「${step.code || '(空)'}」があるためそのステップを除外しました`)
          continue
        }
        // delayMs はそのステップ送出「前」の待機（KeyA →(待つ)→ KeyB）。
        if (step.delayMs !== undefined && step.delayMs > 0) body.push(`    Sleep ${step.delayMs}`)
        body.push(`    Send "${send}"`)
      }
      if (body.length === 0) {
        warnings.push(`「${srcCode}」のマクロに有効なステップが無いためスキップしました`)
        return null
      }
      return `${srcHk}:: {\n${body.join('\n')}\n}`
    }
    case 'media': {
      const send = MEDIA_SEND[a.action]
      if (!send) {
        warnings.push(`「${srcCode}」のメディア操作「${a.action}」は AutoHotkey で扱えないためスキップしました`)
        return null
      }
      return `${srcHk}::Send "${send}"`
    }
    case 'mouse': {
      switch (a.button) {
        case 'Left':
          return `${srcHk}::Click`
        case 'Right':
          return `${srcHk}::Click "Right"`
        case 'Middle':
          return `${srcHk}::Click "Middle"`
        case 'WheelUp':
          return `${srcHk}::Send "{WheelUp}"`
        case 'WheelDown':
          return `${srcHk}::Send "{WheelDown}"`
        default:
          warnings.push(`「${srcCode}」のマウス操作を変換できませんでした`)
          return null
      }
    }
    case 'disabled':
      return `${srcHk}::return`
    default:
      return null
  }
}

/** Profile → AutoHotkey v2 スクリプト全文 + 警告。 */
export function generateAhkScript(profile: Profile): AhkResult {
  const warnings: string[] = []
  const lines: string[] = [
    '#Requires AutoHotkey v2.0',
    '#SingleInstance Force',
    `; 8BitDo Keymapper で生成 — プロファイル: ${sanitizeComment(profile.name)} (${profile.id})`,
    '; このファイルは自動生成です。編集せず、アプリから再書き出ししてください。',
    '; delayMs はステップ送出「前」の待機として Sleep に変換しています。',
    ''
  ]

  for (const [srcCode, assignment] of Object.entries(profile.mapping)) {
    const srcHk = toHotkey(srcCode)
    if (!srcHk) {
      warnings.push(`リマップ元キー「${srcCode}」は AutoHotkey で扱えないためスキップしました`)
      lines.push(`; SKIPPED（未対応のリマップ元）: ${srcCode}`)
      continue
    }
    const entry = buildEntry(srcCode, srcHk, assignment, warnings)
    if (entry) lines.push(entry)
  }

  return { script: lines.join('\n') + '\n', warnings }
}
