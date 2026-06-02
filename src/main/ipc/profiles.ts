import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels'
import * as store from '../store'
import type { Profile } from '../../shared/types'

export function registerProfileHandlers(): void {
  ipcMain.handle(IPC.GET_STATE, () => store.readState())

  ipcMain.handle(IPC.SAVE_PROFILE, (_e, profile: Profile) => {
    store.saveProfile(profile)
  })

  ipcMain.handle(IPC.DELETE_PROFILE, (_e, id: string) => {
    store.deleteProfile(id)
  })

  ipcMain.handle(IPC.SET_ACTIVE, (_e, id: string | null) => {
    store.setActive(id)
  })
}
