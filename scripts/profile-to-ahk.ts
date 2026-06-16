// app-state.json または単一 Profile JSON から AutoHotkey v2 スクリプト(.ahk)を生成する CLI。
// GUI を起動できない環境（SSH / 自動化）でプロファイルを .ahk 化するために使う。
//
//   npx tsx scripts/profile-to-ahk.ts <input.json> [--id <profileId>] [--out <output.ahk>]
//
// - input が app-state.json の場合: activeProfileId（または --id 指定）のプロファイルを変換
// - input が単一 Profile JSON の場合: そのまま変換
// - --out 省略時は標準出力へ。警告は標準エラーへ出す。

import { readFileSync, writeFileSync } from 'node:fs'
import { generateAhkScript } from '../src/shared/ahk/generateAhk'
import { validateAppState, validateProfile } from '../src/shared/validation'
import type { Profile } from '../src/shared/types'

function fail(msg: string): never {
  process.stderr.write(`エラー: ${msg}\n`)
  process.exit(1)
}

const args = process.argv.slice(2)
if (args.length === 0) {
  fail('入力 JSON のパスを指定してください: tsx scripts/profile-to-ahk.ts <input.json> [--id <profileId>] [--out <out.ahk>]')
}

const inputPath = args[0]
let idArg: string | undefined
let outPath: string | undefined
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--id') idArg = args[++i]
  else if (args[i] === '--out') outPath = args[++i]
  else fail(`不明な引数: ${args[i]}`)
}

let raw: unknown
try {
  raw = JSON.parse(readFileSync(inputPath, 'utf-8'))
} catch {
  fail(`JSON を読み込めません: ${inputPath}`)
}

let profile: Profile | null = null
const state = validateAppState(raw)
if (state) {
  // app-state.json として解釈
  const targetId = idArg ?? state.activeProfileId
  if (!targetId) fail('app-state.json に activeProfileId が無いため、--id でプロファイルを指定してください')
  profile = state.profiles.find((p) => p.id === targetId) ?? null
  if (!profile) fail(`プロファイルが見つかりません: ${targetId}`)
} else {
  // 単一 Profile JSON として解釈
  profile = validateProfile(raw)
}
if (!profile) fail('app-state.json でも Profile JSON でもありません（構造が不正）')

const { script, warnings } = generateAhkScript(profile)
for (const w of warnings) process.stderr.write(`警告: ${w}\n`)

if (outPath) {
  writeFileSync(outPath, script, 'utf-8')
  process.stderr.write(`書き出しました: ${outPath}（プロファイル「${profile.name}」/ 警告 ${warnings.length} 件）\n`)
} else {
  process.stdout.write(script)
}
