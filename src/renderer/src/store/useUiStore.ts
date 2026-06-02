import { create } from 'zustand'
import type { KeyId } from '@shared/types'

interface UiStore {
  selectedKeyId: KeyId | null
  isAssignmentModalOpen: boolean
  isShareDialogOpen: boolean
  openAssignment(keyId: KeyId): void
  closeAssignment(): void
  openShareDialog(): void
  closeShareDialog(): void
}

export const useUiStore = create<UiStore>((set) => ({
  selectedKeyId: null,
  isAssignmentModalOpen: false,
  isShareDialogOpen: false,

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
  }
}))
