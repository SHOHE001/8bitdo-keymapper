import type { ToastType } from '../store/useUiStore'

export type Toaster = (message: string, type?: ToastType) => void

// store の mutation で IPC reject を捕まえた時の共通ヘルパ。
// rollback は呼び出し側が握っているので、ここでは toast 通知と再 throw だけを担う。
// toaster を引数で受けることで、Store ごとに別の通知先（テスト用 fake 等）を差し込める。
export async function withErrorToast<T>(
  toaster: Toaster,
  message: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    toaster(message, 'error')
    throw err
  }
}
