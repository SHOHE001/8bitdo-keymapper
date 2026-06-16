import { ipcMain, dialog } from 'electron'
import { readFileSync, statSync, writeFileSync } from 'fs'
import { IPC } from '../../shared/ipc-channels'
import type { Profile } from '../../shared/types'
import { validateProfile } from '../../shared/validation'
import { generateAhkScript } from '../../shared/ahk/generateAhk'
import { parseImportedProfile } from './io-internals'

export function registerIoHandlers(): void {
  ipcMain.handle(IPC.EXPORT_PROFILE, async (_e, profile: Profile) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'プロファイルを保存',
      defaultPath: `${profile.name}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (!filePath) return null
    writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf-8')
    return filePath
  })

  ipcMain.handle(IPC.EXPORT_AHK, async (_e, profile: Profile) => {
    // renderer から渡る profile を main 側でも検証してから生成する（既存 state ハンドラと同じ防御方針）。
    const valid = validateProfile(profile)
    if (!valid) return null
    const { filePath } = await dialog.showSaveDialog({
      title: 'AutoHotkey スクリプトに書き出し',
      defaultPath: `${valid.name}.ahk`,
      filters: [{ name: 'AutoHotkey', extensions: ['ahk'] }]
    })
    if (!filePath) return null
    const { script, warnings } = generateAhkScript(valid)
    writeFileSync(filePath, script, 'utf-8')
    return { path: filePath, warnings }
  })

  ipcMain.handle(IPC.IMPORT_PROFILE, async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'プロファイルを読み込む',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (filePaths.length === 0) return null

    const path = filePaths[0]
    let byteSize: number
    try {
      byteSize = statSync(path).size
    } catch {
      return null
    }
    let text: string
    try {
      text = readFileSync(path, 'utf-8')
    } catch {
      return null
    }
    const result = parseImportedProfile(text, byteSize)
    return result.ok ? result.profile : null
  })
}
