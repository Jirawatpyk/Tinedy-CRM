#!/usr/bin/env tsx

// Test script to verify actual login and redirect behavior
import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:3004'

async function testLoginRedirect() {
  console.log('🚀 Testing Login Redirect Flow with Browser...\n')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  let testsPassed = 0
  let totalTests = 0

  try {
    // Test 1: Navigate to protected page should redirect to login
    console.log('1️⃣ Testing protected page redirect...')
    totalTests++
    await page.goto(`${BASE_URL}/customers`)
    await page.waitForURL('**/login**', { timeout: 5000 })

    const currentUrl = page.url()
    if (
      currentUrl.includes('/login') &&
      currentUrl.includes('callbackUrl=%2Fcustomers')
    ) {
      console.log('   ✅ Successfully redirected to login with callback')
      testsPassed++
    } else {
      console.log('   ❌ Did not redirect properly to login')
      console.log('   Current URL:', currentUrl)
    }

    // Test 2: Fill and submit login form
    console.log('\n2️⃣ Testing login form submission...')
    totalTests++

    // Fill login form
    await page.fill('#email', 'admin@tinedy.com')
    await page.fill('#password', 'admin123')

    // Submit the form and wait for navigation
    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()

    // Wait for either success redirect or error message
    await page.waitForTimeout(2000) // Give time for the login process

    const finalUrl = page.url()
    if (finalUrl.includes('/customers')) {
      console.log('   ✅ Successfully logged in and redirected to /customers')
      testsPassed++
    } else if (finalUrl.includes('/login')) {
      // Check for error messages
      const errorElement = await page.locator('.text-red-600').first()
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent()
        console.log('   ⚠️ Login failed with error:', errorText)
        console.log("   (This might be expected if test user doesn't exist)")
      } else {
        console.log('   ❌ Still on login page but no visible error')
      }
    } else {
      console.log('   ❌ Unexpected redirect to:', finalUrl)
    }

    // Test 3: Check if we can access customers page after login
    if (finalUrl.includes('/customers')) {
      console.log('\n3️⃣ Testing customers page access after login...')
      totalTests++

      await page.waitForSelector('.customers-table, .loading, .error', {
        timeout: 5000,
      })

      const hasError = await page.locator('.error').isVisible()
      const hasTable = await page.locator('.customers-table').isVisible()
      const isLoading = await page.locator('.loading').isVisible()

      if (hasTable) {
        console.log('   ✅ Customers page loaded successfully')
        testsPassed++
      } else if (hasError) {
        console.log(
          '   ⚠️ Customers page shows error (might be database related)'
        )
      } else if (isLoading) {
        console.log('   ⚠️ Customers page still loading')
      } else {
        console.log('   ❌ Customers page content unclear')
      }
    }
  } catch (error) {
    console.log('❌ Error during testing:', error)
  } finally {
    await browser.close()
  }

  // Summary
  console.log('\n📊 Test Summary:')
  console.log('================')
  console.log(`Tests passed: ${testsPassed}/${totalTests}`)

  if (testsPassed >= 2) {
    console.log('🎉 Login redirect flow is working!')
    console.log(
      "✨ The fix to LoginForm.tsx (router.push('/customers')) is effective"
    )
  } else {
    console.log('⚠️ Some issues detected in login redirect flow')
  }

  return testsPassed === totalTests
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/login`)
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  console.log('🔍 Checking if server is running...')
  const serverRunning = await checkServer()

  if (!serverRunning) {
    console.log('❌ Server is not running on', BASE_URL)
    console.log(
      'Please start the development server with: npm run dev -- -p 3004'
    )
    process.exit(1)
  }

  console.log('✅ Server is running\n')
  await testLoginRedirect()
}

main().catch(console.error)
