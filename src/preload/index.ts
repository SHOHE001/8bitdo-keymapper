import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type { IpcApi, Profile } from '../shared/types'

const api: IpcApi = {
  getState: () => ipcRenderer.invoke(IPC.GET_STATE),
  saveProfile: (profile: Profile) => ipcRenderer.invoke(IPC.SAVE_PROFILE, profile),
  deleteProfile: (id: string) => ipcRenderer.invoke(IPC.DELETE_PROFILE, id),
  setActive: (id: string | null) => ipcRenderer.invoke(IPC.SET_ACTIVE, id),
  exportProfile: (profile: Profile) => ipcRenderer.invoke(IPC.EXPORT_PROFILE, profile),
  importProfile: () => ipcRenderer.invoke(IPC.IMPORT_PROFILE)
}

contextBridge.exposeInMainWorld('api', api)
