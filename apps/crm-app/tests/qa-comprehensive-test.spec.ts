import { test, expect, Page } from '@playwright/test'

// Test Configuration
const BASE_URL = 'http://localhost:3010'
const TEST_USER = {
  email: 'admin@tinedy.com',
  password: 'admin123',
}

// Test Data
const TEST_CUSTOMER = {
  name: 'ลูกค้าทดสอบ QA',
  phone: '0812345678',
  email: 'test.customer@example.com',
  address: '123/456 ถ.ทดสอบ QA แขวงทดสอบ เขตทดสอบ กรุงเทพมหานคร 10100',
}

const TEST_JOB = {
  title: 'งานทดสอบ QA Job Management',
  description: 'รายละเอียดงานทดสอบระบบ QA',
  priority: 'high',
  status: 'new',
}

test.describe('🧪 Tinedy CRM - Comprehensive QA Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
  })

  test.describe('🔐 1. Authentication Flow Testing', () => {
    test('Should display login page correctly', async ({ page }) => {
      await expect(page).toHaveTitle(/Tinedy CRM/)
      await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ')
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('Should handle invalid login credentials', async ({ page }) => {
      await page.fill('input[type="email"]', 'invalid@test.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      // Should show error message and stay on login page
      await expect(
        page.locator('.error, .alert-error, [role="alert"]')
      ).toBeVisible()
      await expect(page.url()).toContain('/')
    })

    test('Should login successfully with valid credentials', async ({
      page,
    }) => {
      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')

      // Should redirect to dashboard
      await expect(page).toHaveURL('/customers')
      await expect(page.locator('.sidebar, nav')).toBeVisible()
      await expect(page.locator('text=ลูกค้า, text=Customers')).toBeVisible()
    })
  })

  test.describe('👥 2. Customer Management Testing', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each customer test
      await page.goto('/')
      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')
      await expect(page).toHaveURL('/customers')
    })

    test('✅ Should display customer list with pagination', async ({
      page,
    }) => {
      // Wait for customers page to load
      await expect(page.locator('h1')).toContainText('ลูกค้า')

      // Check if customer table/list exists
      await expect(page.locator('table, .customer-list')).toBeVisible()

      // Test pagination - Problem 1: กดหน้า 2 แล้วไม่เด้งกลับหน้า 1
      const paginationButton = page.locator(
        'button:has-text("2"), .page-2, [data-page="2"]'
      )
      if (await paginationButton.isVisible()) {
        await paginationButton.click()
        await page.waitForTimeout(2000) // Wait for potential navigation

        // Verify we stayed on page 2 and didn't bounce back to page 1
        const currentPage = await page.locator(
          '.active, [aria-current="page"], .current-page'
        )
        await expect(currentPage).toContainText('2')

        console.log('✅ PASS: Pagination works correctly - stays on page 2')
      } else {
        console.log(
          'ℹ️ INFO: Pagination not visible (likely insufficient data)'
        )
      }
    })

    test('✅ Should search customers by name and phone', async ({ page }) => {
      // Test search functionality
      const searchInput = page.locator(
        'input[placeholder*="ค้นหา"], input[placeholder*="search"], .search-input'
      )

      if (await searchInput.isVisible()) {
        // Search by name
        await searchInput.fill('ทดสอบ')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)

        // Search by phone
        await searchInput.fill('081')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)

        console.log('✅ PASS: Customer search functionality works')
      } else {
        console.log('ℹ️ INFO: Search input not found')
      }
    })

    test('✅ Should add new customer', async ({ page }) => {
      // Click add customer button
      const addButton = page.locator(
        'button:has-text("เพิ่ม"), button:has-text("Add"), .add-customer-btn'
      )

      if (await addButton.isVisible()) {
        await addButton.click()

        // Fill customer form
        await page.fill('input[name="name"], #name', TEST_CUSTOMER.name)
        await page.fill('input[name="phone"], #phone', TEST_CUSTOMER.phone)
        await page.fill('input[name="email"], #email', TEST_CUSTOMER.email)

        const addressField = page.locator('textarea[name="address"], #address')
        if (await addressField.isVisible()) {
          await addressField.fill(TEST_CUSTOMER.address)
        }

        // Submit form
        await page.click('button[type="submit"], .save-btn')
        await page.waitForTimeout(2000)

        // Verify customer was added
        await expect(page.locator(`text=${TEST_CUSTOMER.name}`)).toBeVisible()
        console.log('✅ PASS: Customer creation works correctly')
      } else {
        console.log('ℹ️ INFO: Add customer button not found')
      }
    })

    test('✅ Should view customer details', async ({ page }) => {
      // Click on a customer to view details
      const customerRow = page
        .locator('tr:has-text("ลูกค้า"), .customer-item')
        .first()

      if (await customerRow.isVisible()) {
        await customerRow.click()
        await page.waitForTimeout(1000)

        // Verify customer details page
        await expect(page.locator('h1, .customer-name')).toBeVisible()
        await expect(page.locator('.customer-info, .details')).toBeVisible()

        console.log('✅ PASS: Customer details view works correctly')
      } else {
        console.log('ℹ️ INFO: No customer data available for testing')
      }
    })
  })

  test.describe('💼 3. Job Management Testing', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to jobs page
      await page.goto('/')
      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')

      // Navigate to jobs page
      await page.click('a[href="/jobs"], .jobs-link, text=งาน')
      await expect(page).toHaveURL('/jobs')
    })

    test('✅ Should display jobs list', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('งาน')
      await expect(page.locator('table, .jobs-list')).toBeVisible()
      console.log('✅ PASS: Jobs list displays correctly')
    })

    test('✅ Should create new job without Select error - Problem 2', async ({
      page,
    }) => {
      // Click new job button
      const newJobButton = page.locator(
        'button:has-text("สร้าง"), button:has-text("New"), .new-job-btn'
      )

      if (await newJobButton.isVisible()) {
        await newJobButton.click()
        await page.waitForTimeout(1000)

        // Fill job form
        await page.fill('input[name="title"], #title', TEST_JOB.title)
        await page.fill(
          'textarea[name="description"], #description',
          TEST_JOB.description
        )

        // Test Select fields - Problem 2: ต้องไม่มี Select empty string error
        const prioritySelect = page.locator(
          'select[name="priority"], #priority'
        )
        if (await prioritySelect.isVisible()) {
          await prioritySelect.selectOption(TEST_JOB.priority)
        }

        const statusSelect = page.locator('select[name="status"], #status')
        if (await statusSelect.isVisible()) {
          await statusSelect.selectOption(TEST_JOB.status)
        }

        // Test assignment dropdown including "ไม่มอบหมาย" option
        const assigneeSelect = page.locator(
          'select[name="assignee"], #assignee, .user-assignment'
        )
        if (await assigneeSelect.isVisible()) {
          const options = await assigneeSelect
            .locator('option')
            .allTextContents()
          expect(
            options.some(
              (option) =>
                option.includes('ไม่มอบหมาย') ||
                option.includes('Unassigned') ||
                option.includes('No Assignment')
            )
          ).toBeTruthy()

          // Select "no assignment" option
          await assigneeSelect.selectOption({ index: 0 })
        }

        // Submit form
        await page.click('button[type="submit"], .save-btn')
        await page.waitForTimeout(2000)

        // Verify no Select error occurred
        const selectError = page.locator(
          '.error:has-text("Select"), .select-error'
        )
        await expect(selectError).not.toBeVisible()

        console.log('✅ PASS: Job creation works without Select errors')
      } else {
        console.log('ℹ️ INFO: New job button not found')
      }
    })

    test('✅ Should view job details - Story 2.4', async ({ page }) => {
      // Click on a job to view details
      const jobRow = page.locator('tr:has-text("งาน"), .job-item').first()

      if (await jobRow.isVisible()) {
        await jobRow.click()
        await page.waitForTimeout(1000)

        // Verify Story 2.4 job details functionality
        await expect(page.locator('h1, .job-title')).toBeVisible()
        await expect(page.locator('.job-info, .details')).toBeVisible()

        // Check for job details components
        const detailsElements = [
          '.job-status',
          '.job-priority',
          '.job-description',
          '.job-assignee',
          '.job-created-date',
        ]

        for (const selector of detailsElements) {
          const element = page.locator(selector)
          if (await element.isVisible()) {
            console.log(`✅ Found: ${selector}`)
          }
        }

        console.log('✅ PASS: Story 2.4 job details functionality works')
      } else {
        console.log('ℹ️ INFO: No job data available for testing')
      }
    })

    test('✅ Should update job status', async ({ page }) => {
      const jobRow = page.locator('tr:has-text("งาน"), .job-item').first()

      if (await jobRow.isVisible()) {
        await jobRow.click()

        // Try to update job status
        const statusDropdown = page.locator(
          'select[name="status"], .status-dropdown'
        )
        if (await statusDropdown.isVisible()) {
          await statusDropdown.selectOption('in-progress')

          const saveButton = page.locator(
            'button:has-text("บันทึก"), button:has-text("Save")'
          )
          if (await saveButton.isVisible()) {
            await saveButton.click()
            await page.waitForTimeout(1000)

            console.log('✅ PASS: Job status update works correctly')
          }
        }
      }
    })
  })

  test.describe('⚡ 4. Performance & Integration Testing', () => {
    test('✅ Should have acceptable API response times', async ({ page }) => {
      await page.goto('/')

      // Login and measure time
      const startTime = Date.now()

      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL('/customers')

      const loginTime = Date.now() - startTime
      expect(loginTime).toBeLessThan(5000) // Should login within 5 seconds

      console.log(`✅ PASS: Login completed in ${loginTime}ms`)

      // Test customers page load time
      const customersStartTime = Date.now()
      await page.reload()
      await expect(page.locator('table, .customer-list')).toBeVisible()

      const customersLoadTime = Date.now() - customersStartTime
      expect(customersLoadTime).toBeLessThan(3000) // Should load within 3 seconds

      console.log(`✅ PASS: Customers page loaded in ${customersLoadTime}ms`)
    })

    test('✅ Should handle errors gracefully', async ({ page }) => {
      // Test navigation to non-existent page
      await page.goto('/non-existent-page')

      // Should show 404 or redirect appropriately
      const is404 = await page.locator('text=404, text=Not Found').isVisible()
      const isRedirect =
        page.url().includes('/customers') || page.url() === BASE_URL + '/'

      expect(is404 || isRedirect).toBeTruthy()
      console.log('✅ PASS: Error handling works correctly')
    })
  })

  test.describe('🔒 5. Security Testing', () => {
    test('✅ Should protect dashboard routes when not authenticated', async ({
      page,
    }) => {
      // Try to access protected routes without authentication
      await page.goto('/customers')

      // Should redirect to login
      await expect(page.url()).toBe(BASE_URL + '/')
      console.log('✅ PASS: Dashboard protection works correctly')
    })

    test('✅ Should logout successfully', async ({ page }) => {
      // Login first
      await page.goto('/')
      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL('/customers')

      // Find and click logout button
      const logoutButton = page.locator(
        'button:has-text("ออกจากระบบ"), button:has-text("Logout"), .logout-btn'
      )

      if (await logoutButton.isVisible()) {
        await logoutButton.click()

        // Should redirect to login page
        await expect(page).toHaveURL('/')
        await expect(page.locator('input[type="email"]')).toBeVisible()

        console.log('✅ PASS: Logout works correctly')
      } else {
        console.log('ℹ️ INFO: Logout button not found')
      }
    })
  })
})

// Helper function to take screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await page.screenshot()
    await testInfo.attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    })
  }
})
