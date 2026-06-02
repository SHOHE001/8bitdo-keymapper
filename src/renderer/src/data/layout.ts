export interface KeyDef {
  id: string
  label: string
  col: number
  row: number
  w: number
  h: number
  group: 'function' | 'main' | 'navigation' | 'numpad' | 'super'
  fontSize?: 'xs' | 'sm' | 'base'
}

const ROW_H = 1

// prettier-ignore
export const KEY_DEFS: KeyDef[] = [
  // --- Function row ---
  { id: 'Escape',      label: 'Esc',    col: 1,    row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F1',          label: 'F1',     col: 2.5,  row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F2',          label: 'F2',     col: 3.5,  row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F3',          label: 'F3',     col: 4.5,  row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F4',          label: 'F4',     col: 5.5,  row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F5',          label: 'F5',     col: 7,    row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F6',          label: 'F6',     col: 8,    row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F7',          label: 'F7',     col: 9,    row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F8',          label: 'F8',     col: 10,   row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F9',          label: 'F9',     col: 11.5, row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F10',         label: 'F10',    col: 12.5, row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F11',         label: 'F11',    col: 13.5, row: 1, w: 1,    h: ROW_H, group: 'function' },
  { id: 'F12',         label: 'F12',    col: 14.5, row: 1, w: 1,    h: ROW_H, group: 'function' },

  // --- Number row ---
  { id: 'Backquote',   label: '`',      col: 1,    row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit1',      label: '1',      col: 2,    row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit2',      label: '2',      col: 3,    row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit3',      label: '3',      col: 4,    row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit4',      label: '4',      col: 5,    row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit5',      label: '5',      col: 6,    row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit6',      label: '6',      col: 7,    row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit7',      label: '7',      col: 8,    row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit8',      label: '8',      col: 9,    row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit9',      label: '9',      col: 10,   row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Digit0',      label: '0',      col: 11,   row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Minus',       label: '-',      col: 12,   row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Equal',       label: '=',      col: 13,   row: 2, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Backspace',   label: '⌫',      col: 14,   row: 2, w: 2,    h: ROW_H, group: 'main', fontSize: 'base' },

  // --- QWERTY row ---
  { id: 'Tab',         label: 'Tab',    col: 1,    row: 3, w: 1.5,  h: ROW_H, group: 'main', fontSize: 'xs' },
  { id: 'KeyQ',        label: 'Q',      col: 2.5,  row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyW',        label: 'W',      col: 3.5,  row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyE',        label: 'E',      col: 4.5,  row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyR',        label: 'R',      col: 5.5,  row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyT',        label: 'T',      col: 6.5,  row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyY',        label: 'Y',      col: 7.5,  row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyU',        label: 'U',      col: 8.5,  row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyI',        label: 'I',      col: 9.5,  row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyO',        label: 'O',      col: 10.5, row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyP',        label: 'P',      col: 11.5, row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'BracketLeft', label: '[',      col: 12.5, row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'BracketRight',label: ']',      col: 13.5, row: 3, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Backslash',   label: '\\',     col: 14.5, row: 3, w: 1.5,  h: ROW_H, group: 'main' },

  // --- ASDF row ---
  { id: 'CapsLock',    label: 'Caps',   col: 1,    row: 4, w: 1.75, h: ROW_H, group: 'main', fontSize: 'xs' },
  { id: 'KeyA',        label: 'A',      col: 2.75, row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyS',        label: 'S',      col: 3.75, row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyD',        label: 'D',      col: 4.75, row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyF',        label: 'F',      col: 5.75, row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyG',        label: 'G',      col: 6.75, row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyH',        label: 'H',      col: 7.75, row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyJ',        label: 'J',      col: 8.75, row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyK',        label: 'K',      col: 9.75, row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyL',        label: 'L',      col: 10.75,row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Semicolon',   label: ';',      col: 11.75,row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Quote',       label: '\'',     col: 12.75,row: 4, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Enter',       label: 'Enter',  col: 13.75,row: 4, w: 2.25, h: ROW_H, group: 'main', fontSize: 'xs' },

  // --- ZXCV row ---
  { id: 'ShiftLeft',   label: 'Shift',  col: 1,    row: 5, w: 2.25, h: ROW_H, group: 'main', fontSize: 'xs' },
  { id: 'KeyZ',        label: 'Z',      col: 3.25, row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyX',        label: 'X',      col: 4.25, row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyC',        label: 'C',      col: 5.25, row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyV',        label: 'V',      col: 6.25, row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyB',        label: 'B',      col: 7.25, row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyN',        label: 'N',      col: 8.25, row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'KeyM',        label: 'M',      col: 9.25, row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Comma',       label: ',',      col: 10.25,row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Period',      label: '.',      col: 11.25,row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'Slash',       label: '/',      col: 12.25,row: 5, w: 1,    h: ROW_H, group: 'main' },
  { id: 'ShiftRight',  label: 'Shift',  col: 13.25,row: 5, w: 2.75, h: ROW_H, group: 'main', fontSize: 'xs' },

  // --- Bottom row ---
  { id: 'ControlLeft', label: 'Ctrl',   col: 1,    row: 6, w: 1.25, h: ROW_H, group: 'main', fontSize: 'xs' },
  { id: 'MetaLeft',    label: 'Win',    col: 2.25, row: 6, w: 1.25, h: ROW_H, group: 'main', fontSize: 'xs' },
  { id: 'AltLeft',     label: 'Alt',    col: 3.5,  row: 6, w: 1.25, h: ROW_H, group: 'main', fontSize: 'xs' },
  { id: 'Space',       label: ' ',      col: 4.75, row: 6, w: 6.25, h: ROW_H, group: 'main' },
  { id: 'AltRight',    label: 'Alt',    col: 11,   row: 6, w: 1.25, h: ROW_H, group: 'main', fontSize: 'xs' },
  { id: 'MetaRight',   label: 'Win',    col: 12.25,row: 6, w: 1.25, h: ROW_H, group: 'main', fontSize: 'xs' },
  { id: 'ContextMenu', label: '☰',      col: 13.5, row: 6, w: 1.25, h: ROW_H, group: 'main' },
  { id: 'ControlRight',label: 'Ctrl',   col: 14.75,row: 6, w: 1.25, h: ROW_H, group: 'main', fontSize: 'xs' },

  // --- Navigation cluster ---
  { id: 'PrintScreen', label: 'PrtSc',  col: 17,   row: 1, w: 1, h: ROW_H, group: 'navigation', fontSize: 'xs' },
  { id: 'ScrollLock',  label: 'Scr',    col: 18,   row: 1, w: 1, h: ROW_H, group: 'navigation', fontSize: 'xs' },
  { id: 'Pause',       label: 'Paus',   col: 19,   row: 1, w: 1, h: ROW_H, group: 'navigation', fontSize: 'xs' },
  { id: 'Insert',      label: 'Ins',    col: 17,   row: 2, w: 1, h: ROW_H, group: 'navigation', fontSize: 'xs' },
  { id: 'Home',        label: 'Home',   col: 18,   row: 2, w: 1, h: ROW_H, group: 'navigation', fontSize: 'xs' },
  { id: 'PageUp',      label: 'PgUp',   col: 19,   row: 2, w: 1, h: ROW_H, group: 'navigation', fontSize: 'xs' },
  { id: 'Delete',      label: 'Del',    col: 17,   row: 3, w: 1, h: ROW_H, group: 'navigation', fontSize: 'xs' },
  { id: 'End',         label: 'End',    col: 18,   row: 3, w: 1, h: ROW_H, group: 'navigation', fontSize: 'xs' },
  { id: 'PageDown',    label: 'PgDn',   col: 19,   row: 3, w: 1, h: ROW_H, group: 'navigation', fontSize: 'xs' },
  { id: 'ArrowUp',     label: '↑',      col: 18,   row: 5, w: 1, h: ROW_H, group: 'navigation' },
  { id: 'ArrowLeft',   label: '←',      col: 17,   row: 6, w: 1, h: ROW_H, group: 'navigation' },
  { id: 'ArrowDown',   label: '↓',      col: 18,   row: 6, w: 1, h: ROW_H, group: 'navigation' },
  { id: 'ArrowRight',  label: '→',      col: 19,   row: 6, w: 1, h: ROW_H, group: 'navigation' },

  // --- Super Buttons ---
  { id: 'SuperA',      label: 'A',      col: 21.5, row: 2, w: 2.5, h: 2.5, group: 'super' },
  { id: 'SuperB',      label: 'B',      col: 21.5, row: 4.5, w: 2.5, h: 2.5, group: 'super' }
]

export const GRID_COLS = 24
export const GRID_UNIT_PX = 48
