import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles : './vitest.setup.tsx',   // ← ensure name matches
    include    : ['src/**/*.{test,spec}.{ts,tsx}'], // default
    exclude    : ['e2e/**'],            // ← don't run Playwright specs
    globals    : true,
  },
  resolve: { alias: { '@/': '/src/' } },
})
