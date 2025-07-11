import { test, expect, request } from '@playwright/test'

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const BACKEND       = 'http://localhost:8080'               // Go API
const FIXTURE_URL   = 'http://localhost:3000/fixtures/page.html'
const FIXTURE_TITLE = 'Playwright Fixture'                  // <title> text
const USER          = { email: 'e2e@example.com', password: 'secret' }

/* Tiny HTML the crawler will receive (intercepted) */
const HTML = /* html */ `<!doctype html>
<title>${FIXTURE_TITLE}</title>
<h1>ok</h1>
<a href="/internal">Int</a>
<a href="https://x.com">Ext</a>
<form><input type="password"></form>`


/* ------------------------------------------------------------------ */
/* Helper: obtain JWT (register if absent)                             */
/* ------------------------------------------------------------------ */

async function getToken() {
  const api = await request.newContext({ baseURL: BACKEND })
  await api.post('/api/v1/register', { data: USER }).catch(() => {})
  const res = await api.post('/api/v1/login', { data: USER })
  expect(res.ok()).toBeTruthy()
  const { token } = await res.json()
  return token as string
}


/* ------------------------------------------------------------------ */
/* Happy-path E2E                                                      */
/* ------------------------------------------------------------------ */

test('add url → detail page (authenticated)', async ({ browser }) => {
  /* ---- authenticate via API, inject JWT ---- */
  const jwt = await getToken()

  const context = await browser.newContext()
  await context.addInitScript(([tok]) => {
    localStorage.setItem('jwt', tok as string)
  }, [jwt])

  /* ---- intercept crawler’s GET for the fixture ---- */
  await context.route(FIXTURE_URL, route =>
    route.fulfill({ status: 200, contentType: 'text/html', body: HTML }),
  )

  const page = await context.newPage()
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/dashboard$/)

  /* ---- add URL ---- */
  await page.fill('input[placeholder^="https"]', FIXTURE_URL)
  await page.click('button:has-text("Add URL")')

  /* ---- wait until crawl completes (✅) ---- */
  await page.waitForSelector(
    `tr:has-text("${FIXTURE_TITLE}") >> text=✅`,
    { timeout: 25_000 },
  )

  /* ---- open detail page ---- */
  await page.click(`tr:has-text("${FIXTURE_TITLE}") a`)
  await expect(page.locator('text=Link breakdown')).toBeVisible()

  await context.close()
})