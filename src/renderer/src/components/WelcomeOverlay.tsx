import { useProfileStore } from '../store/useProfileStore'
import { useUiStore } from '../store/useUiStore'
import { toastMessages } from '../lib/toastMessages'
import { Panel } from './Panel'

export function WelcomeOverlay() {
  const isOpen = useUiStore((s) => s.isWelcomeOpen)
  const closeWelcome = useUiStore((s) => s.closeWelcome)
  const addToast = useUiStore((s) => s.addToast)
  const requestProfileInputFocus = useUiStore((s) => s.requestProfileInputFocus)
  const createSampleProfile = useProfileStore((s) => s.createSampleProfile)

  if (!isOpen) return null

  const handleSample = async () => {
    const created = await createSampleProfile({ presetId: 'qwerty' })
    addToast(toastMessages.sampleCreated(created.name), 'success')
    closeWelcome()
  }

  const handleManual = () => {
    closeWelcome()
    requestProfileInputFocus()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6">
      <Panel
        className="max-w-2xl w-full shadow-2xl overflow-hidden rounded-2xl"
        style={{ borderWidth: 2 }}
      >
        <div
          className="px-8 py-6 border-b"
          style={{ borderColor: 'var(--keycap-border)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">⌨️</span>
            <div>
              <h1 className="text-xl font-bold">8BitDo Keymapper へようこそ</h1>
              <p className="text-xs mt-1 opacity-80">
                8BitDo Retro Mechanical Keyboard 用の割り当て設計エディタ
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5 text-sm leading-relaxed">
          <p>
            このアプリは
            <span className="font-bold text-[var(--accent)]">
              「使っていないキーや Super A / Super B ボタンに、好きなキー・ショートカット・マクロを割り当てる設計」
            </span>
            をビジュアルに作るツールです。
          </p>

          <div className="grid grid-cols-3 gap-3">
            <Step n={1} title="プロファイル作成" body="左サイドバーで新規プロファイルを作る" />
            <Step n={2} title="キーをクリック" body="キーをクリックして割り当てを編集" />
            <Step n={3} title="Export で書き出し" body="JSON で保存・共有コードで配布" />
          </div>

          <Panel variant="well" className="p-3 text-xs leading-relaxed">
            <span className="font-bold text-[var(--accent)]">※注意：</span>{' '}
            このアプリは「割り当てを設計・記録するエディタ」です。実際にキーボードへ反映するには、
            出力した JSON を参考に
            <span className="font-bold"> 8BitDo Ultimate Software </span>
            等で同じ割り当てを設定してください。アプリ自身が OS のキーを書き換えることはありません。
          </Panel>
        </div>

        <div
          className="flex items-center justify-end gap-2 px-8 py-4 border-t"
          style={{ borderColor: 'var(--keycap-border)' }}
        >
          <button
            onClick={handleManual}
            className="px-4 py-2 rounded text-sm border hover:border-[var(--accent)]"
            style={{ borderColor: 'var(--keycap-border)', color: 'var(--keycap-text)' }}
          >
            自分で作る
          </button>
          <button
            onClick={handleSample}
            className="px-4 py-2 rounded text-sm font-bold bg-[var(--accent)] text-white hover:opacity-80"
          >
            サンプルから始める
          </button>
        </div>
      </Panel>
    </div>
  )
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <Panel variant="well" className="p-3">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'var(--accent)' }}
        >
          {n}
        </span>
        <span className="font-bold text-sm text-[var(--keycap-text)]">{title}</span>
      </div>
      <p className="text-xs opacity-80">{body}</p>
    </Panel>
  )
}
