import { useEffect, useMemo } from 'react'
import { useProfileStore } from './store/useProfileStore'
import { useUiStore } from './store/useUiStore'
import { ProfileSidebar } from './components/ProfileSidebar'
import { KeyboardView } from './components/KeyboardView'
import { AssignmentModal } from './components/assignment/AssignmentModal'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { PresetMenu } from './components/PresetMenu'
import { ShareDialog } from './components/ShareDialog'
import { WelcomeOverlay } from './components/WelcomeOverlay'
import { ToastStack } from './components/Toast'
import { ConfirmDialog } from './components/ConfirmDialog'
import { getThemeStyle } from './data/themes'

export function App() {
  const { init, initialized } = useProfileStore()
  const { openShareDialog, openWelcome, welcomeSeen, isWelcomeOpen } = useUiStore()
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const theme = activeProfile?.theme ?? 'nes'
  const themeStyle = useMemo(() => getThemeStyle(theme), [theme])

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (!initialized) return
    if (welcomeSeen) return
    if (isWelcomeOpen) return
    openWelcome()
  }, [initialized, welcomeSeen, isWelcomeOpen, openWelcome])

  if (!initialized) {
    return (
      <div className="h-full flex items-center justify-center text-white bg-gray-900">
        読み込み中...
      </div>
    )
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ ...themeStyle, background: 'var(--kb-bg)' }}
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
        <span className="text-sm font-bold text-[var(--keycap-text)] mr-2">
          8BitDo Keymapper
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded opacity-70"
          style={{
            background: 'var(--kb-bg)',
            color: 'var(--keycap-text-label)',
            border: '1px solid var(--keycap-border)'
          }}
        >
          割り当て設計エディタ
        </span>
        <div className="mx-3 h-5 w-px" style={{ background: 'var(--keycap-border)' }} />
        <ThemeSwitcher />
        <div className="ml-auto flex items-center gap-2">
          <PresetMenu />
          <button
            onClick={openShareDialog}
            className="px-3 py-1 rounded text-sm border border-[var(--keycap-border)] text-[var(--keycap-text)] hover:border-[var(--accent)]"
            title="共有コードで割り当てを配布"
          >
            共有
          </button>
          <button
            onClick={openWelcome}
            className="px-3 py-1 rounded text-sm border border-[var(--keycap-border)] text-[var(--keycap-text)] hover:border-[var(--accent)]"
            title="使い方ガイドを表示"
          >
            ？ヘルプ
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
      <WelcomeOverlay />
      <ConfirmDialog />
      <ToastStack />
    </div>
  )
}
