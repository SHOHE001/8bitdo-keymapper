# 8BitDo Keymapper

8BitDo Retro Mechanical Keyboard のキー割当をビジュアルに設計・共有するための Electron アプリ。
プロファイル（テーマ、キー割当、マクロ等）を作成・保存・エクスポート/インポート・共有コードで配布できる。

> **重要**: このアプリ自体は OS のキーマップを書き換えない。プロファイルのエディタである。
> 実際にキー割当を効かせる方法は 2 通り:
> 1. エクスポートした JSON を 8BitDo Ultimate Software 等に取り込み、キーボード本体に反映する
> 2. **AutoHotkey スクリプト(.ahk)に書き出し、Windows 側で OS レベルのリマップとして適用する**（実機ファームに書き込まず、PC 再起動後も自動適用したいとき）。手順は [`docs/ahk-setup.md`](docs/ahk-setup.md) を参照

## 機能

- 5 テーマ（NES / Famicom / C64 / IBM / Xbox）に対応した仮想キーボード UI
- キー割当の種類:
  - 単キー（key）
  - 修飾キー付きコンボ（combo）
  - 連続入力マクロ（macro、ステップごとに遅延指定可）
  - メディアキー（media: PlayPause / Next / Prev / VolumeUp / VolumeDown / Mute）
  - マウスボタン（mouse: Left / Right / Middle / WheelUp / WheelDown）
  - 無効化（disabled）
- プロファイルのエクスポート / インポート（JSON ファイル）
- **AutoHotkey v2 スクリプト(.ahk)への書き出し**（Windows で OS レベルのリマップとして適用 → [`docs/ahk-setup.md`](docs/ahk-setup.md)）
- 共有コード（`BKM1:...` の base64 文字列）でのコピペ共有
- 簡易プリセット（qwerty / famicom / fps）

## 開発

```sh
npm install
npm run dev        # Electron + Vite HMR で起動
npm run typecheck  # tsc --noEmit を node/web プロジェクトで実行
npm run test       # vitest run (renderer / main / shared 全部)
npm run build      # 型チェック + 本番ビルド
npm run build:win  # Windows 向けインストーラ生成
```

## データ保存場所

ユーザー状態は Electron の `app.getPath('userData')` 配下に保存される。

- Windows: `%APPDATA%/8bitdo-keymapper/app-state.json`
- macOS: `~/Library/Application Support/8bitdo-keymapper/app-state.json`
- Linux: `~/.config/8bitdo-keymapper/app-state.json`

読み込みに失敗した場合（JSON 破損・スキーマ不整合）は、元ファイルを `app-state.json.bak-<timestamp>` に退避してから空状態でフォールバックし、UI にエラーを通知する。書き込みは tmp ファイル経由の atomic rename で行うため、書き込み中のクラッシュで全消失することはない。

## アーキテクチャ

- `src/main/` — Electron main プロセス。`store.ts` で `app-state.json` を読み書きし、`ipc/state.ts` の `state:mutate` チャネルで renderer からの操作を受ける。
- `src/preload/` — `contextBridge` 経由で `window.api` に IPC を公開（`contextIsolation: true`, `nodeIntegration: false`）。
- `src/renderer/` — React + Tailwind + zustand。状態は main を真実とみなし、`api.mutate(command)` の戻り値で同期する。
- `src/shared/` — 両プロセスで共有する型・バリデータ・コマンド定義（`validation.ts`, `commands.ts`, `assignmentKinds.ts`, `prettyKeyCode.ts`）。`ahk/` はプロファイル → AutoHotkey v2 スクリプト変換の純関数（`codeToAhk.ts`, `generateAhk.ts`）。

## セキュリティ

- `webPreferences`: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: false`（preload が ESM のため。将来 ESM-sandbox サポート後に true 化検討）
- CSP は `session.webRequest.onHeadersReceived` で動的注入。本番は `default-src 'self'` のみ、開発時のみ Vite HMR 用に `'unsafe-eval'` と `localhost:*` を許容
- 外部入力（共有コード / インポート JSON）は `validateProfile` で構造を total に検証し、サイズ上限（共有コード 64KB / JSON 256KB / mapping キー 256 個 / macro ステップ 64 個）を強制

## 既知の制約

- 8BitDo 実機との直接通信（USB/Bluetooth）は未実装
- 自動アップデート機能なし
- i18n 未対応（日本語のみ）
- Windows コード署名なし（配布時は手動運用）

## ライセンス

MIT
