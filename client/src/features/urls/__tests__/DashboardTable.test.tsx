import DashboardTable from '../DashboardTable'
import { fetchUrls } from '../api'
import { vi } from 'vitest'
// Update the import path if vitest.setup is located elsewhere, for example:
import { renderWithProviders } from '../../../../vitest.setup'
// Or create the file at ../../vitest.setup.ts if it doesn't exist.
import { screen, within } from '@testing-library/react'

vi.mock('../api')  // stub fetchUrls
;(fetchUrls as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
  total: 1,
  data: [
    { id: 1, title: null, original_url: 'https://a.com', crawl_status: 'done',
      html_version: 'HTML 5', internal_links:0, external_links:0, broken_links:0 },
  ],
})

test('shows row', async () => {
  renderWithProviders(<DashboardTable />)
  const row = await screen.findByText('https://a.com')
  expect(within(row.closest('tr')!).getByText('HTML 5')).toBeInTheDocument()
})
