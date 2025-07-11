// client/cypress/e2e/registerLoginAddUrl.cy.ts
/// <reference types="cypress" />

describe('Register → Login → Dashboard → Add URL → Detail View', () => {
  const email    = `e2e+${Date.now()}@example.com`
  const password = 'secret'
  const TEST_URL = 'https://example.com/'

  it('full end-to-end flow', () => {
    // ── 1. Register ─────────────────────────────
    cy.visit('/register')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.get('button').contains(/register/i).click()
    cy.url().should('include', '/login')

    // ── 2. Login ────────────────────────────────
    cy.get('input[type="email"]')
      .clear()
      .type(email)
    cy.get('input[type="password"]')
      .clear()
      .type(password)
    cy.get('button').contains(/login/i).click()
    cy.url().should('include', '/dashboard')
    cy.contains('URL Dashboard')

    // ── 3. Count rows before adding ─────────────
    cy.get('table tbody tr').then(($rows) => {
      const before = $rows.length

      // ── 4. Add URL ────────────────────────────
      cy.get('input[placeholder^="https"]')
        .clear()
        .type(TEST_URL)
      cy.get('button').contains(/^add url$/i).click()

      // ── 5. Wait for new row and click its Title link ─────
      cy.get('table tbody tr', { timeout: 10_000 })
        .should('have.length.greaterThan', before)
        .last()
        .within(() => {
          // Title link is the second <a> in the row
          cy.get('a').eq(1).click()
        })
    })

    // ── 6. Detail page checks ──────────────────
    cy.url().should('match', /\/urls\/\d+$/)
    cy.contains('Link breakdown')
    cy.contains('No broken links')
    cy.contains('HTML version:')
    cy.contains('Headings:')
    cy.contains('Login form:')
  })
})
