import { useMemo } from 'react'
import { KEY_DEFS, GRID_COLS } from '../data/layout'
import { getTheme } from '../data/themes'
import { useProfileStore } from '../store/useProfileStore'
import { useUiStore } from '../store/useUiStore'
import { KeyCap } from './KeyCap'
import type { ModelTheme } from '@shared/types'

interface Props {
  theme: ModelTheme
}

export function KeyboardView({ theme }: Props) {
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const { selectedKeyId, openAssignment } = useUiStore()

  const themeConfig = getTheme(theme)

  const cssVars = useMemo(
    () =>
      Object.entries(themeConfig.vars).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: v }),
        {} as Record<string, string>
      ),
    [themeConfig]
  )

  if (!activeProfile) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        プロファイルを作成してください
      </div>
    )
  }

  return (
    <div
      className="flex-1 flex items-center justify-center p-4 overflow-auto"
      style={cssVars as React.CSSProperties}
    >
      <div
        className="rounded-xl p-4 shadow-2xl"
        style={{ background: 'var(--kb-bg)', border: '3px solid var(--kb-border)' }}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS * 4}, minmax(0, 12px))`,
            gridAutoRows: '12px'
          }}
        >
          {KEY_DEFS.map((key) => (
            <KeyCap
              key={key.id}
              id={key.id}
              label={key.label}
              w={key.w}
              h={key.h}
              col={key.col}
              row={key.row}
              assignment={activeProfile.mapping[key.id]}
              isSelected={selectedKeyId === key.id}
              isSuper={key.group === 'super'}
              onClick={() => openAssignment(key.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
