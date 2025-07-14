// client/cypress/e2e/addMultipleSites.cy.ts
/// <reference types="cypress" />

describe('Add 21 sites and verify pagination', () => {
  const email    = `e2e+${Date.now()}@example.com`
  const password = 'secret'

  before(() => {
    // Register & login once
    cy.visit('/register')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.contains('button', /register/i).click()
    cy.url().should('include', '/login')

    cy.get('input[type="email"]').clear().type(email)
    cy.get('input[type="password"]').clear().type(password)
    cy.contains('button', /log in/i).click()
    cy.url().should('include', '/dashboard')
  })

  it('adds 21 unique URLs and checks they all show up', () => {
    cy.intercept('POST', '/api/v1/urls').as('postUrl')
    cy.intercept('GET', '/api/v1/urls*').as('getList')

    // add 21 URLs
    for (let i = 1; i <= 21; i++) {
      const url = `https://example.com/page-${i}`

      // type and submit
      cy.get('input[placeholder^="https"]').clear().type(url)
      cy.contains(/^Add URL to Queue$/i).click()

      // wait for network cycle
      cy.wait('@postUrl')
      cy.wait('@getList')
    }

    // now we have at least 21 rows in total
    // page 1 shows 20 rows
    cy.get('table tbody tr').should('have.length', 20)

    // click to page 2
    cy.contains('Next').click()
    cy.contains(/Showing page 2/i).should('be.visible')

    // on page 2 there should be at least 1 row (the 21st)
    cy.get('table tbody tr').should('have.length.at.least', 1)

    // spot‐check that page-21 is present
    cy.get('table tbody tr').last().should('contain.text', 'page-21')
  })
})
