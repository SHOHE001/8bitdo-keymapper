import { useEffect } from 'react'
import { useProfileStore } from './store/useProfileStore'
import { useUiStore } from './store/useUiStore'
import { ProfileSidebar } from './components/ProfileSidebar'
import { KeyboardView } from './components/KeyboardView'
import { AssignmentModal } from './components/AssignmentModal'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { PresetMenu } from './components/PresetMenu'
import { ShareDialog } from './components/ShareDialog'

export function App() {
  const { init, initialized } = useProfileStore()
  const { openShareDialog } = useUiStore()
  const activeProfile = useProfileStore((s) => s.activeProfile())

  useEffect(() => {
    init()
  }, [])

  if (!initialized) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-gray-900">
        読み込み中...
      </div>
    )
  }

  const theme = activeProfile?.theme ?? 'nes'

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: 'var(--kb-bg)' }}
      data-theme={theme}
    >
      {/* トップバー */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b shrink-0"
        style={{
          background: 'var(--keycap-bg)',
          borderColor: 'var(--keycap-border)'
        }}
      >
        <span className="text-sm font-bold text-[var(--keycap-text)] mr-2">8BitDo Keymapper</span>
        <ThemeSwitcher />
        <div className="ml-auto flex items-center gap-2">
          <PresetMenu />
          <button
            onClick={openShareDialog}
            className="px-3 py-1 rounded text-sm border border-[var(--keycap-border)] text-[var(--keycap-text)] hover:border-[var(--accent)]"
          >
            共有
          </button>
        </div>
      </div>

      {/* メインエリア */}
      <div className="flex flex-1 overflow-hidden">
        <ProfileSidebar />
        <KeyboardView theme={theme} />
      </div>

      <AssignmentModal />
      <ShareDialog />
    </div>
  )
}
