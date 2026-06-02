import { ipcMain, dialog } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { IPC } from '../../shared/ipc-channels'
import type { Profile } from '../../shared/types'

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

  ipcMain.handle(IPC.IMPORT_PROFILE, async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'プロファイルを読み込む',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (filePaths.length === 0) return null
    try {
      const raw = JSON.parse(readFileSync(filePaths[0], 'utf-8')) as Profile
      if (!raw.id || !raw.name || !raw.mapping) return null
      return raw
    } catch {
      return null
    }
  })
}
