import { useMemo } from 'react'
import { KEY_DEFS, GRID_COLS } from '../data/layout'
import { THEMES, getThemeStyle } from '../data/themes'
import { useProfileStore } from '../store/useProfileStore'
import { useUiStore } from '../store/useUiStore'
import { toastMessages } from '../lib/toastMessages'
import { KeyCap } from './KeyCap'
import { Panel } from './Panel'
import type { ModelTheme } from '@shared/types'

interface Props {
  theme: ModelTheme
}

export function KeyboardView({ theme }: Props) {
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const createSampleProfile = useProfileStore((s) => s.createSampleProfile)
  const { selectedKeyId, openAssignment } = useUiStore()
  const addToast = useUiStore((s) => s.addToast)
  const requestProfileInputFocus = useUiStore((s) => s.requestProfileInputFocus)

  const themeStyle = useMemo(() => getThemeStyle(theme), [theme])

  const handleSample = async () => {
    const created = await createSampleProfile({ presetId: 'qwerty' })
    addToast(toastMessages.sampleCreated(created.name), 'success')
  }

  if (!activeProfile) {
    return (
      <div
        className="flex-1 flex items-center justify-center p-8 overflow-auto"
        style={themeStyle}
      >
        <Panel variant="dashed" className="max-w-md text-center px-8 py-10 shadow-xl rounded-2xl">
          <div className="text-5xl mb-3">⌨️</div>
          <h2 className="text-lg font-bold mb-2">まずはプロファイルを作りましょう</h2>
          <p className="text-sm opacity-80 leading-relaxed mb-5">
            左サイドバーで新しいプロファイルを作成すると、
            <br />
            ここに 8BitDo キーボードが表示されます。
          </p>
          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={handleSample}
              className="px-5 py-2 rounded font-bold bg-[var(--accent)] text-white hover:opacity-80"
            >
              サンプルから始める
            </button>
            <button
              onClick={requestProfileInputFocus}
              className="text-xs opacity-70 hover:opacity-100 underline"
            >
              ← 自分でプロファイル名を入力する
            </button>
          </div>
        </Panel>
      </div>
    )
  }

  const mappedCount = Object.keys(activeProfile.mapping).length
  const themeLabel = THEMES.find((t) => t.id === theme)?.label ?? theme

  return (
    <div className="flex-1 flex flex-col overflow-auto" style={themeStyle}>
      {/* 上部ガイドバー */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-2 border-b text-xs"
        style={{
          background: 'var(--keycap-bg)',
          borderColor: 'var(--keycap-border)',
          color: 'var(--keycap-text)'
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold truncate">現在: {activeProfile.name}</span>
          <span className="opacity-60">/ テーマ: {themeLabel}</span>
          <span className="opacity-60">/ 割り当て済: {mappedCount} 件</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="opacity-80">
            <span className="font-bold text-[var(--accent)]">キーをクリック</span>
            で割り当てを編集
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: 'var(--keycap-bg)', border: '1px solid var(--keycap-border)' }}
            />
            <span className="opacity-70">未編集</span>
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: 'var(--accent)' }}
            />
            <span className="opacity-70">編集済</span>
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
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
    </div>
  )
}
