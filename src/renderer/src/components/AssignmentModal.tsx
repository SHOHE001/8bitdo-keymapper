import { useState, useEffect, useCallback } from 'react'
import { clsx } from 'clsx'
import type { Assignment, ComboAssignment, MacroStep, MediaAssignment, MouseAssignment } from '@shared/types'
import { useProfileStore } from '../store/useProfileStore'
import { useUiStore } from '../store/useUiStore'

const TABS = ['key', 'combo', 'macro', 'media', 'mouse', 'disabled'] as const
type Tab = (typeof TABS)[number]

const TAB_LABELS: Record<Tab, string> = {
  key: 'キー',
  combo: 'コンボ',
  macro: 'マクロ',
  media: 'メディア',
  mouse: 'マウス',
  disabled: '無効'
}

const MEDIA_ACTIONS: MediaAssignment['action'][] = [
  'PlayPause', 'Next', 'Prev', 'VolumeUp', 'VolumeDown', 'Mute'
]

const MOUSE_BUTTONS: MouseAssignment['button'][] = [
  'Left', 'Right', 'Middle', 'WheelUp', 'WheelDown'
]

export function AssignmentModal() {
  const { selectedKeyId, isAssignmentModalOpen, closeAssignment } = useUiStore()
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const setAssignment = useProfileStore((s) => s.setAssignment)

  const current = selectedKeyId ? activeProfile?.mapping[selectedKeyId] : undefined

  const [tab, setTab] = useState<Tab>('key')
  const [keyCode, setKeyCode] = useState('')
  const [capturing, setCapturing] = useState(false)
  const [comboMods, setComboMods] = useState<ComboAssignment['modifiers']>([])
  const [comboCode, setComboCode] = useState('')
  const [macroSteps, setMacroSteps] = useState<MacroStep[]>([{ code: '' }])
  const [mediaAction, setMediaAction] = useState<MediaAssignment['action']>('PlayPause')
  const [mouseButton, setMouseButton] = useState<MouseAssignment['button']>('Left')

  useEffect(() => {
    if (!isAssignmentModalOpen) return
    if (!current) { setTab('key'); return }
    setTab(current.kind)
    if (current.kind === 'key') setKeyCode(current.code)
    if (current.kind === 'combo') { setComboMods(current.modifiers); setComboCode(current.code) }
    if (current.kind === 'macro') setMacroSteps(current.steps.length ? current.steps : [{ code: '' }])
    if (current.kind === 'media') setMediaAction(current.action)
    if (current.kind === 'mouse') setMouseButton(current.button)
  }, [isAssignmentModalOpen, selectedKeyId])

  const captureKey = useCallback(
    (onCapture: (code: string) => void) => {
      setCapturing(true)
      const handler = (e: KeyboardEvent) => {
        e.preventDefault()
        onCapture(e.code)
        setCapturing(false)
        window.removeEventListener('keydown', handler)
      }
      window.addEventListener('keydown', handler)
    },
    []
  )

  const handleSave = () => {
    if (!selectedKeyId || !activeProfile) return
    let assignment: Assignment
    if (tab === 'key') {
      if (!keyCode) return
      assignment = { kind: 'key', code: keyCode }
    } else if (tab === 'combo') {
      if (!comboCode) return
      assignment = { kind: 'combo', modifiers: comboMods, code: comboCode }
    } else if (tab === 'macro') {
      const steps = macroSteps.filter((s) => s.code)
      if (!steps.length) return
      assignment = { kind: 'macro', steps }
    } else if (tab === 'media') {
      assignment = { kind: 'media', action: mediaAction }
    } else if (tab === 'mouse') {
      assignment = { kind: 'mouse', button: mouseButton }
    } else {
      assignment = { kind: 'disabled' }
    }
    setAssignment(activeProfile.id, selectedKeyId, assignment)
    closeAssignment()
  }

  if (!isAssignmentModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && closeAssignment()}
    >
      <div
        className="rounded-xl shadow-2xl w-96"
        style={{ background: 'var(--keycap-bg)', border: '2px solid var(--keycap-border)' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--keycap-border)' }}>
          <h2 className="text-[var(--keycap-text)] font-bold">
            キー割り当て：<span className="text-[var(--accent)]">{selectedKeyId}</span>
          </h2>
          <button
            onClick={closeAssignment}
            className="text-[var(--keycap-text-label)] hover:text-[var(--keycap-text)] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b" style={{ borderColor: 'var(--keycap-border)' }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'flex-1 py-2 text-xs font-medium transition-colors',
                tab === t
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                  : 'text-[var(--keycap-text-label)] hover:text-[var(--keycap-text)]'
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* 内容 */}
        <div className="p-4 min-h-[120px] text-[var(--keycap-text)]">
          {tab === 'key' && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--keycap-text-label)]">割り当てるキーコード</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded px-3 py-2 text-sm"
                  style={{
                    background: 'var(--kb-bg)',
                    border: '1px solid var(--keycap-border)',
                    color: 'var(--keycap-text)'
                  }}
                  value={keyCode}
                  onChange={(e) => setKeyCode(e.target.value)}
                  placeholder="例: KeyA"
                />
                <button
                  onClick={() => captureKey(setKeyCode)}
                  className={clsx(
                    'px-3 py-2 rounded text-xs font-medium',
                    'bg-[var(--accent)] text-white hover:opacity-80',
                    capturing && 'animate-pulse'
                  )}
                >
                  {capturing ? '押してください' : 'キャプチャ'}
                </button>
              </div>
            </div>
          )}

          {tab === 'combo' && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--keycap-text-label)]">修飾キー + キーコード</p>
              <div className="flex gap-2 flex-wrap">
                {(['Ctrl', 'Shift', 'Alt', 'Meta'] as const).map((mod) => (
                  <button
                    key={mod}
                    onClick={() =>
                      setComboMods((prev) =>
                        prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
                      )
                    }
                    className={clsx(
                      'px-3 py-1 rounded text-xs border',
                      comboMods.includes(mod)
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                        : 'border-[var(--keycap-border)] text-[var(--keycap-text-label)]'
                    )}
                  >
                    {mod}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded px-3 py-2 text-sm"
                  style={{
                    background: 'var(--kb-bg)',
                    border: '1px solid var(--keycap-border)',
                    color: 'var(--keycap-text)'
                  }}
                  value={comboCode}
                  onChange={(e) => setComboCode(e.target.value)}
                  placeholder="例: KeyC"
                />
                <button
                  onClick={() => captureKey(setComboCode)}
                  className={clsx(
                    'px-3 py-2 rounded text-xs font-medium bg-[var(--accent)] text-white hover:opacity-80',
                    capturing && 'animate-pulse'
                  )}
                >
                  {capturing ? '押してください' : 'キャプチャ'}
                </button>
              </div>
            </div>
          )}

          {tab === 'macro' && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--keycap-text-label)]">連続入力ステップ</p>
              {macroSteps.map((step, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="flex-1 rounded px-2 py-1 text-sm"
                    style={{
                      background: 'var(--kb-bg)',
                      border: '1px solid var(--keycap-border)',
                      color: 'var(--keycap-text)'
                    }}
                    value={step.code}
                    onChange={(e) =>
                      setMacroSteps((prev) =>
                        prev.map((s, j) => (j === i ? { ...s, code: e.target.value } : s))
                      )
                    }
                    placeholder="KeyCode"
                  />
                  <input
                    type="number"
                    className="w-16 rounded px-2 py-1 text-sm"
                    style={{
                      background: 'var(--kb-bg)',
                      border: '1px solid var(--keycap-border)',
                      color: 'var(--keycap-text)'
                    }}
                    value={step.delayMs ?? ''}
                    onChange={(e) =>
                      setMacroSteps((prev) =>
                        prev.map((s, j) =>
                          j === i ? { ...s, delayMs: e.target.value ? Number(e.target.value) : undefined } : s
                        )
                      )
                    }
                    placeholder="ms"
                  />
                  <button
                    onClick={() => setMacroSteps((prev) => prev.filter((_, j) => j !== i))}
                    className="text-[var(--keycap-text-label)] hover:text-red-400 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setMacroSteps((prev) => [...prev, { code: '' }])}
                className="text-xs text-[var(--accent)] hover:opacity-80"
              >
                + ステップ追加
              </button>
            </div>
          )}

          {tab === 'media' && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--keycap-text-label)]">メディアアクション</p>
              <div className="grid grid-cols-3 gap-2">
                {MEDIA_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => setMediaAction(action)}
                    className={clsx(
                      'py-2 rounded text-xs border',
                      mediaAction === action
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                        : 'border-[var(--keycap-border)] text-[var(--keycap-text-label)]'
                    )}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'mouse' && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--keycap-text-label)]">マウスボタン</p>
              <div className="grid grid-cols-3 gap-2">
                {MOUSE_BUTTONS.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => setMouseButton(btn)}
                    className={clsx(
                      'py-2 rounded text-xs border',
                      mouseButton === btn
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                        : 'border-[var(--keycap-border)] text-[var(--keycap-text-label)]'
                    )}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'disabled' && (
            <p className="text-sm text-[var(--keycap-text-label)]">このキーを無効化します。</p>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-2 p-4 border-t" style={{ borderColor: 'var(--keycap-border)' }}>
          <button
            onClick={closeAssignment}
            className="px-4 py-2 rounded text-sm text-[var(--keycap-text-label)] hover:text-[var(--keycap-text)] border border-[var(--keycap-border)]"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded text-sm font-medium bg-[var(--accent)] text-white hover:opacity-80"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
