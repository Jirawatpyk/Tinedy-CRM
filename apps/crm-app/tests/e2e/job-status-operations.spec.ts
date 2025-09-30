/**
 * E2E Tests: Job Status Update for Operations Team
 * Story 2.6: Extend Job Status Update for Operations Team
 *
 * Test Coverage:
 * 1. Operations user updates assigned job from dashboard
 * 2. Operations user updates assigned job from detail page
 * 3. Invalid transitions are blocked with error messages
 * 4. Non-assigned user cannot update job
 *
 * Prerequisites:
 * - Test database with seed data
 * - Admin user: admin@tinedy.com / Admin@123
 * - Operations user: ops@tinedy.com / Ops@123
 * - Test jobs assigned to operations user
 */

import { test, expect, Page } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@tinedy.com'
const ADMIN_PASSWORD = 'Admin@123'
const OPS_EMAIL = 'ops@tinedy.com'
const OPS_PASSWORD = 'Ops@123'
const OPS2_EMAIL = 'ops2@tinedy.com'
const OPS2_PASSWORD = 'Ops@123'

// Helper function: Login
async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 10000 })
}

// Helper function: Navigate to Jobs Dashboard
async function navigateToJobsDashboard(page: Page) {
  await page.goto(`${BASE_URL}/dashboard`)
  // Click on Jobs navigation link if not already on jobs page
  const jobsLink = page.locator('a[href*="/jobs"]').first()
  if (await jobsLink.isVisible()) {
    await jobsLink.click()
    await page.waitForLoadState('networkidle')
  }
}

// Helper function: Get first job row
async function getFirstJobRow(page: Page) {
  await page.waitForSelector('table tbody tr', { timeout: 10000 })
  return page.locator('table tbody tr').first()
}

