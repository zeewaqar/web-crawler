import { http, HttpResponse } from 'msw'           // v2 helpers
import { setupServer }    from 'msw/node'
import user               from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'

import { AddUrlForm }        from '../AddUrlForm'
import { renderWithProviders } from '../../../../../vitest.setup'
import { apiBase }            from '@/features/urls/api'

/* ─── Mock server (v2) ─────────────────────────────────────────── */
const server = setupServer(
  http.post(`${apiBase()}/api/v1/urls`, () => new HttpResponse(null, { status: 202 })),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(()  => server.close())

/* ─── Test ─────────────────────────────────────────────────────── */
test('adds url and clears input', async () => {
  renderWithProviders(<AddUrlForm />)

  await user.type(screen.getByRole('textbox'), 'https://x.com')
  await user.click(screen.getByRole('button', { name: /add url/i }))

  await waitFor(() =>
    expect(screen.getByRole('textbox')).toHaveValue(''),
  )
})
