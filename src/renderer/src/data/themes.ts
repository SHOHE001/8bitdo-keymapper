import type { ModelTheme } from '@shared/types'

export interface ThemeConfig {
  id: ModelTheme
  label: string
  vars: Record<string, string>
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'nes',
    label: 'NES',
    vars: {
      '--kb-bg': '#1a1a2e',
      '--kb-border': '#e60012',
      '--keycap-bg': '#2d2d44',
      '--keycap-bg-hover': '#3d3d5c',
      '--keycap-bg-active': '#e60012',
      '--keycap-border': '#444466',
      '--keycap-text': '#f0f0f0',
      '--keycap-text-label': '#aaaacc',
      '--super-bg': '#e60012',
      '--super-border': '#ff4444',
      '--super-text': '#ffffff',
      '--accent': '#e60012'
    }
  },
  {
    id: 'famicom',
    label: 'FC',
    vars: {
      '--kb-bg': '#d4000f',
      '--kb-border': '#f0c020',
      '--keycap-bg': '#1a1a1a',
      '--keycap-bg-hover': '#2a2a2a',
      '--keycap-bg-active': '#f0c020',
      '--keycap-border': '#333333',
      '--keycap-text': '#f5f5f5',
      '--keycap-text-label': '#aaaaaa',
      '--super-bg': '#f0c020',
      '--super-border': '#ffe060',
      '--super-text': '#1a1a1a',
      '--accent': '#f0c020'
    }
  },
  {
    id: 'c64',
    label: 'C64',
    vars: {
      '--kb-bg': '#897da5',
      '--kb-border': '#6c639c',
      '--keycap-bg': '#4a4565',
      '--keycap-bg-hover': '#5a5575',
      '--keycap-bg-active': '#7b70b0',
      '--keycap-border': '#6c639c',
      '--keycap-text': '#e0daf5',
      '--keycap-text-label': '#c0b8e0',
      '--super-bg': '#7b70b0',
      '--super-border': '#9b90d0',
      '--super-text': '#ffffff',
      '--accent': '#9b90d0'
    }
  },
  {
    id: 'ibm',
    label: 'IBM',
    vars: {
      '--kb-bg': '#c8c8c0',
      '--kb-border': '#888880',
      '--keycap-bg': '#d8d8d0',
      '--keycap-bg-hover': '#e0e0d8',
      '--keycap-bg-active': '#2060b0',
      '--keycap-border': '#a0a098',
      '--keycap-text': '#1a1a1a',
      '--keycap-text-label': '#555550',
      '--super-bg': '#2060b0',
      '--super-border': '#4080d0',
      '--super-text': '#ffffff',
      '--accent': '#2060b0'
    }
  },
  {
    id: 'xbox',
    label: 'Xbox',
    vars: {
      '--kb-bg': '#1a1a1a',
      '--kb-border': '#107c10',
      '--keycap-bg': '#2a2a2a',
      '--keycap-bg-hover': '#3a3a3a',
      '--keycap-bg-active': '#107c10',
      '--keycap-border': '#404040',
      '--keycap-text': '#f5f5f5',
      '--keycap-text-label': '#888888',
      '--super-bg': '#107c10',
      '--super-border': '#20ac20',
      '--super-text': '#ffffff',
      '--accent': '#107c10'
    }
  }
]

export function getTheme(id: ModelTheme): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
