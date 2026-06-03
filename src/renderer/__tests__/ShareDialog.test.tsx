import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

vi.mock('../src/lib/ipc', () => ({
  api: {
    getState: vi.fn(async () => ({ profiles: [], activeProfileId: null, version: 1 as const })),
    saveProfile: vi.fn(async () => {}),
    deleteProfile: vi.fn(async () => {}),
    setActive: vi.fn(async () => {}),
    exportProfile: vi.fn(async () => null),
    importProfile: vi.fn(async () => null),
    onStoreError: vi.fn(() => () => {})
  }
}))

import { ShareDialog } from '../src/components/ShareDialog'
import { useProfileStore } from '../src/store/useProfileStore'
import { useUiStore } from '../src/store/useUiStore'
import { encodeProfile } from '../src/lib/shareCode'
import type { Profile } from '../../shared/types'

function resetStores(): void {
  useProfileStore.setState({ profiles: [], activeProfileId: null, initialized: true })
  useUiStore.setState({
    isShareDialogOpen: true,
    isAssignmentModalOpen: false,
    selectedKeyId: null,
    isWelcomeOpen: false,
    confirmDialog: null,
    toasts: []
  })
}

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'shared-id',
    name: '共有プロファイル',
    theme: 'nes',
    mapping: { KeyA: { kind: 'key', code: 'KeyZ' } },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides
  }
}

describe('ShareDialog', () => {
  beforeEach(() => {
    resetStores()
    vi.clearAllMocks()
  })

  it('不正な共有コードを入力すると reason メッセージが表示される', async () => {
    render(<ShareDialog />)
    const input = screen.getByPlaceholderText('BKM1:...') as HTMLInputElement
    await act(async () => {
      fireEvent.change(input, { target: { value: 'BKM1:!!!!' } })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'インポート' }))
    })
    expect(screen.getByText('共有コードを復号できませんでした')).toBeInTheDocument()
  })

  it('新規 ID の共有コードは createProfile の戻り値で applyMapping される', async () => {
    const remote = makeProfile({ id: 'remote-id', name: '外部から' })
    const code = encodeProfile(remote)

    render(<ShareDialog />)
    const input = screen.getByPlaceholderText('BKM1:...') as HTMLInputElement
    await act(async () => {
      fireEvent.change(input, { target: { value: code } })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'インポート' }))
    })
    const profiles = useProfileStore.getState().profiles
    expect(profiles).toHaveLength(1)
    expect(profiles[0].name).toBe('外部から')
    expect(profiles[0].mapping).toEqual(remote.mapping)
  })

  it('既存 ID と衝突する共有コードは requestConfirm を経由し、キャンセル時は上書きしない', async () => {
    const existing = makeProfile({ id: 'dup', mapping: {} })
    useProfileStore.setState({ profiles: [existing], activeProfileId: existing.id })

    const remote = makeProfile({ id: 'dup', mapping: { KeyA: { kind: 'key', code: 'KeyZ' } } })
    const code = encodeProfile(remote)

    const requestConfirmSpy = vi
      .spyOn(useUiStore.getState(), 'requestConfirm')
      .mockResolvedValueOnce(false)

    render(<ShareDialog />)
    const input = screen.getByPlaceholderText('BKM1:...') as HTMLInputElement
    await act(async () => {
      fireEvent.change(input, { target: { value: code } })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'インポート' }))
    })

    expect(requestConfirmSpy).toHaveBeenCalled()
    const profile = useProfileStore.getState().profiles.find((p) => p.id === 'dup')!
    expect(profile.mapping).toEqual({})
  })

  it('clipboard.writeText が reject したら error toast が出る', async () => {
    const profile = makeProfile()
    useProfileStore.setState({ profiles: [profile], activeProfileId: profile.id })

    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    render(<ShareDialog />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'コピー' }))
    })

    expect(writeText).toHaveBeenCalled()
    const toasts = useUiStore.getState().toasts
    expect(toasts.some((t) => t.type === 'error')).toBe(true)
  })
})
