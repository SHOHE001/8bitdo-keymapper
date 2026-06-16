import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type { Command } from '../shared/commands'
import type { IpcApi, Profile } from '../shared/types'

const api: IpcApi = {
  getState: () => ipcRenderer.invoke(IPC.GET_STATE),
  mutate: (command: Command) => ipcRenderer.invoke(IPC.STATE_MUTATE, command),
  exportProfile: (profile: Profile) => ipcRenderer.invoke(IPC.EXPORT_PROFILE, profile),
  exportProfileAhk: (profile: Profile) => ipcRenderer.invoke(IPC.EXPORT_AHK, profile),
  importProfile: () => ipcRenderer.invoke(IPC.IMPORT_PROFILE),
  onStoreError: (callback) => {
    const handler = (_e: IpcRendererEvent, message: string): void => callback(message)
    ipcRenderer.on(IPC.STORE_ERROR, handler)
    return () => ipcRenderer.removeListener(IPC.STORE_ERROR, handler)
  }
}

contextBridge.exposeInMainWorld('api', api)
