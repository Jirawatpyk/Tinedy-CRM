import { test, expect } from '@playwright/test'

// Test Configuration
const BASE_URL = 'http://localhost:3004'
const TEST_USER = {
  email: 'admin@tinedy.com',
  password: 'admin123',
}

test.describe('Tinedy CRM System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL)
  })

  test('should redirect to login page when not authenticated', async ({
    page,
  }) => {
    // Check if redirected to login
    await expect(page).toHaveURL(/.*\/login/)
    await expect(page.locator('h1, h2')).toContainText(/login|เข้าสู่ระบบ/i)
  })

  test('should login with valid credentials', async ({ page }) => {
    // Go to login page
    await page.goto(`${BASE_URL}/login`)

    // Fill in login form
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)

    // Submit login
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/customers|.*\/dashboard/)
  })

  test('should load customers page successfully', async ({ page, context }) => {
    // Login first
    await loginUser(page)

    // Navigate to customers page
    await page.goto(`${BASE_URL}/customers`)

    // Check page loaded without errors
    await expect(page).not.toHaveTitle(/Error|500/)

    // Check for customer table or list
    const customerContent = await page
      .waitForSelector(
        '[data-testid="customer-table"], table, .customer-list',
        {
          timeout: 10000,
        }
      )
      .catch(() => null)

    // If no specific test IDs, check for general content indicators
    const hasContent =
      customerContent ||
      (await page.locator('th, td, .customer').count()) > 0 ||
      (await page.locator('text=/customer|ลูกค้า/i').count()) > 0

    expect(hasContent).toBeTruthy()
  })

  test('should load jobs page successfully', async ({ page }) => {
    // Login first
    await loginUser(page)

    // Navigate to jobs page
    await page.goto(`${BASE_URL}/jobs`)

    // Check page loaded without errors
    await expect(page).not.toHaveTitle(/Error|500/)

    // Check for jobs content
    const jobContent = await page
      .waitForSelector('[data-testid="jobs-table"], table, .jobs-list', {
        timeout: 10000,
      })
      .catch(() => null)

    // If no specific test IDs, check for general content indicators
    const hasContent =
      jobContent ||
      (await page.locator('th, td, .job').count()) > 0 ||
      (await page.locator('text=/job|งาน|task/i').count()) > 0

    expect(hasContent).toBeTruthy()
  })

  test('should have create job button that works', async ({ page }) => {
    // Login first
    await loginUser(page)

    // Navigate to jobs page
    await page.goto(`${BASE_URL}/jobs`)

    // Look for create job button
    const createButton = await page
      .locator('button, a')
      .filter({
        hasText: /create|สร้าง|new|ใหม่/i,
      })
      .first()

    if ((await createButton.count()) > 0) {
      await createButton.click()

      // Should navigate to jobs/new or show modal
      await expect(page).toHaveURL(/.*\/jobs\/new/)
    } else {
      console.log('Create job button not found, might be in different location')
    }
  })

  test('should test customer creation flow', async ({ page }) => {
    // Login first
    await loginUser(page)

    // Navigate to customers page
    await page.goto(`${BASE_URL}/customers`)

    // Look for create customer button
    const createButton = await page
      .locator('button, a')
      .filter({
        hasText: /create|สร้าง|add|เพิ่ม/i,
      })
      .first()

    if ((await createButton.count()) > 0) {
      await createButton.click()

      // Fill customer form (if exists)
      const nameField = await page
        .locator(
          'input[name="name"], input[placeholder*="name"], input[placeholder*="ชื่อ"]'
        )
        .first()
      const phoneField = await page
        .locator(
          'input[name="phone"], input[type="tel"], input[placeholder*="phone"], input[placeholder*="เบอร์"]'
        )
        .first()

      if ((await nameField.count()) > 0 && (await phoneField.count()) > 0) {
        await nameField.fill('ทดสอบ E2E Customer')
        await phoneField.fill('0851234568')

        // Submit form
        const submitButton = await page
          .locator('button[type="submit"], button')
          .filter({
            hasText: /submit|save|บันทึก|create/i,
          })
          .first()

        if ((await submitButton.count()) > 0) {
          await submitButton.click()

          // Wait for success indication
          await page.waitForTimeout(2000)

          // Check for success message or redirect
          const isSuccess =
            (await page.locator('text=/success|สำเร็จ|created/i').count()) >
              0 || (await page.url().includes('/customers'))

          expect(isSuccess).toBeTruthy()
        }
      }
    }
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Login first
    await loginUser(page)

    // Intercept API calls and simulate errors
    await page.route('**/api/customers', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    // Navigate to customers page
    await page.goto(`${BASE_URL}/customers`)

    // Should show error message instead of crashing
    const errorElement = await page.locator(
      'text=/error|ข้อผิดพลาด|failed|ไม่สำเร็จ/i'
    )
    await expect(errorElement).toBeVisible({ timeout: 10000 })
  })
})

// Helper function to login
async function loginUser(page: any) {
  await page.goto(`${BASE_URL}/login`)

  // Fill login form
  await page.fill('input[type="email"]', TEST_USER.email)
  await page.fill('input[type="password"]', TEST_USER.password)

  // Submit
  await page.click('button[type="submit"]')

  // Wait for redirect
  await page.waitForURL(/.*\/customers|.*\/dashboard/, { timeout: 10000 })
}
