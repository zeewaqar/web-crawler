import { test, expect } from '@playwright/test'

test('register → login → add url → detail page', async ({ page }) => {
  /* register */
  await page.goto('/register')
  await page.fill('input[type=email]', 'e2e@example.com')
  await page.fill('input[type=password]', 'secret')
  await page.click('button:text("Sign up")')

  /* login */
  await expect(page).toHaveURL(/dashboard$/)

  /* add url */
  await page.fill('input[placeholder^="https"]', 'https://example.com')
  await page.click('button:text("Add URL")')

  /* wait until crawl done (👀 progress cell becomes ✅) */
  await page.waitForSelector('tr:has-text("example.com") >> text=✅', {
    timeout: 30_000,
  })

  /* open detail */
  await page.click('tr:has-text("example.com") >> a')
  await expect(page).toHaveURL(/\/urls\/\d+$/)
  await expect(page.locator('text=Link breakdown')).toBeVisible()
})
