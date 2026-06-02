import type { KeyMapping } from '@shared/types'

export interface PresetDef {
  id: string
  name: string
  description: string
  mapping: KeyMapping
}

export const PRESETS: PresetDef[] = [
  {
    id: 'qwerty',
    name: '標準 QWERTY',
    description: 'すべてのキーをデフォルト割り当てにリセット',
    mapping: {}
  },
  {
    id: 'famicom',
    name: 'Famicom 風',
    description: 'Super A=Bボタン、Super B=Aボタン',
    mapping: {
      SuperA: { kind: 'key', code: 'KeyZ' },
      SuperB: { kind: 'key', code: 'KeyX' }
    }
  },
  {
    id: 'fps',
    name: 'FPS 向け',
    description: 'Super A=リロード(R)、Super B=しゃがみ(C)、メディアキーあり',
    mapping: {
      SuperA: { kind: 'key', code: 'KeyR' },
      SuperB: { kind: 'key', code: 'KeyC' },
      F5: { kind: 'media', action: 'VolumeDown' },
      F6: { kind: 'media', action: 'VolumeUp' },
      F7: { kind: 'media', action: 'Mute' },
      F8: { kind: 'media', action: 'PlayPause' }
    }
  }
]
