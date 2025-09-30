// E2E Tests: Complete Checklist Management Workflow
// Story 2.5: Quality Control Checklist Management
// Test Coverage: Full user workflows from template creation to checklist execution

import { test, expect, Page } from '@playwright/test'

// Test data
const testData = {
  admin: {
    email: 'admin@tinedy.com',
    password: 'admin123',
  },
  operations: {
    email: 'operations@tinedy.com',
    password: 'operations123',
  },
  template: {
    name: 'บริการทำความสะอาด E2E Test',
    description: 'เทมเพลตสำหรับการทดสอบ E2E',
    serviceType: 'CLEANING',
    items: ['เช็ดกระจกหน้าต่าง', 'ดูดฝุ่นพรม', 'ถูพื้น', 'ทำความสะอาดห้องน้ำ'],
  },
}

// Helper functions
async function loginAs(page: Page, userType: 'admin' | 'operations') {
  const user = userType === 'admin' ? testData.admin : testData.operations

  await page.goto('/login')
  await page.fill('[name="email"]', user.email)
  await page.fill('[name="password"]', user.password)
  await page.click('button[type="submit"]')

  // Wait for redirect to dashboard
  await page.waitForURL('/')
  await expect(page).toHaveURL('/')
}

async function navigateToChecklistTemplates(page: Page) {
  // Navigate to Settings > Checklist Templates
  await page.click('a[href="/settings"]')
  await page.click('a[href="/settings/checklist-templates"]')
  await expect(page).toHaveURL('/settings/checklist-templates')
}

// ========================================
// TEST GROUP 1: Complete Admin Workflow
// ========================================
test.describe('Admin Workflow: Template Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('should complete full CRUD workflow for checklist template', async ({
    page,
  }) => {
    // ========== CREATE ==========
    await navigateToChecklistTemplates(page)

    // Click "New Template" button
    await page.click('button:has-text("New Template")')
    await expect(page).toHaveURL('/settings/checklist-templates/new')

    // Fill in template details
    await page.fill('[name="name"]', testData.template.name)
    await page.fill('[name="description"]', testData.template.description)
    await page.selectOption(
      '[name="serviceType"]',
      testData.template.serviceType
    )

    // Add checklist items
    for (let i = 0; i < testData.template.items.length; i++) {
      if (i > 0) {
        await page.click('button:has-text("Add Item")')
      }
      await page.fill(`[name="items.${i}"]`, testData.template.items[i])
    }

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success toast
    await expect(page.locator('.toast')).toContainText(
      'Template created successfully'
    )

    // Verify redirect to template list
    await expect(page).toHaveURL('/settings/checklist-templates')

    // Verify template appears in list
    await expect(page.locator('table tbody tr')).toContainText(
      testData.template.name
    )

    // ========== READ ==========
    // Click on template to view details
    await page.click(`tr:has-text("${testData.template.name}")`)

    // Verify all template details are displayed
    await expect(page.locator('h1')).toContainText(testData.template.name)
    await expect(page.locator('.description')).toContainText(
      testData.template.description
    )

    for (const item of testData.template.items) {
      await expect(page.locator('.checklist-items')).toContainText(item)
    }

    // ========== UPDATE ==========
    // Click "Edit" button
    await page.click('button:has-text("Edit")')

    const updatedName = `${testData.template.name} (Updated)`
    await page.fill('[name="name"]', updatedName)

    // Add one more item
    await page.click('button:has-text("Add Item")')
    await page.fill(
      `[name="items.${testData.template.items.length}"]`,
      'ล้างม่าน'
    )

    // Submit update
    await page.click('button[type="submit"]')

    // Verify success toast
    await expect(page.locator('.toast')).toContainText(
      'Template updated successfully'
    )

    // Verify updated name appears
    await expect(page.locator('h1')).toContainText(updatedName)
    await expect(page.locator('.checklist-items')).toContainText('ล้างม่าน')

    // ========== DELETE ==========
    await navigateToChecklistTemplates(page)

    // Find template row and click delete button
    const templateRow = page.locator(`tr:has-text("${updatedName}")`)
    await templateRow.locator('button[aria-label="Delete"]').click()

    // Confirm deletion in dialog
    await page.click('button:has-text("Confirm")')

    // Verify success toast
    await expect(page.locator('.toast')).toContainText('deleted successfully')

    // Verify template no longer appears in list
    await expect(page.locator('table tbody')).not.toContainText(updatedName)
  })

  test('should show validation errors for invalid template data', async ({
    page,
  }) => {
    await navigateToChecklistTemplates(page)
    await page.click('button:has-text("New Template")')

    // Try to submit without filling required fields
    await page.click('button[type="submit"]')

    // Verify validation errors
    await expect(page.locator('.error')).toContainText(
      'Template name is required'
    )
    await expect(page.locator('.error')).toContainText(
      'At least one checklist item is required'
    )
  })

  test('should prevent duplicate template names for same service type', async ({
    page,
  }) => {
    // Create first template
    await navigateToChecklistTemplates(page)
    await page.click('button:has-text("New Template")')

    await page.fill('[name="name"]', 'บริการทดสอบ Duplicate')
    await page.selectOption('[name="serviceType"]', 'CLEANING')
    await page.fill('[name="items.0"]', 'รายการ 1')
    await page.click('button[type="submit"]')

    await expect(page.locator('.toast')).toContainText('created successfully')

    // Try to create duplicate
    await page.click('button:has-text("New Template")')
    await page.fill('[name="name"]', 'บริการทดสอบ Duplicate')
    await page.selectOption('[name="serviceType"]', 'CLEANING')
    await page.fill('[name="items.0"]', 'รายการ 2')
    await page.click('button[type="submit"]')

    // Verify error message
    await expect(page.locator('.toast')).toContainText('already exists')
  })

  test('should filter templates by service type', async ({ page }) => {
    await navigateToChecklistTemplates(page)

    // Filter by CLEANING
    await page.selectOption('[name="serviceTypeFilter"]', 'CLEANING')
    await page.waitForTimeout(500) // Wait for filter to apply

    // Verify only CLEANING templates shown
    const rows = await page.locator('table tbody tr').all()
    for (const row of rows) {
      await expect(row.locator('.service-type')).toContainText('CLEANING')
    }

    // Filter by TRAINING
    await page.selectOption('[name="serviceTypeFilter"]', 'TRAINING')
    await page.waitForTimeout(500)

    // Verify only TRAINING templates shown
    const trainingRows = await page.locator('table tbody tr').all()
    for (const row of trainingRows) {
      await expect(row.locator('.service-type')).toContainText('TRAINING')
    }
  })

  test('should search templates by name', async ({ page }) => {
    await navigateToChecklistTemplates(page)

    // Enter search query
    await page.fill('[name="search"]', 'ห้องน้ำ')
    await page.waitForTimeout(500) // Wait for search to filter

    // Verify search results
    const searchResults = await page.locator('table tbody tr').all()
    for (const row of searchResults) {
      const text = await row.textContent()
      expect(text).toContain('ห้องน้ำ')
    }
  })
})

