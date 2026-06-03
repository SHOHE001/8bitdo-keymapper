import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUiStore, TOAST_DURATION_MS } from '../src/store/useUiStore'

function resetUiStore(): void {
  useUiStore.setState({
    selectedKeyId: null,
    isAssignmentModalOpen: false,
    isShareDialogOpen: false,
    isWelcomeOpen: false,
    welcomeSeen: false,
    toasts: [],
    confirmDialog: null,
    focusProfileInputToken: 0,
    _nextToastId: 1,
    _toastTimers: new Map()
  })
}

describe('useUiStore - toasts', () => {
  beforeEach(() => {
    resetUiStore()
    vi.useFakeTimers()
  })

  it('addToast でトーストが増え、id が一意になる', () => {
    useUiStore.getState().addToast('A', 'info')
    useUiStore.getState().addToast('B', 'success')
    const { toasts } = useUiStore.getState()
    expect(toasts).toHaveLength(2)
    expect(toasts[0].message).toBe('A')
    expect(toasts[1].message).toBe('B')
    expect(toasts[0].id).not.toBe(toasts[1].id)
  })

  it('TOAST_DURATION_MS 経過後に自動消滅する', () => {
    useUiStore.getState().addToast('A', 'info')
    expect(useUiStore.getState().toasts).toHaveLength(1)
    vi.advanceTimersByTime(TOAST_DURATION_MS + 10)
    expect(useUiStore.getState().toasts).toHaveLength(0)
  })

  it('dismissToast で即時消滅しタイマーもクリアされる', () => {
    useUiStore.getState().addToast('A', 'info')
    const id = useUiStore.getState().toasts[0].id
    useUiStore.getState().dismissToast(id)
    expect(useUiStore.getState().toasts).toHaveLength(0)
    expect(useUiStore.getState()._toastTimers.has(id)).toBe(false)
  })
})

describe('useUiStore - confirmDialog', () => {
  beforeEach(() => {
    resetUiStore()
  })

  it('requestConfirm → resolveConfirm(true) で true を返す', async () => {
    const promise = useUiStore.getState().requestConfirm('本当に？')
    expect(useUiStore.getState().confirmDialog?.message).toBe('本当に？')
    useUiStore.getState().resolveConfirm(true)
    await expect(promise).resolves.toBe(true)
    expect(useUiStore.getState().confirmDialog).toBeNull()
  })

  it('resolveConfirm(false) で false を返す', async () => {
    const promise = useUiStore.getState().requestConfirm('消す？')
    useUiStore.getState().resolveConfirm(false)
    await expect(promise).resolves.toBe(false)
  })

  it('表示中に再度 requestConfirm すると前の確認は自動でキャンセル扱いになる', async () => {
    const first = useUiStore.getState().requestConfirm('A')
    const second = useUiStore.getState().requestConfirm('B')
    await expect(first).resolves.toBe(false)
    useUiStore.getState().resolveConfirm(true)
    await expect(second).resolves.toBe(true)
  })
})

describe('useUiStore - welcome', () => {
  beforeEach(() => {
    resetUiStore()
    window.localStorage.removeItem('keymapper-welcome-seen')
  })

  it('openWelcome → closeWelcome で welcomeSeen が true になり localStorage に反映', () => {
    useUiStore.getState().openWelcome()
    expect(useUiStore.getState().isWelcomeOpen).toBe(true)
    useUiStore.getState().closeWelcome()
    expect(useUiStore.getState().isWelcomeOpen).toBe(false)
    expect(useUiStore.getState().welcomeSeen).toBe(true)
    expect(window.localStorage.getItem('keymapper-welcome-seen')).toBe('1')
  })
})

describe('useUiStore - focusProfileInputToken', () => {
  beforeEach(() => {
    resetUiStore()
  })

  it('requestProfileInputFocus で値が増分される', () => {
    const before = useUiStore.getState().focusProfileInputToken
    useUiStore.getState().requestProfileInputFocus()
    expect(useUiStore.getState().focusProfileInputToken).toBe(before + 1)
    useUiStore.getState().requestProfileInputFocus()
    expect(useUiStore.getState().focusProfileInputToken).toBe(before + 2)
  })
})
