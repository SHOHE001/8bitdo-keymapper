import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import type {
  Assignment,
  ComboAssignment,
  MacroStep,
  MediaAssignment,
  MouseAssignment
} from '@shared/types'
import { useProfileStore } from '../../store/useProfileStore'
import { useUiStore } from '../../store/useUiStore'
import { buildAssignment, type AssignmentFormState } from './buildAssignment'
import { useKeyCapture } from './useKeyCapture'
import { KeyTab } from './KeyTab'
import { ComboTab } from './ComboTab'
import { MacroTab } from './MacroTab'
import { MediaTab } from './MediaTab'
import { MouseTab } from './MouseTab'
import { DisabledTab } from './DisabledTab'

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

export function AssignmentModal() {
  const { selectedKeyId, isAssignmentModalOpen, closeAssignment } = useUiStore()
  const activeProfile = useProfileStore((s) => s.activeProfile())
  const setAssignment = useProfileStore((s) => s.setAssignment)

  const current = selectedKeyId ? activeProfile?.mapping[selectedKeyId] : undefined

  const [tab, setTab] = useState<Tab>('key')
  const [keyCode, setKeyCode] = useState('')
  const [comboMods, setComboMods] = useState<ComboAssignment['modifiers']>([])
  const [comboCode, setComboCode] = useState('')
  const [macroSteps, setMacroSteps] = useState<MacroStep[]>([{ code: '' }])
  const [mediaAction, setMediaAction] = useState<MediaAssignment['action']>('PlayPause')
  const [mouseButton, setMouseButton] = useState<MouseAssignment['button']>('Left')

  const { capturing, start: startCapture } = useKeyCapture()

  // モーダルを開いた瞬間の current で 1 度だけ form を初期化する。
  // current 自体は親 store の参照で頻繁に変わり得るので依存配列には入れない。
  useEffect(() => {
    if (!isAssignmentModalOpen) return
    if (!current) {
      setTab('key')
      return
    }
    setTab(current.kind)
    if (current.kind === 'key') setKeyCode(current.code)
    if (current.kind === 'combo') {
      setComboMods(current.modifiers)
      setComboCode(current.code)
    }
    if (current.kind === 'macro') {
      setMacroSteps(current.steps.length ? current.steps : [{ code: '' }])
    }
    if (current.kind === 'media') setMediaAction(current.action)
    if (current.kind === 'mouse') setMouseButton(current.button)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAssignmentModalOpen, selectedKeyId])

  const handleSave = (): void => {
    if (!selectedKeyId || !activeProfile) return
    const formState: AssignmentFormState = {
      tab,
      keyCode,
      comboMods,
      comboCode,
      macroSteps,
      mediaAction,
      mouseButton
    }
    const assignment: Assignment | null = buildAssignment(formState)
    if (!assignment) return
    void setAssignment(activeProfile.id, selectedKeyId, assignment)
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
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--keycap-border)' }}
        >
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

        <div className="p-4 min-h-[120px] text-[var(--keycap-text)]">
          {tab === 'key' && (
            <KeyTab
              keyCode={keyCode}
              onChange={setKeyCode}
              capturing={capturing}
              onStartCapture={() => startCapture(setKeyCode)}
            />
          )}
          {tab === 'combo' && (
            <ComboTab
              modifiers={comboMods}
              onModifiersChange={setComboMods}
              code={comboCode}
              onCodeChange={setComboCode}
              capturing={capturing}
              onStartCapture={() => startCapture(setComboCode)}
            />
          )}
          {tab === 'macro' && <MacroTab steps={macroSteps} onChange={setMacroSteps} />}
          {tab === 'media' && <MediaTab action={mediaAction} onChange={setMediaAction} />}
          {tab === 'mouse' && <MouseTab button={mouseButton} onChange={setMouseButton} />}
          {tab === 'disabled' && <DisabledTab />}
        </div>

        <div
          className="flex justify-end gap-2 p-4 border-t"
          style={{ borderColor: 'var(--keycap-border)' }}
        >
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
