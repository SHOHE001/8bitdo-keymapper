import { clsx } from 'clsx'
import { THEMES } from '../data/themes'
import { useProfileStore } from '../store/useProfileStore'
import type { ModelTheme } from '@shared/types'

export function ThemeSwitcher() {
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const setTheme = useProfileStore((s) => s.setTheme)

  const handleChange = (theme: ModelTheme) => {
    if (!activeProfile) return
    setTheme(activeProfile.id, theme)
  }

  return (
    <div className="flex items-center gap-1">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => handleChange(t.id)}
          title={t.label}
          className={clsx(
            'w-8 h-8 rounded-full border-2 font-bold text-[10px] transition-transform',
            activeProfile?.theme === t.id
              ? 'border-white scale-110'
              : 'border-transparent hover:scale-105 opacity-70'
          )}
          style={{ background: t.vars['--accent'], color: '#fff' }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
