import { app, shell, BrowserWindow, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerStateHandlers } from './ipc/state'
import { registerIoHandlers } from './ipc/io'
import { registerMainWindow } from './notifications'

// dev 時は Vite の HMR（ws/http localhost、HMR の eval）を許容する必要がある。
// prod は self 以外を一切拒否する。
const PROD_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
const DEV_CSP =
  "default-src 'self' http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:*; style-src 'self' 'unsafe-inline' http://localhost:*; img-src 'self' data: http://localhost:*; font-src 'self' data: http://localhost:*; connect-src 'self' http://localhost:* ws://localhost:*; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"

function installCsp(): void {
  const csp = is.dev ? DEV_CSP : PROD_CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    })
  })
}

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
      // preload は ESM (.mjs) ビルドのため sandbox: true は現状非対応。
      // contextIsolation / nodeIntegration は明示して既定変更に耐える。
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
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

  installCsp()
  registerStateHandlers()
  registerIoHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
