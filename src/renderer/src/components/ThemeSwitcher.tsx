import { clsx } from 'clsx'
import { THEMES } from '../data/themes'
import { useProfileStore } from '../store/useProfileStore'
import { useUiStore } from '../store/useUiStore'
import { toastMessages } from '../lib/toastMessages'
import type { ModelTheme } from '@shared/types'

export function ThemeSwitcher() {
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const setTheme = useProfileStore((s) => s.setTheme)
  const addToast = useUiStore((s) => s.addToast)

  const handleChange = (theme: ModelTheme, label: string) => {
    if (!activeProfile) {
      addToast(toastMessages.needProfileFirst(), 'error')
      return
    }
    setTheme(activeProfile.id, theme)
    addToast(toastMessages.themeChanged(label), 'info')
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold tracking-wider opacity-70 text-[var(--keycap-text)]">
        テーマ:
      </span>
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => handleChange(t.id, t.label)}
          title={`${t.label} 風テーマに変更`}
          className={clsx(
            'w-7 h-7 rounded-full border-2 font-bold text-[10px] transition-transform',
            activeProfile?.theme === t.id
              ? 'border-white scale-110'
              : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
          )}
          style={{ background: t.vars['--accent'], color: '#fff' }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
