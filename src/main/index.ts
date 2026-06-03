import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerProfileHandlers } from './ipc/profiles'
import { registerIoHandlers } from './ipc/io'
import { registerMainWindow } from './notifications'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: '8BitDo Keymapper',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  registerMainWindow(win)
  win.on('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // dev時のみDevToolsを別ウィンドウで自動オープン（is.devでガード済み、本番ビルドには混入しない）
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.shohei.8bitdo-keymapper')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerProfileHandlers()
  registerIoHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