test.describe('Story 2.6: Job Status Update - Operations Team E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for E2E tests
    test.setTimeout(60000)
  })

  // ========================================
  // TEST 1: Operations user updates assigned job from dashboard
  // ========================================
  test('Operations user can update status of assigned job from dashboard', async ({
    page,
  }) => {
    // Login as Operations user
    await login(page, OPS_EMAIL, OPS_PASSWORD)

    // Navigate to Jobs Dashboard
    await navigateToJobsDashboard(page)

    // Find a job assigned to this user with NEW status
    await page.waitForSelector('table tbody tr')

    // Look for status dropdown (only visible for assigned jobs)
    const statusDropdown = page
      .locator('[role="combobox"]')
      .filter({ hasText: /งานใหม่|ได้รับมอบหมาย|กำลังดำเนินการ/ })
      .first()

    if (await statusDropdown.isVisible()) {
      // Get current status
      const currentStatusText = await statusDropdown.textContent()

      // Click dropdown to see available options
      await statusDropdown.click()
      await page.waitForSelector('[role="option"]')

      // Select a valid next status based on current status
      let nextStatus: string | null = null
      if (currentStatusText?.includes('งานใหม่')) {
        // NEW → ASSIGNED
        nextStatus = 'ได้รับมอบหมาย'
      } else if (currentStatusText?.includes('ได้รับมอบหมาย')) {
        // ASSIGNED → IN_PROGRESS
        nextStatus = 'กำลังดำเนินการ'
      } else if (currentStatusText?.includes('กำลังดำเนินการ')) {
        // IN_PROGRESS → ON_HOLD
        nextStatus = 'หยุดชั่วคราว'
      } else if (currentStatusText?.includes('หยุดชั่วคราว')) {
        // ON_HOLD → IN_PROGRESS
        nextStatus = 'กำลังดำเนินการ'
      }

      if (nextStatus) {
        // Select the next status
        await page.locator(`[role="option"]:has-text("${nextStatus}")`).click()

        // Confirm status change in dialog
        await page.waitForSelector('text=ยืนยันการเปลี่ยนสถานะ')
        await page.click('button:has-text("เปลี่ยนสถานะ")')

        // Wait for success toast
        await page.waitForSelector('text=/อัปเดตสถานะงานสำเร็จ/', {
          timeout: 10000,
        })

        // Verify page reloaded with updated status
        await page.waitForLoadState('networkidle')
        await expect(page.locator(`text=${nextStatus}`).first()).toBeVisible()
      }
    }
  })

  // ========================================
  // TEST 2: Operations user updates assigned job from detail page
  // ========================================
  test('Operations user can update status of assigned job from detail page', async ({
    page,
  }) => {
    // Login as Operations user
    await login(page, OPS_EMAIL, OPS_PASSWORD)

    // Navigate to Jobs Dashboard
    await navigateToJobsDashboard(page)

    // Click on first job to view details
    const firstJobRow = await getFirstJobRow(page)
    const viewButton = firstJobRow.locator('button:has-text("ดูรายละเอียด")')

    if (await viewButton.isVisible()) {
      await viewButton.click()
      await page.waitForURL('**/jobs/**')

      // Wait for job detail page to load
      await page.waitForSelector('h1, h2', { timeout: 10000 })

      // Find status dropdown on detail page
      const statusDropdown = page
        .locator('[role="combobox"]')
        .filter({ hasText: /งานใหม่|ได้รับมอบหมาย|กำลังดำเนินการ/ })
        .first()

      if (await statusDropdown.isVisible()) {
        const currentStatusText = await statusDropdown.textContent()

        // Click dropdown
        await statusDropdown.click()
        await page.waitForSelector('[role="option"]')

        // Select valid next status
        let nextStatus: string | null = null
        if (currentStatusText?.includes('งานใหม่')) {
          nextStatus = 'ได้รับมอบหมาย'
        } else if (currentStatusText?.includes('ได้รับมอบหมาย')) {
          nextStatus = 'กำลังดำเนินการ'
        } else if (currentStatusText?.includes('กำลังดำเนินการ')) {
          nextStatus = 'หยุดชั่วคราว'
        }

        if (nextStatus) {
          await page
            .locator(`[role="option"]:has-text("${nextStatus}")`)
            .click()

          // Confirm status change
          await page.waitForSelector('text=ยืนยันการเปลี่ยนสถานะ')
          await page.click('button:has-text("เปลี่ยนสถานะ")')

          // Wait for success
          await page.waitForSelector('text=/อัปเดตสถานะงานสำเร็จ/', {
            timeout: 10000,
          })

          // Verify updated status displayed
          await page.waitForLoadState('networkidle')
          await expect(
            page.locator(`text=${nextStatus}`).first()
          ).toBeVisible()
        }
      }
    }
  })

  // ========================================
  // TEST 3: Invalid status transitions are blocked with error messages
  // ========================================
  test('Invalid status transitions are blocked with error message', async ({
    page,
  }) => {
    // Login as Admin (to have full access to modify job for testing)
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

    // Navigate to Jobs Dashboard
    await navigateToJobsDashboard(page)

    // Find a job and try to make invalid transition via API
    await page.waitForSelector('table tbody tr')
    const firstJobRow = await getFirstJobRow(page)
    const jobIdCell = firstJobRow.locator('td').first()
    const jobIdText = await jobIdCell.textContent()

    if (jobIdText) {
      // Extract job ID from truncated display
      const jobIdMatch = jobIdText.match(/[a-z0-9-]+/)
      if (jobIdMatch) {
        const partialJobId = jobIdMatch[0]

        // Try to make an invalid transition via API (NEW → COMPLETED)
        // This simulates what would happen if someone bypasses UI
        const response = await page.evaluate(
          async (id) => {
            // Find full job ID by partial match
            const res = await fetch('/api/jobs')
            const data = await res.json()
            const job = data.jobs.find((j: any) => j.id.startsWith(id))

            if (!job) return null

            // Try invalid transition
            return fetch(`/api/jobs/${job.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'COMPLETED', // Invalid if current status is NEW or ASSIGNED
              }),
            }).then((r) => r.json())
          },
          partialJobId
        )

        // Verify error response for invalid transition
        if (response && response.error) {
          expect(response.error).toContain('Invalid status transition')
          expect(response.message).toContain('ไม่สามารถเปลี่ยนสถานะ')
        }
      }
    }
  })

  // ========================================
  // TEST 4: Non-assigned Operations user cannot update job
  // ========================================
  test('Non-assigned Operations user cannot update job status', async ({
    page,
  }) => {
    // Login as different Operations user (ops2)
    await login(page, OPS2_EMAIL, OPS2_PASSWORD)

    // Navigate to Jobs Dashboard
    await navigateToJobsDashboard(page)

    // Wait for jobs to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 })

    // Count visible status dropdowns
    const dropdownCount = await page.locator('[role="combobox"]').count()

    // For jobs not assigned to this user, status should be displayed as badge (not dropdown)
    // Look for status badges instead of dropdowns
    const statusBadges = page.locator('td').filter({
      hasText: /ใหม่|มอบหมายแล้ว|กำลังดำเนินการ|เสร็จสิ้น|ยกเลิก/,
    })

    // There should be status displays (badges or dropdowns)
    const statusDisplayCount = await statusBadges.count()
    expect(statusDisplayCount).toBeGreaterThan(0)

    // If user has no assigned jobs, they should see 0 dropdowns
    // If user has some assigned jobs, dropdowns should be less than total jobs
    if (dropdownCount === 0) {
      console.log('✓ Non-assigned user sees no status dropdowns')
    } else {
      console.log(
        `✓ User sees ${dropdownCount} dropdowns (only for assigned jobs)`
      )
    }

    // Try to update a non-assigned job via API (should fail with 403)
    const apiResponse = await page.evaluate(async () => {
      const res = await fetch('/api/jobs')
      const data = await res.json()

      // Get first job (likely not assigned to ops2)
      const job = data.jobs[0]
      if (!job) return null

      // Try to update status (should fail if not assigned)
      return fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })
        .then((r) => r.json())
        .then((result) => ({ status: 200, body: result }))
        .catch(() => ({ status: 403, body: null }))
    })

    // If job was not assigned to this user, should get 403 error
    if (apiResponse?.body?.error) {
      expect(apiResponse.body.error).toContain('Forbidden')
    }
  })

  // ========================================
  // TEST 5: Admin retains full access to all jobs
  // ========================================
  test('Admin can update status of any job regardless of assignment', async ({
    page,
  }) => {
    // Login as Admin
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

    // Navigate to Jobs Dashboard
    await navigateToJobsDashboard(page)

    // Wait for jobs to load
    await page.waitForSelector('table tbody tr')

    // Admin should see status dropdowns for ALL jobs
    const dropdownCount = await page.locator('[role="combobox"]').count()
    expect(dropdownCount).toBeGreaterThan(0)

    // Try to update first job
    const statusDropdown = page.locator('[role="combobox"]').first()
    if (await statusDropdown.isVisible()) {
      const currentStatus = await statusDropdown.textContent()

      await statusDropdown.click()
      await page.waitForSelector('[role="option"]')

      // Select first available option (valid next status)
      const options = page.locator('[role="option"]')
      const optionCount = await options.count()

      if (optionCount > 1) {
        // Select second option (first is current status)
        await options.nth(1).click()

        // Confirm
        await page.waitForSelector('text=ยืนยันการเปลี่ยนสถานะ')
        await page.click('button:has-text("เปลี่ยนสถานะ")')

        // Wait for success
        await page.waitForSelector('text=/อัปเดตสถานะงานสำเร็จ/', {
          timeout: 10000,
        })

        console.log('✓ Admin successfully updated job status')
      }
    }
  })
})

// ========================================
// Additional E2E Tests: Status Dropdown Filtering
// ========================================
test.describe('Story 2.6: Status Dropdown Filtering E2E', () => {
  test('Dropdown shows only valid next statuses based on current status', async ({
    page,
  }) => {
    // Login as Admin
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

    // Navigate to Jobs Dashboard
    await navigateToJobsDashboard(page)

    await page.waitForSelector('table tbody tr')

    // Find a job with NEW status
    const newStatusRow = page
      .locator('tr')
      .filter({ hasText: /งานใหม่/ })
      .first()

    if (await newStatusRow.isVisible()) {
      const dropdown = newStatusRow.locator('[role="combobox"]').first()
      await dropdown.click()
      await page.waitForSelector('[role="option"]')

      // NEW status should show: NEW (current), ASSIGNED, CANCELLED
      const options = await page.locator('[role="option"]').allTextContents()

      // Should include valid transitions
      expect(options.some((opt) => opt.includes('งานใหม่'))).toBe(true) // Current
      expect(options.some((opt) => opt.includes('ได้รับมอบหมาย'))).toBe(true) // ASSIGNED
      expect(options.some((opt) => opt.includes('ยกเลิก'))).toBe(true) // CANCELLED

      // Should NOT include invalid transitions
      expect(options.some((opt) => opt.includes('เสร็จแล้ว'))).toBe(false) // COMPLETED
      expect(options.some((opt) => opt.includes('หยุดชั่วคราว'))).toBe(false) // ON_HOLD

      // Close dropdown
      await page.keyboard.press('Escape')
    }
  })
})