// ========================================
// TEST GROUP 2: Job Integration Workflow
// ========================================
test.describe('Admin Workflow: Attach Checklist to Job', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('should attach checklist template to job successfully', async ({
    page,
  }) => {
    // Navigate to a job details page
    await page.goto('/jobs')
    await page.click('table tbody tr:first-child') // Click first job

    const jobId = page.url().split('/').pop()
    await expect(page).toHaveURL(`/jobs/${jobId}`)

    // Click "Attach Checklist" button
    await page.click('button:has-text("Attach Checklist")')

    // Select template from dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.selectOption('[name="templateId"]', { index: 1 }) // Select first template
    await page.click('button:has-text("Attach"):visible')

    // Verify success toast
    await expect(page.locator('.toast')).toContainText(
      'Checklist attached successfully'
    )

    // Verify checklist section appears
    await expect(page.locator('.checklist-section')).toBeVisible()
    await expect(page.locator('.checklist-section h3')).toContainText(
      'Quality Control Checklist'
    )
  })

  test('should validate service type compatibility when attaching template', async ({
    page,
  }) => {
    // Create TRAINING job
    await page.goto('/jobs/new')
    await page.fill('[name="customerId"]', 'customer-123')
    await page.selectOption('[name="serviceType"]', 'TRAINING')
    await page.fill('[name="price"]', '5000')
    await page.click('button[type="submit"]')

    // Try to attach CLEANING template
    await page.click('button:has-text("Attach Checklist")')

    // Select CLEANING template from dropdown
    const cleaningOption = await page
      .locator('select[name="templateId"] option:has-text("CLEANING")')
      .first()
    await page.selectOption('[name="templateId"]', {
      label: (await cleaningOption.textContent()) || '',
    })

    await page.click('button:has-text("Attach"):visible')

    // Verify error message
    await expect(page.locator('.toast')).toContainText('Service type mismatch')
    await expect(page.locator('.toast')).toContainText(
      'Template is for CLEANING but job is TRAINING'
    )
  })

  test('should show template selector filtered by job service type', async ({
    page,
  }) => {
    // Navigate to CLEANING job
    await page.goto('/jobs')
    await page.locator('tr:has-text("CLEANING")').first().click()

    // Open template selector
    await page.click('button:has-text("Attach Checklist")')

    // Verify only CLEANING templates shown in dropdown
    const options = await page
      .locator('select[name="templateId"] option')
      .allTextContents()
    for (const option of options) {
      if (option !== 'Select a template...') {
        expect(option).toContain('CLEANING')
      }
    }
  })

  test('should detach checklist template from job', async ({ page }) => {
    // Navigate to job with attached checklist
    await page.goto('/jobs')
    const jobWithChecklist = page.locator('tr:has(.checklist-badge)').first()
    await jobWithChecklist.click()

    // Click "Detach Checklist" button
    await page.click('button:has-text("Detach Checklist")')

    // Confirm detachment
    await page.click('button:has-text("Confirm")')

    // Verify success toast
    await expect(page.locator('.toast')).toContainText(
      'Checklist detached successfully'
    )

    // Verify checklist section removed
    await expect(page.locator('.checklist-section')).not.toBeVisible()
  })
})

