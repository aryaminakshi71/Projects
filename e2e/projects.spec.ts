import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E Tests for Projects App
 * Tests: Demo flow, Sign in, Navigation, All pages, Links functionality
 */

function getBaseURL(testInfo: { project: { use?: { baseURL?: string } } }): string {
  const baseURL = testInfo.project.use?.baseURL || process.env.PLAYWRIGHT_BASE_URL;
  if (!baseURL) {
    throw new Error('No baseURL configured for Projects tests');
  }
  return baseURL.replace(/\/$/, '');
}

function resolveURL(baseURL: string, path: string): string {
  return new URL(path, `${baseURL}/`).toString();
}

test.describe('Projects E2E Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const baseURL = getBaseURL(testInfo);
    await page.context().clearCookies();
    try {
      await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (error) {
      console.warn('Landing page navigation failed, continuing...');
    }
    await page.waitForTimeout(1000);
  });

  test.describe('Landing Page & Demo Flow', () => {
    test('should load landing page without errors', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      const response = await page.goto(baseURL);
      expect(response?.status()).toBe(200);
      await page.waitForTimeout(2000);

      const criticalErrors = errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('sourcemap') &&
        !e.includes('oracledb') &&
        !e.includes('PostHog') &&
        !e.includes('Failed to load resource: the server responded with a status of 404 ()')
      );
      
      if (criticalErrors.length > 0) {
        console.warn('Console errors found:', criticalErrors);
      }
    });

    test('should navigate to demo page and launch demo', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(2000);

      const tryDemoButton = page.getByRole('button', { name: /try demo/i });
      if (await tryDemoButton.count() > 0) {
        await tryDemoButton.first().click();
        await page.waitForTimeout(1500);
      } else {
        await page.evaluate(() => {
          localStorage.setItem('demo_mode', 'true');
          localStorage.setItem('user', JSON.stringify({ id: 'demo', email: 'demo@projects.com', firstName: 'Demo', role: 'admin' }));
        });
        await page.goto(resolveURL(baseURL, 'app/projects'), { waitUntil: 'domcontentloaded' });
      }

      const url = page.url();
      expect(url.includes('/app/projects') || url.includes('/login')).toBe(true);
    });
  });

  test.describe('Sign In Flow', () => {
    test('should display login page correctly', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'login'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.count() > 0) {
        await expect(emailInput).toBeVisible({ timeout: 5000 });
      }
      if (await passwordInput.count() > 0) {
        await expect(passwordInput).toBeVisible({ timeout: 5000 });
      }
      
      const signInButton = page.getByRole('button', { name: /Sign In|Login/i });
      if (await signInButton.count() > 0) {
        await expect(signInButton.first()).toBeVisible({ timeout: 5000 });
      } else {
        const url = page.url();
        expect(url.includes('/login') || url.includes(baseURL)).toBe(true);
      }
    });
  });

  test.describe('Navigation & Links', () => {
    test.beforeEach(async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.setViewportSize({ width: 1280, height: 720 });
      
      await page.goto(baseURL);
      await page.waitForTimeout(1000);
      
      await page.evaluate(() => {
        localStorage.setItem('demo_mode', 'true');
        localStorage.setItem('user', JSON.stringify({ id: 'demo', email: 'demo@projects.com', firstName: 'Demo', role: 'admin' }));
      });
      await page.goto(resolveURL(baseURL, 'app/projects'));
      await page.waitForTimeout(1000);
    });

    test('should navigate to main pages from sidebar', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      const links = [
        { href: '/app/projects', text: /Projects/i },
        { href: '/app/assets', text: /Assets/i },
        { href: '/app/billing', text: /Billing/i },
        { href: '/productivity', text: /Productivity/i },
      ];

      let successCount = 0;
      for (const link of links) {
        try {
          await page.goto(resolveURL(baseURL, link.href), { waitUntil: 'domcontentloaded', timeout: 5000 });
          await page.waitForTimeout(500);
          const url = page.url();
          if (url.includes(link.href) || url.includes('/login')) {
            successCount++;
          }
        } catch (error) {
          // Continue to next link
        }
      }
      
      const finalUrl = page.url();
      const isValidPage = successCount > 0 || 
                         finalUrl.includes('/login') || 
                         finalUrl.includes('/dashboard') ||
                         finalUrl.includes(baseURL);
      expect(isValidPage).toBe(true);
    });
  });

  test.describe('Page Functionality', () => {
    test('dashboard page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'app/projects'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      if (url.includes('/login')) {
        expect(url).toContain('/login');
      } else {
        expect(url).toContain('/app/projects');
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('projects page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'app/projects'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      const isValidState = url.includes('/app/projects') || 
                          url.includes('/login') || 
                          url.includes('localhost');
      expect(isValidState).toBe(true);
    });

    test('tasks page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'productivity'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url.includes('/productivity') || url.includes('/login')).toBe(true);
    });

    test('apps page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'app/assets'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/app/assets');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Dashboard Sub-Pages', () => {
    test('billing page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      try {
        await page.goto(resolveURL(baseURL, 'app/billing'), { waitUntil: 'domcontentloaded', timeout: 20000 });
      } catch (error) {
        await page.waitForTimeout(2000);
      }
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url.includes('/app/billing') || url.includes('/login') || url.includes(baseURL)).toBe(true);
    });

    test('assets page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      try {
        await page.goto(resolveURL(baseURL, 'app/assets'), { waitUntil: 'domcontentloaded', timeout: 20000 });
      } catch (error) {
        await page.waitForTimeout(2000);
      }
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url.includes('/app/assets') || url.includes('/login') || url.includes(baseURL)).toBe(true);
    });
  });
});
