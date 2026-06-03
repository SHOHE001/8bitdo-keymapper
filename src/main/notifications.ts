import type { BrowserWindow } from 'electron'
import { IPC } from '../shared/ipc-channels'

let mainWindow: BrowserWindow | null = null

export function registerMainWindow(win: BrowserWindow): void {
  mainWindow = win
  win.on('closed', () => {
    if (mainWindow === win) mainWindow = null
  })
}

export function notifyStoreError(message: string): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    // window が無いときは console に残すだけ（起動初期の readState 失敗等）
    console.error('[store]', message)
    return
  }
  mainWindow.webContents.send(IPC.STORE_ERROR, message)
}
