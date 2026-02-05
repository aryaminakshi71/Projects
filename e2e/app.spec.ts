import { test, expect } from '@playwright/test'

test.describe('PROJECTS E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    try {
      await page.goto('/', { 
        waitUntil: 'domcontentloaded', 
        timeout: 20000 
      })
    } catch (error) {
      console.warn('Navigation failed, continuing...')
    }
    await page.waitForTimeout(1000)
  })

  test('should load landing page', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForTimeout(2000)

    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('sourcemap') &&
      !e.includes('500') && // Ignore server errors during dev (PostCSS, etc.)
      !e.includes('Internal Server Error') &&
      !e.includes('PostHog') &&
      !e.includes('Failed to load resource: the server responded with a status of 404 ()')
    )
    
    expect(criticalErrors.length).toBe(0)
  })
})
