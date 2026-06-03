import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// globals: false なので testing-library 自前の auto-cleanup が効かない。手動登録する。
afterEach(() => {
  cleanup()
})
