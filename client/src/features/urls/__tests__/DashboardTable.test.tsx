import DashboardTable from '../DashboardTable'
import { fetchUrls } from '../api'
import { vi } from 'vitest'
import { renderWithProviders } from '../../../../vitest.setup'
import { screen, within } from '@testing-library/react'

vi.mock('../api')
;(fetchUrls as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
  total: 1,
  data: [
    {
      id: 1,
      title: null,
      original_url: 'https://a.com',
      crawl_status: 'done',
      html_version: 'HTML 5',
      internal_links: 0,
      external_links: 0,
      broken_links: 0,
    },
  ],
})

test('shows row', async () => {
  renderWithProviders(<DashboardTable />)
  // find all nodes showing the URL text
  const links = await screen.findAllByText('https://a.com')
  // pick the one whose href is the external URL itself
  const externalLink = links.find(
    (node): node is HTMLAnchorElement =>
      node instanceof HTMLAnchorElement && node.href === 'https://a.com/'
  )
  expect(externalLink).toBeDefined()
  // now get its row and assert the HTML version cell is present
  const row = externalLink!.closest('tr')
  expect(row).toBeTruthy()
  expect(within(row!).getByText('HTML 5')).toBeInTheDocument()
})
