import { test, expect } from '@playwright/test'

test.describe('Customer Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for admin user
    await page.route('/api/auth/**', async (route) => {
      if (route.request().url().includes('/session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: '1',
              email: 'admin@test.com',
              name: 'Test Admin',
              role: 'ADMIN',
            },
          }),
        })
      } else {
        await route.continue()
      }
    })

    // Mock customer API responses
    await page.route('/api/customers*', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      if (method === 'GET' && url.includes('/api/customers?')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            customers: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalCount: 0,
              limit: 10,
              hasNextPage: false,
              hasPrevPage: false,
            },
            filters: {
              query: null,
              status: null,
              sortBy: 'createdAt',
              sortOrder: 'desc',
            },
          }),
        })
      } else if (method === 'POST' && url.includes('/api/customers')) {
        const body = await route.request().postDataJSON()
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-customer-id',
            name: body.name,
            phone: body.phone,
            address: body.address,
            contactChannel: body.contactChannel,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        })
      } else {
        await route.continue()
      }
    })
  })

  test('should complete full customer creation workflow', async ({ page }) => {
    // Navigate to customers page
    await page.goto('/customers')
    await expect(page.getByText('Customer Management')).toBeVisible()

    // Click "Add New Customer" button
    await page.getByText('Add New Customer').click()
    await expect(page).toHaveURL('/customers/new')

    // Verify page title
    await expect(page.getByText('Add New Customer')).toBeVisible()
    await expect(page.getByText('Create a new customer record')).toBeVisible()

    // Fill out the form
    await page.getByLabel('Name *').fill('สมชาย ทดสอบ')
    await page.getByLabel('Phone Number *').fill('0812345678')
    await page.getByLabel('Contact Channel *').fill('LINE')
    await page.getByLabel('Address').fill('123 ถนนทดสอบ กรุงเทพฯ')

    // Submit form
    await page.getByText('Create Customer').click()

    // Should show loading state
    await expect(page.getByTestId('loading-spinner')).toBeVisible()

    // Should redirect to customers list after success
    await expect(page).toHaveURL('/customers')

    // Verify success message or customer appears in list
    await expect(page.getByText('สมชาย ทดสอบ')).toBeVisible()
  })

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('/customers/new')

    // Try to submit empty form
    await page.getByText('Create Customer').click()

    // Should show validation errors
    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Phone number is required')).toBeVisible()
    await expect(page.getByText('Contact channel is required')).toBeVisible()
  })

  test('should handle server errors gracefully', async ({ page }) => {
    // Mock server error
    await page.route('/api/customers', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/customers/new')

    // Fill out form
    await page.getByLabel('Name *').fill('Test Customer')
    await page.getByLabel('Phone Number *').fill('0812345678')
    await page.getByLabel('Contact Channel *').fill('LINE')

    // Submit form
    await page.getByText('Create Customer').click()

    // Should show error message
    await expect(page.getByText('Internal server error')).toBeVisible()
  })

  test('should handle phone number uniqueness validation', async ({ page }) => {
    // Mock phone uniqueness error
    await page.route('/api/customers', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Validation failed',
            errors: { phone: 'Phone number already exists' },
          }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/customers/new')

    // Fill out form
    await page.getByLabel('Name *').fill('Test Customer')
    await page.getByLabel('Phone Number *').fill('0812345678')
    await page.getByLabel('Contact Channel *').fill('LINE')

    // Submit form
    await page.getByText('Create Customer').click()

    // Should show phone uniqueness error
    await expect(page.getByText('Phone number already exists')).toBeVisible()
  })

  test('should complete customer edit workflow', async ({ page }) => {
    const customerId = 'test-customer-id'

    // Mock customer data for edit
    await page.route(`/api/customers/${customerId}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: customerId,
            name: 'สมชาย เดิม',
            phone: '+66812345678',
            address: '123 ถนนเดิม',
            contactChannel: 'LINE',
            status: 'ACTIVE',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          }),
        })
      } else if (route.request().method() === 'PATCH') {
        const body = await route.request().postDataJSON()
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: customerId,
            ...body,
            updatedAt: new Date().toISOString(),
          }),
        })
      } else {
        await route.continue()
      }
    })

    // Navigate to edit page
    await page.goto(`/customers/${customerId}/edit`)

    // Verify page loads with customer data
    await expect(page.getByText('Edit Customer')).toBeVisible()
    await expect(page.getByDisplayValue('สมชาย เดิม')).toBeVisible()
    await expect(page.getByDisplayValue('+66812345678')).toBeVisible()

    // Update customer information
    await page.getByLabel('Name *').fill('สมชาย ใหม่')
    await page.getByLabel('Address').fill('456 ถนนใหม่')

    // Submit changes
    await page.getByText('Update Customer').click()

    // Should redirect back to customers list
    await expect(page).toHaveURL('/customers')
  })

  test('should handle customer not found error', async ({ page }) => {
    // Mock 404 error
    await page.route('/api/customers/non-existent-id', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Customer not found' }),
      })
    })

    await page.goto('/customers/non-existent-id/edit')

    // Should show error message
    await expect(page.getByText('Customer Not Found')).toBeVisible()
    await expect(page.getByText('Back to Customers')).toBeVisible()
  })

  test('should navigate between pages correctly', async ({ page }) => {
    await page.goto('/customers/new')

    // Click cancel button
    await page.getByText('Cancel').click()

    // Should go back to previous page (customers list)
    await expect(page).toHaveURL('/customers')

    // Test breadcrumb navigation
    await page.goto('/customers/new')
    await page.getByText('Back to Customers').click()
    await expect(page).toHaveURL('/customers')
  })

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/customers/new')

    // Form should be responsive
    const form = page.locator('form')
    await expect(form).toBeVisible()

    // All form fields should be accessible
    await expect(page.getByLabel('Name *')).toBeVisible()
    await expect(page.getByLabel('Phone Number *')).toBeVisible()
    await expect(page.getByLabel('Contact Channel *')).toBeVisible()
    await expect(page.getByLabel('Address')).toBeVisible()

    // Buttons should be properly sized
    await expect(page.getByText('Create Customer')).toBeVisible()
    await expect(page.getByText('Cancel')).toBeVisible()
  })
})