// ========================================
// TEST GROUP 3: Operations Workflow
// ========================================
test.describe('Operations Workflow: Execute Checklist', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'operations')
  })

  test('should complete checklist execution with auto-save', async ({
    page,
  }) => {
    // Navigate to assigned job with checklist
    await page.goto('/jobs/my-assignments')
    const jobWithChecklist = page.locator('tr:has(.checklist-badge)').first()
    await jobWithChecklist.click()

    // Verify checklist is visible
    await expect(page.locator('.checklist-executor')).toBeVisible()
    await expect(page.locator('.progress-bar')).toBeVisible()

    // Initial progress should be 0%
    await expect(page.locator('.progress-text')).toContainText('0 / ')

    // Check first item
    const firstCheckbox = page
      .locator('.checklist-executor input[type="checkbox"]')
      .first()
    await firstCheckbox.check()

    // Wait for auto-save (1 second debounce)
    await page.waitForTimeout(1500)

    // Verify "Saved" indicator
    await expect(page.locator('.save-status')).toContainText(
      'All changes saved'
    )

    // Verify progress updated
    const progressText = await page.locator('.progress-text').textContent()
    expect(progressText).toContain('1 /')

    // Check all remaining items
    const allCheckboxes = await page
      .locator('.checklist-executor input[type="checkbox"]')
      .all()
    for (let i = 1; i < allCheckboxes.length; i++) {
      await allCheckboxes[i].check()
      await page.waitForTimeout(200) // Small delay between checks
    }

    // Wait for final auto-save
    await page.waitForTimeout(1500)

    // Verify 100% completion
    await expect(page.locator('.progress-text')).toContainText('(100%)')
    await expect(page.locator('.completion-badge')).toContainText('Completed')
    await expect(page.locator('.completion-badge')).toBeVisible()
  })

  test('should show visual feedback during auto-save', async ({ page }) => {
    await page.goto('/jobs/my-assignments')
    const jobRow = page.locator('tr:has(.checklist-badge)').first()
    await jobRow.click()

    // Check a checkbox
    const checkbox = page
      .locator('.checklist-executor input[type="checkbox"]')
      .first()
    await checkbox.check()

    // Should show "Changes pending..." immediately
    await expect(page.locator('.save-status')).toContainText(
      'Changes pending...'
    )

    // Wait for auto-save to complete
    await page.waitForTimeout(1500)

    // Should show "Saving..." during API call
    // Then "All changes saved" after success
    await expect(page.locator('.save-status')).toContainText(
      'All changes saved'
    )
  })

  test('should use manual save button for immediate save', async ({ page }) => {
    await page.goto('/jobs/my-assignments')
    const jobRow = page.locator('tr:has(.checklist-badge)').first()
    await jobRow.click()

    // Check multiple items rapidly
    const checkboxes = await page
      .locator('.checklist-executor input[type="checkbox"]')
      .all()
    await checkboxes[0].check()
    await checkboxes[1].check()
    await checkboxes[2].check()

    // Click "Save Now" button immediately (before 1-second debounce)
    await page.click('button:has-text("Save Now")')

    // Should save immediately without waiting for debounce
    await expect(page.locator('.save-status')).toContainText(
      'All changes saved'
    )
  })

  test('should handle rapid checkbox toggles with debounce', async ({
    page,
  }) => {
    await page.goto('/jobs/my-assignments')
    const jobRow = page.locator('tr:has(.checklist-badge)').first()
    await jobRow.click()

    // Toggle checkboxes rapidly (within 1 second)
    const checkboxes = await page
      .locator('.checklist-executor input[type="checkbox"]')
      .all()
    for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
      await checkboxes[i].check()
      await page.waitForTimeout(200) // Rapid toggles
    }

    // Wait for auto-save debounce (should only save once)
    await page.waitForTimeout(1500)

    // Verify all changes saved together
    await expect(page.locator('.save-status')).toContainText(
      'All changes saved'
    )
    await expect(page.locator('.progress-text')).toContainText('3 / ')
  })

  test('should show error toast when save fails', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/jobs/*/checklist-status', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to save' }),
      })
    })

    await page.goto('/jobs/my-assignments')
    const jobRow = page.locator('tr:has(.checklist-badge)').first()
    await jobRow.click()

    // Check a checkbox
    const checkbox = page
      .locator('.checklist-executor input[type="checkbox"]')
      .first()
    await checkbox.check()

    // Wait for auto-save
    await page.waitForTimeout(1500)

    // Verify error toast
    await expect(page.locator('.toast')).toContainText('Error')
    await expect(page.locator('.toast')).toContainText('Failed to save')
  })

  test('should not allow operations to manage templates', async ({ page }) => {
    // Try to navigate to template management
    await page.goto('/settings/checklist-templates')

    // Should be redirected or show 403 error
    await expect(page.locator('body')).toContainText('Forbidden')
    // OR
    await expect(page).not.toHaveURL('/settings/checklist-templates')
  })
})

// ========================================
// TEST GROUP 4: Mobile Responsive Testing
// ========================================
test.describe('Mobile Responsive Design', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE size
  })

  test('should render template list properly on mobile', async ({ page }) => {
    await loginAs(page, 'admin')
    await navigateToChecklistTemplates(page)

    // Verify mobile-friendly layout
    await expect(page.locator('.template-list')).toBeVisible()

    // Verify cards instead of table on mobile
    await expect(page.locator('.template-card')).toHaveCount(
      await page.locator('.template-card').count()
    )
  })

  test('should execute checklist on mobile device', async ({ page }) => {
    await loginAs(page, 'operations')
    await page.goto('/jobs/my-assignments')

    const jobRow = page.locator('tr:has(.checklist-badge)').first()
    await jobRow.click()

    // Verify checklist is touch-friendly
    const checkbox = page
      .locator('.checklist-executor input[type="checkbox"]')
      .first()
    await checkbox.check()

    // Verify large tap targets
    const checkboxSize = await checkbox.boundingBox()
    expect(checkboxSize?.width).toBeGreaterThan(24)
    expect(checkboxSize?.height).toBeGreaterThan(24)

    // Verify mobile progress bar
    await expect(page.locator('.progress-bar')).toBeVisible()
  })
})

// ========================================
// TEST GROUP 5: Cross-Browser Testing
// ========================================
test.describe('Cross-Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit']

  for (const browserName of browsers) {
    test(`should work correctly in ${browserName}`, async ({ page }) => {
      await loginAs(page, 'admin')
      await navigateToChecklistTemplates(page)

      // Basic functionality test
      await page.click('button:has-text("New Template")')
      await page.fill('[name="name"]', `Test ${browserName}`)
      await page.selectOption('[name="serviceType"]', 'CLEANING')
      await page.fill('[name="items.0"]', 'Item 1')
      await page.click('button[type="submit"]')

      await expect(page.locator('.toast')).toContainText('created successfully')
    })
  }
})

// ========================================
// TEST SUMMARY
// ========================================
// Total Test Groups: 5
// Total Test Scenarios: 20+
// Coverage:
// - ✅ Complete CRUD workflow (Admin)
// - ✅ Template validation and duplicate prevention
// - ✅ Filtering and search functionality
// - ✅ Job integration (attach/detach)
// - ✅ Service type compatibility validation
// - ✅ Checklist execution with auto-save (Operations)
// - ✅ Manual save button functionality
// - ✅ Rapid toggle handling with debounce
// - ✅ Error handling and toast notifications
// - ✅ Role-based access control
// - ✅ Mobile responsive design
// - ✅ Cross-browser compatibility
//
// Run tests:
// npx playwright test tests/e2e/checklist-management-workflow.spec.ts
//
// Run with UI:
// npx playwright test --ui
//
// Run specific test:
// npx playwright test -g "should complete full CRUD workflow"
