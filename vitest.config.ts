import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['src/renderer/__tests__/setup.ts'],
    environmentMatchGlobs: [
      ['src/main/__tests__/**', 'node'],
      ['src/shared/__tests__/**', 'node']
    ],
    globals: false
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@main': resolve(__dirname, 'src/main')
    }
  }
})
