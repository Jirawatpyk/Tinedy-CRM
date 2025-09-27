import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the login page
    await page.goto('/login')
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access dashboard without being logged in
    await page.goto('/')

    // Should be redirected to login page
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h2')).toContainText('Tinedy CRM')
  })

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    // Enter invalid email
    await page.fill('input[id="email"]', 'invalid-email')
    await page.fill('input[id="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should show email validation error
    await expect(
      page.locator('text=Please enter a valid email address')
    ).toBeVisible()
  })

  test('should show error for weak password', async ({ page }) => {
    // Enter weak password
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="password"]', '123') // Too short
    await page.click('button[type="submit"]')

    // Should show password validation error
    await expect(
      page.locator('text=Password must be at least 6 characters')
    ).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Enter invalid credentials
    await page.fill('input[id="email"]', 'nonexistent@example.com')
    await page.fill('input[id="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show authentication error
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should show loading state during authentication', async ({ page }) => {
    // Fill form and submit
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="password"]', 'password123')

    // Submit form and check for loading state
    await page.click('button[type="submit"]')

    // Button should show loading text and be disabled
    await expect(page.locator('button[type="submit"]')).toContainText(
      'Signing in...'
    )
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })

  test('should handle rate limiting', async ({ page }) => {
    // Make multiple failed login attempts to trigger rate limiting
    for (let i = 0; i < 6; i++) {
      await page.fill('input[id="email"]', 'test@example.com')
      await page.fill('input[id="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      // Wait for the request to complete
      await page.waitForLoadState('networkidle')

      // Clear the form for next attempt
      await page.fill('input[id="email"]', '')
      await page.fill('input[id="password"]', '')
    }

    // After multiple failed attempts, should see rate limit error
    // Note: This test might need adjustment based on actual rate limit implementation
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should see rate limit error (this might need to be adjusted based on how errors are displayed)
    await expect(
      page.locator('text=Too many authentication attempts')
    ).toBeVisible({ timeout: 10000 })
  })

  // This test would require a valid test user in the database
  test.skip('should successfully login and redirect to dashboard', async ({
    page,
  }) => {
    // This test is skipped because it requires:
    // 1. A test database with known user credentials
    // 2. The application to be running in test mode

    // Enter valid credentials
    await page.fill('input[id="email"]', 'admin@tinedy.com')
    await page.fill('input[id="password"]', 'validpassword123')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Dashboard')).toBeVisible()

    // Should be able to access protected routes
    await page.goto('/customers')
    await expect(page).toHaveURL('/customers')
  })

  test('should maintain form state during validation', async ({ page }) => {
    // Fill partial form
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="password"]', '123') // Invalid password

    // Submit to trigger validation
    await page.click('button[type="submit"]')

    // Email should remain filled while password shows error
    await expect(page.locator('input[id="email"]')).toHaveValue(
      'test@example.com'
    )
    await expect(
      page.locator('text=Password must be at least 6 characters')
    ).toBeVisible()
  })
})
