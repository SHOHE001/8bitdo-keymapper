import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels'
import * as store from '../store'
import type { Command } from '../../shared/commands'
import { validateProfile } from '../../shared/validation'

function isValidIdOrNull(v: unknown): v is string | null {
  return v === null || (typeof v === 'string' && v.length > 0)
}

export function registerStateHandlers(): void {
  ipcMain.handle(IPC.GET_STATE, () => store.readState())

  ipcMain.handle(IPC.STATE_MUTATE, (_e, raw: Command) => {
    if (!raw || typeof raw !== 'object') throw new Error('Invalid command')
    switch (raw.type) {
      case 'profiles/save': {
        const profile = validateProfile(raw.profile)
        if (!profile) throw new Error('Invalid profile')
        store.saveProfile(profile)
        break
      }
      case 'profiles/delete': {
        if (typeof raw.id !== 'string' || !raw.id) throw new Error('Invalid id')
        store.deleteProfile(raw.id)
        break
      }
      case 'profiles/setActive': {
        if (!isValidIdOrNull(raw.id)) throw new Error('Invalid id')
        store.setActive(raw.id)
        break
      }
      case 'ui/setWelcomeSeen': {
        if (typeof raw.value !== 'boolean') throw new Error('Invalid value')
        store.setWelcomeSeen(raw.value)
        break
      }
      default:
        throw new Error(`Unknown command type: ${(raw as { type?: string }).type}`)
    }
    return store.readState()
  })
}
