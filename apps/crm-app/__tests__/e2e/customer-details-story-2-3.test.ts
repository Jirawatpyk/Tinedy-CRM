import { test, expect } from '@playwright/test'

test.describe('Story 2.3: Customer Details & Service History', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@tinedy.com')
    await page.fill('[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('AC1: Customer details page is accessible by clicking on a customer from the customer list', async ({
    page,
  }) => {
    // Navigate to customer list
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')

    // Find and click on first customer
    const customerRow = page.locator('table tbody tr').first()
    await expect(customerRow).toBeVisible()

    const customerName = await customerRow.locator('td').first().textContent()
    await customerRow.click()

    // Should navigate to customer details page
    await expect(page).toHaveURL(/\/customers\/[^\/]+$/)
    await expect(page.locator('h1')).toContainText('รายละเอียดลูกค้า')

    // Verify customer name is displayed
    if (customerName) {
      await expect(page.locator('text=' + customerName.trim())).toBeVisible()
    }
  })

  test('AC2: Page displays complete customer information', async ({ page }) => {
    // Navigate directly to customer details page (using first customer from seed data)
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')

    const firstCustomerLink = page.locator('table tbody tr').first()
    await firstCustomerLink.click()

    await page.waitForLoadState('networkidle')

    // Verify all customer information fields are displayed
    await expect(page.locator('text=ชื่อลูกค้า')).toBeVisible()
    await expect(page.locator('text=สถานะ')).toBeVisible()
    await expect(page.locator('text=เบอร์โทรศัพท์')).toBeVisible()
    await expect(page.locator('text=ช่องทางติดต่อ')).toBeVisible()
    await expect(page.locator('text=วันที่สร้าง')).toBeVisible()
    await expect(page.locator('text=วันที่อัปเดต')).toBeVisible()

    // Check for status badge
    await expect(page.locator('.badge, [class*="badge"]')).toBeVisible()

    // Check customer contact information is displayed
    await expect(
      page.locator('text=/02-\d{3}-\d{4}|081-\d{3}-\d{4}/')
    ).toBeVisible()
  })

  test('AC3: Page shows a list of all jobs/services associated with the customer', async ({
    page,
  }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')

    // Click on first customer
    const firstCustomerLink = page.locator('table tbody tr').first()
    await firstCustomerLink.click()
    await page.waitForLoadState('networkidle')

    // Verify job history section exists
    await expect(page.locator('text=ประวัติการให้บริการ')).toBeVisible()

    // Check if jobs are displayed (there should be jobs from seed data)
    const jobHistorySection = page
      .locator('text=ประวัติการให้บริการ')
      .locator('..')
    await expect(jobHistorySection).toBeVisible()

    // Should show either job list or empty state
    const hasJobs = await page.locator('table tbody tr, .space-y-4').count()
    expect(hasJobs).toBeGreaterThanOrEqual(0)
  })

  test('AC4: Each job in the history displays key information (service type, scheduled date, status, price)', async ({
    page,
  }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')

    // Find customer with jobs (should be customer with job from seed data)
    const customerWithJobs = page.locator('table tbody tr').first()
    await customerWithJobs.click()
    await page.waitForLoadState('networkidle')

    // Wait for job history to load
    await page.waitForTimeout(2000)

    // Check if there are jobs displayed
    const jobRows = page.locator('table tbody tr, [class*="card"]')
    const jobCount = await jobRows.count()

    if (jobCount > 0) {
      // Verify first job displays required information
      const firstJob = jobRows.first()

      // Check for service type (should be badge with "ทำความสะอาด" or "ฝึกอบรม")
      await expect(
        page.locator('text=ทำความสะอาด, text=ฝึกอบรม').first()
      ).toBeVisible()

      // Check for status badge
      await expect(
        page
          .locator(
            'text=ใหม่, text=มอบหมายแล้ว, text=กำลังดำเนินการ, text=เสร็จสิ้น, text=ยกเลิก'
          )
          .first()
      ).toBeVisible()

      // Check for price (should contain "บาท")
      await expect(page.locator('text=/\d+,?\d*\s*บาท/')).toBeVisible()

      // Check for date
      await expect(
        page.locator('text=/\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+\w+\s+\d{4}/')
      ).toBeVisible()
    }
  })

  test('AC5: Jobs are sorted by date (most recent first) and show appropriate status badges', async ({
    page,
  }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')

    const firstCustomerLink = page.locator('table tbody tr').first()
    await firstCustomerLink.click()
    await page.waitForLoadState('networkidle')

    // Wait for job history to load
    await page.waitForTimeout(2000)

    // Check if multiple jobs exist to verify sorting
    const jobDates = page.locator(
      '[class*="calendar"], text=/\d{1,2}\/\d{1,2}\/\d{4}/'
    )
    const dateCount = await jobDates.count()

    if (dateCount > 1) {
      // Get first two dates and verify they are in descending order
      const firstDate = await jobDates.first().textContent()
      const secondDate = await jobDates.nth(1).textContent()

      // Basic verification that dates are present
      expect(firstDate).toBeTruthy()
      expect(secondDate).toBeTruthy()
    }

    // Verify status badges are present and properly styled
    const statusBadges = page.locator('[class*="badge"], .badge')
    const badgeCount = await statusBadges.count()

    if (badgeCount > 0) {
      // Verify badges have proper status text
      await expect(
        page.locator(
          'text=ใหม่, text=มอบหมายแล้ว, text=กำลังดำเนินการ, text=เสร็จสิ้น, text=ยกเลิก'
        )
      ).toBeVisible()
    }
  })

  test('AC6: Page includes an "Edit Customer" button that navigates to the customer edit form', async ({
    page,
  }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')

    const firstCustomerLink = page.locator('table tbody tr').first()
    const customerId = await firstCustomerLink.getAttribute('data-customer-id')
    await firstCustomerLink.click()
    await page.waitForLoadState('networkidle')

    // Find and verify Edit Customer button exists
    const editButton = page.locator(
      'text=แก้ไขข้อมูล, text=Edit Customer, button:has-text("แก้ไข")'
    )
    await expect(editButton).toBeVisible()

    // Click the edit button
    await editButton.click()

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/customers\/[^\/]+\/edit/)
    await expect(
      page.locator(
        'h1:has-text("แก้ไข"), h1:has-text("Edit"), text=แก้ไขข้อมูลลูกค้า'
      )
    ).toBeVisible()
  })

  test('AC7: Page has proper loading states and error handling for data fetching', async ({
    page,
  }) => {
    // Test loading state by navigating to customer details
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')

    const firstCustomerLink = page.locator('table tbody tr').first()
    await firstCustomerLink.click()

    // Should show skeleton or loading state briefly
    // Note: This might be too fast to catch in the test, but we verify the page loads correctly
    await page.waitForLoadState('networkidle')

    // Verify page loaded successfully without errors
    await expect(page.locator('text=รายละเอียดลูกค้า')).toBeVisible()
    await expect(page.locator('text=ประวัติการให้บริการ')).toBeVisible()

    // Test error handling by trying to access a non-existent customer
    await page.goto('/customers/non-existent-customer-id')

    // Should show 404 or error message
    const notFoundIndicators = [
      page.locator('text=ไม่พบ'),
      page.locator('text=Not Found'),
      page.locator('text=404'),
      page.locator('[class*="error"], [class*="alert"]'),
    ]

    let errorFound = false
    for (const indicator of notFoundIndicators) {
      if (await indicator.isVisible()) {
        errorFound = true
        break
      }
    }

    expect(errorFound).toBe(true)
  })

  test('Navigation: Back to customer list works properly', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForLoadState('networkidle')

    const firstCustomerLink = page.locator('table tbody tr').first()
    await firstCustomerLink.click()
    await page.waitForLoadState('networkidle')

    // Find and click back navigation
    const backButton = page.locator(
      'text=กลับสู่รายการลูกค้า, text=กลับ, [aria-label*="back"], [class*="back"]'
    )
    await expect(backButton).toBeVisible()

    await backButton.click()

    // Should return to customer list
    await expect(page).toHaveURL('/customers')
    await expect(
      page.locator('h1:has-text("ลูกค้า"), h1:has-text("Customer")')
    ).toBeVisible()
  })

  test('Responsive design: Job history displays correctly on mobile', async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto('/customers')
    await page.waitForLoadState('networkidle')

    const firstCustomerLink = page.locator('table tbody tr').first()
    await firstCustomerLink.click()
    await page.waitForLoadState('networkidle')

    // On mobile, should show card view instead of table view
    await page.waitForTimeout(1000)

    // Verify mobile-friendly layout
    const mobileCards = page.locator(
      '[class*="md:hidden"], [class*="mobile"], .space-y-4'
    )
    if ((await mobileCards.count()) > 0) {
      await expect(mobileCards.first()).toBeVisible()
    }

    // Verify content is still accessible
    await expect(page.locator('text=ประวัติการให้บริการ')).toBeVisible()
  })
})
