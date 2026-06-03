import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type { IpcApi, Profile } from '../shared/types'

const api: IpcApi = {
  getState: () => ipcRenderer.invoke(IPC.GET_STATE),
  saveProfile: (profile: Profile) => ipcRenderer.invoke(IPC.SAVE_PROFILE, profile),
  deleteProfile: (id: string) => ipcRenderer.invoke(IPC.DELETE_PROFILE, id),
  setActive: (id: string | null) => ipcRenderer.invoke(IPC.SET_ACTIVE, id),
  exportProfile: (profile: Profile) => ipcRenderer.invoke(IPC.EXPORT_PROFILE, profile),
  importProfile: () => ipcRenderer.invoke(IPC.IMPORT_PROFILE),
  onStoreError: (callback) => {
    const handler = (_e: IpcRendererEvent, message: string): void => callback(message)
    ipcRenderer.on(IPC.STORE_ERROR, handler)
    return () => ipcRenderer.removeListener(IPC.STORE_ERROR, handler)
  }
}

contextBridge.exposeInMainWorld('api', api)
