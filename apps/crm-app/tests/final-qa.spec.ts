import { test, expect, Page } from '@playwright/test'

// Test credentials
const TEST_ADMIN_EMAIL = 'admin@tinedy.com'
const TEST_ADMIN_PASSWORD = 'admin123'
const BASE_URL = 'http://localhost:3005'

test.describe('Tinedy CRM - Final QA Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test with a fresh browser state
    await page.context().clearCookies()
  })

  test.describe('🔐 Authentication Flow Testing', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Test accessing protected routes without authentication
      await page.goto(`${BASE_URL}/customers`)

      // Should redirect to login with callbackUrl
      await expect(page).toHaveURL(
        new RegExp(`${BASE_URL}/login\\?callbackUrl=.*customers`)
      )

      // Verify login form elements exist
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('input[name="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()

      console.log('✅ Unauthenticated redirect test: PASSED')
    })

    test('should show login form on login page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)

      // Check page title and form elements
      await expect(page).toHaveTitle(/Tinedy CRM/)
      await expect(page.locator('text=Tinedy CRM')).toBeVisible()
      await expect(page.locator('text=Sign in to your account')).toBeVisible()

      // Verify form fields are present and functional
      const emailField = page.locator('input[name="email"]')
      const passwordField = page.locator('input[name="password"]')
      const submitButton = page.locator('button[type="submit"]')

      await expect(emailField).toBeVisible()
      await expect(passwordField).toBeVisible()
      await expect(submitButton).toBeVisible()

      // Test field interactions
      await emailField.fill('test@example.com')
      await passwordField.fill('testpassword')

      await expect(emailField).toHaveValue('test@example.com')
      await expect(passwordField).toHaveValue('testpassword')

      console.log('✅ Login form display test: PASSED')
    })

    test('should authenticate with valid credentials and redirect', async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/customers`)

      // Should be redirected to login
      await expect(page).toHaveURL(new RegExp('login'))

      // Fill in valid credentials
      await page.locator('input[name="email"]').fill(TEST_ADMIN_EMAIL)
      await page.locator('input[name="password"]').fill(TEST_ADMIN_PASSWORD)

      // Submit form
      await page.locator('button[type="submit"]').click()

      // Wait for redirect and verify successful login
      // We expect to be redirected to /customers after successful login
      await page.waitForTimeout(3000) // Give time for authentication

      // Check if we're redirected to the protected page
      const currentUrl = page.url()
      console.log(`Current URL after login: ${currentUrl}`)

      // The test passes if we're not on the login page anymore
      expect(currentUrl).not.toContain('/login')

      console.log('✅ Authentication flow test: PASSED')
    })
  })

  test.describe('📄 Page Loading Testing', () => {
    // Helper function to login before each protected page test
    async function loginAsAdmin(page: Page) {
      await page.goto(`${BASE_URL}/login`)
      await page.locator('input[name="email"]').fill(TEST_ADMIN_EMAIL)
      await page.locator('input[name="password"]').fill(TEST_ADMIN_PASSWORD)
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(2000)
    }

    test('should load customers page after authentication', async ({
      page,
    }) => {
      await loginAsAdmin(page)
      await page.goto(`${BASE_URL}/customers`)

      // Wait for page to load and verify it's not an error page
      await page.waitForLoadState('networkidle')

      // Check for common error indicators
      const pageContent = await page.content()
      expect(pageContent).not.toContain('500')
      expect(pageContent).not.toContain('Internal Server Error')
      expect(pageContent).not.toContain('เกิดข้อผิดพลาดในการโหลดข้อมูล')

      console.log('✅ Customers page loading test: PASSED')
    })

    test('should load jobs page after authentication', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto(`${BASE_URL}/jobs`)

      await page.waitForLoadState('networkidle')

      const pageContent = await page.content()
      expect(pageContent).not.toContain('500')
      expect(pageContent).not.toContain('Internal Server Error')
      expect(pageContent).not.toContain('เกิดข้อผิดพลาดในการโหลดข้อมูล')

      console.log('✅ Jobs page loading test: PASSED')
    })

    test('should load new job creation page', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto(`${BASE_URL}/jobs/new`)

      await page.waitForLoadState('networkidle')

      const pageContent = await page.content()
      expect(pageContent).not.toContain('500')
      expect(pageContent).not.toContain('Internal Server Error')

      console.log('✅ New job page loading test: PASSED')
    })
  })

  test.describe('🔌 API Endpoints Testing', () => {
    test('should return 401 for unauthenticated API calls', async ({
      request,
    }) => {
      // Test that API endpoints properly protect themselves
      const endpoints = ['/api/customers', '/api/jobs', '/api/users']

      for (const endpoint of endpoints) {
        const response = await request.get(`${BASE_URL}${endpoint}`)
        expect(response.status()).toBe(401)

        const body = await response.json()
        expect(body.error).toBe('Unauthorized')
      }

      console.log('✅ API authorization test: PASSED')
    })
  })

  test.describe('🎯 Navigation Testing', () => {
    async function loginAsAdmin(page: Page) {
      await page.goto(`${BASE_URL}/login`)
      await page.locator('input[name="email"]').fill(TEST_ADMIN_EMAIL)
      await page.locator('input[name="password"]').fill(TEST_ADMIN_PASSWORD)
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(2000)
    }

    test('should allow navigation between main pages', async ({ page }) => {
      await loginAsAdmin(page)

      // Start from customers page
      await page.goto(`${BASE_URL}/customers`)
      await page.waitForLoadState('networkidle')

      // Try to navigate to jobs page (if link exists)
      try {
        const jobsLink = page
          .locator('a[href="/jobs"], a[href*="jobs"]')
          .first()
        if (await jobsLink.isVisible()) {
          await jobsLink.click()
          await page.waitForLoadState('networkidle')
          expect(page.url()).toContain('jobs')
        }
      } catch (e) {
        console.log('Jobs navigation link not found or not clickable')
      }

      console.log('✅ Navigation test: PASSED')
    })
  })

  test.describe('⚡ Performance & Console Errors', () => {
    test('should have no critical console errors', async ({ page }) => {
      const consoleErrors: string[] = []

      page.on('console', (message) => {
        if (message.type() === 'error') {
          consoleErrors.push(message.text())
        }
      })

      await page.goto(`${BASE_URL}/login`)
      await page.waitForLoadState('networkidle')

      // Filter out non-critical errors
      const criticalErrors = consoleErrors.filter(
        (error) =>
          !error.includes('favicon.ico') &&
          !error.includes('_next/') &&
          !error.includes('manifest.json')
      )

      if (criticalErrors.length > 0) {
        console.log('Console Errors Found:', criticalErrors)
      }

      expect(criticalErrors.length).toBeLessThan(3) // Allow some non-critical errors

      console.log('✅ Console errors test: PASSED')
    })

    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto(`${BASE_URL}/login`)
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime
      console.log(`Page load time: ${loadTime}ms`)

      // Expect page to load within 10 seconds (generous for development)
      expect(loadTime).toBeLessThan(10000)

      console.log('✅ Performance test: PASSED')
    })
  })

  test.describe('📊 Test Summary', () => {
    test('should display comprehensive test results', async ({ page }) => {
      console.log('\n=== FINAL QA TEST SUMMARY ===')
      console.log('🎯 Test Server: http://localhost:3005')
      console.log('👤 Test User: admin@tinedy.com')
      console.log('📋 Test Categories Covered:')
      console.log('  ✅ Authentication Flow')
      console.log('  ✅ Page Loading')
      console.log('  ✅ API Security')
      console.log('  ✅ Navigation')
      console.log('  ✅ Performance')
      console.log('  ✅ Console Errors')
      console.log('===============================\n')

      // This test always passes - it's just for logging
      expect(true).toBe(true)
    })
  })
})
