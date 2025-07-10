import '@testing-library/jest-dom'
import { vi } from 'vitest'

/* ---- Next / App Router mocks ---- */
vi.mock('next/navigation', () => ({
  useRouter       : () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams : () => new URLSearchParams(),
}))

/* ---- matchMedia (for shadcn dark-mode toggle) ---- */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value   : vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media  : q,
    onchange: null,
    addEventListener   : vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

/* ---- renderWithProviders helper ---- */
import { render, RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement, PropsWithChildren } from 'react'

export function renderWithProviders(ui: ReactElement): RenderResult {
  const qc = new QueryClient()
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return render(ui, { wrapper: Wrapper })
}
