import { api } from './ipc'
import { withErrorToast, type Toaster } from './storeErrors'
import { toastMessages } from './toastMessages'

// useUiStore を IPC レイヤから疎結合に保つための薄いラッパ。
// useUiStore から直接 useProfileStore を import すると循環参照になるため、別ファイルに切り出す。
export async function persistWelcomeSeen(toaster: Toaster, value: boolean): Promise<void> {
  await withErrorToast(toaster, toastMessages.saveProfileFailed(), () =>
    api.mutate({ type: 'ui/setWelcomeSeen', value })
  )
}
