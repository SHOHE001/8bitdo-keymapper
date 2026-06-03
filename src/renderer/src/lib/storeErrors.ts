import { useUiStore } from '../store/useUiStore'

// store の mutation で IPC reject を捕まえた時の共通ヘルパ。
// rollback は呼び出し側が握っているので、ここでは toast 通知と再 throw だけを担う。
export async function withErrorToast<T>(message: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    useUiStore.getState().addToast(message, 'error')
    throw err
  }
}
