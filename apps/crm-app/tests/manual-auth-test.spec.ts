import { test, expect } from '@playwright/test'

// การทดสอบ authentication แบบ manual step-by-step
const BASE_URL = 'http://localhost:3005'
const ADMIN_EMAIL = 'admin@tinedy.com'
const ADMIN_PASSWORD = 'admin123'

test.describe('Manual Authentication Testing - Step by Step', () => {
  test('should complete full authentication flow manually', async ({
    page,
  }) => {
    console.log('🚀 Starting Manual Authentication Test...')

    // Step 1: Navigate to protected page (should redirect to login)
    console.log('\n📍 Step 1: Navigate to protected page /customers')
    await page.goto(`${BASE_URL}/customers`)
    await page.waitForTimeout(2000)

    console.log(`Current URL: ${page.url()}`)

    // Verify we're redirected to login
    expect(page.url()).toContain('/login')
    console.log('✅ Correctly redirected to login page')

    // Step 2: Fill login form
    console.log('\n📍 Step 2: Fill login form')

    // Verify form elements exist
    const emailField = page.locator('input[name="email"]')
    const passwordField = page.locator('input[name="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await expect(emailField).toBeVisible()
    await expect(passwordField).toBeVisible()
    await expect(submitButton).toBeVisible()
    console.log('✅ All form elements are visible')

    // Fill the form
    await emailField.fill(ADMIN_EMAIL)
    await passwordField.fill(ADMIN_PASSWORD)
    console.log(`✅ Filled email: ${ADMIN_EMAIL}`)
    console.log(`✅ Filled password: ${'*'.repeat(ADMIN_PASSWORD.length)}`)

    // Step 3: Submit form and wait for response
    console.log('\n📍 Step 3: Submit login form')

    // Add response listener to see server response
    page.on('response', (response) => {
      console.log(`Server response: ${response.status()} ${response.url()}`)
    })

    await submitButton.click()
    console.log('✅ Login form submitted')

    // Wait for potential redirect or error message
    await page.waitForTimeout(5000)

    console.log(`Current URL after login: ${page.url()}`)

    // Step 4: Check result
    console.log('\n📍 Step 4: Check login result')

    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      // Still on login page - check for error messages
      const errorMessage = await page.locator('text=*error*').count()
      const invalidMessage = await page.locator('text=*Invalid*').count()
      const failureMessage = await page
        .locator('.text-red-600, .text-red-500')
        .count()

      console.log(`❌ Still on login page after authentication attempt`)
      console.log(
        `Error messages found: ${errorMessage + invalidMessage + failureMessage}`
      )

      if (errorMessage > 0 || invalidMessage > 0 || failureMessage > 0) {
        const errorText = await page
          .locator('.text-red-600, .text-red-500')
          .textContent()
        console.log(`Error message: ${errorText}`)
      }
    } else {
      console.log('✅ Successfully redirected away from login page')
      console.log(`Redirected to: ${currentUrl}`)

      // Try to access the customers page
      if (!currentUrl.includes('/customers')) {
        await page.goto(`${BASE_URL}/customers`)
        await page.waitForTimeout(2000)
        console.log(`Final URL: ${page.url()}`)
      }
    }

    // Step 5: Verify we can access protected content
    console.log('\n📍 Step 5: Verify protected content access')

    try {
      await page.goto(`${BASE_URL}/customers`)
      await page.waitForLoadState('networkidle')

      const pageContent = await page.content()

      // Check if we're still being redirected to login
      if (page.url().includes('/login')) {
        console.log('❌ Authentication FAILED - Still redirected to login')
        console.log('🔍 This indicates authentication did not succeed')
      } else {
        console.log('✅ Authentication SUCCEEDED - Can access protected pages')
        console.log(`Successfully accessing: ${page.url()}`)

        // Check for common error indicators on the page
        if (
          pageContent.includes('500') ||
          pageContent.includes('Internal Server Error')
        ) {
          console.log('⚠️ Page loaded but has server errors')
        } else {
          console.log('✅ Page loaded without server errors')
        }
      }
    } catch (error) {
      console.log(`❌ Error accessing protected page: ${error}`)
    }

    console.log('\n🏁 Manual Authentication Test Complete!')
  })

  test('should test invalid credentials', async ({ page }) => {
    console.log('🚀 Starting Invalid Credentials Test...')

    await page.goto(`${BASE_URL}/login`)
    await page.waitForTimeout(1000)

    // Fill with invalid credentials
    await page.locator('input[name="email"]').fill('invalid@example.com')
    await page.locator('input[name="password"]').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()

    await page.waitForTimeout(3000)

    // Should still be on login page
    expect(page.url()).toContain('/login')
    console.log('✅ Invalid credentials correctly rejected')

    // Check for error message
    const errorElements = await page
      .locator('.text-red-600, .text-red-500')
      .count()
    if (errorElements > 0) {
      const errorText = await page
        .locator('.text-red-600, .text-red-500')
        .textContent()
      console.log(`✅ Error message displayed: ${errorText}`)
    }

    console.log('🏁 Invalid Credentials Test Complete!')
  })
})
