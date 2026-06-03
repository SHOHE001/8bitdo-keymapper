import { create } from 'zustand'
import type { KeyId } from '@shared/types'

export type ToastType = 'info' | 'success' | 'error'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

export interface ConfirmRequest {
  message: string
  resolve: (ok: boolean) => void
}

export const TOAST_DURATION_MS = 2500
const WELCOME_SEEN_KEY = 'keymapper-welcome-seen'

function readWelcomeSeen(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(WELCOME_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function writeWelcomeSeen(value: boolean): void {
  if (typeof window === 'undefined') return
  try {
    if (value) window.localStorage.setItem(WELCOME_SEEN_KEY, '1')
    else window.localStorage.removeItem(WELCOME_SEEN_KEY)
  } catch {
    // ignore storage errors
  }
}

interface UiStore {
  selectedKeyId: KeyId | null
  isAssignmentModalOpen: boolean
  isShareDialogOpen: boolean
  isWelcomeOpen: boolean
  welcomeSeen: boolean
  toasts: ToastItem[]
  confirmDialog: ConfirmRequest | null
  // 値そのものに意味はない。インクリメントを「入力欄にフォーカスを当てろ」というイベントとして使う
  focusProfileInputToken: number

  _nextToastId: number
  _toastTimers: Map<number, ReturnType<typeof setTimeout>>

  openAssignment(keyId: KeyId): void
  closeAssignment(): void
  openShareDialog(): void
  closeShareDialog(): void
  openWelcome(): void
  closeWelcome(): void
  markWelcomeSeen(): void
  addToast(message: string, type?: ToastType): void
  dismissToast(id: number): void
  requestProfileInputFocus(): void
  requestConfirm(message: string): Promise<boolean>
  resolveConfirm(ok: boolean): void
}

export const useUiStore = create<UiStore>((set, get) => ({
  selectedKeyId: null,
  isAssignmentModalOpen: false,
  isShareDialogOpen: false,
  isWelcomeOpen: false,
  welcomeSeen: readWelcomeSeen(),
  toasts: [],
  confirmDialog: null,
  focusProfileInputToken: 0,
  _nextToastId: 1,
  _toastTimers: new Map(),

  openAssignment(keyId) {
    set({ selectedKeyId: keyId, isAssignmentModalOpen: true })
  },
  closeAssignment() {
    set({ isAssignmentModalOpen: false, selectedKeyId: null })
  },
  openShareDialog() {
    set({ isShareDialogOpen: true })
  },
  closeShareDialog() {
    set({ isShareDialogOpen: false })
  },
  openWelcome() {
    set({ isWelcomeOpen: true })
  },
  closeWelcome() {
    set({ isWelcomeOpen: false })
    if (!get().welcomeSeen) {
      writeWelcomeSeen(true)
      set({ welcomeSeen: true })
    }
  },
  markWelcomeSeen() {
    writeWelcomeSeen(true)
    set({ welcomeSeen: true })
  },
  addToast(message, type = 'info') {
    const id = get()._nextToastId
    set((s) => ({
      toasts: [...s.toasts, { id, message, type }],
      _nextToastId: s._nextToastId + 1
    }))
    const timer = setTimeout(() => {
      get().dismissToast(id)
    }, TOAST_DURATION_MS)
    get()._toastTimers.set(id, timer)
  },
  dismissToast(id) {
    const timers = get()._toastTimers
    const timer = timers.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timers.delete(id)
    }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
  requestProfileInputFocus() {
    set((s) => ({ focusProfileInputToken: s.focusProfileInputToken + 1 }))
  },
  requestConfirm(message) {
    // 既に表示中の場合は前のリクエストをキャンセル扱い
    const current = get().confirmDialog
    if (current) current.resolve(false)
    return new Promise<boolean>((resolve) => {
      set({ confirmDialog: { message, resolve } })
    })
  },
  resolveConfirm(ok) {
    const current = get().confirmDialog
    if (!current) return
    current.resolve(ok)
    set({ confirmDialog: null })
  }
}))
