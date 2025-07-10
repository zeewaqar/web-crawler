import { render, screen } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ProgressCell } from '../components/ProgressCell'

test('shows check-mark when done', () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <table><tbody><tr><ProgressCell urlId={1} initialStatus="done" /></tr></tbody></table>
    </QueryClientProvider>,
  )
  expect(screen.getByText('✅')).toBeInTheDocument()
})
