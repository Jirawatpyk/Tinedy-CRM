#!/usr/bin/env tsx

// Manual test script to debug login issues
import { chromium } from 'playwright'

async function testLoginManual() {
  console.log('🔍 Manual Login Test - Step by Step Debug')
  console.log('=====================================')

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    slowMo: 1000, // Slow down actions
  })

  const page = await browser.newPage()

  try {
    console.log('1. 🌐 Navigating to login page...')
    await page.goto('http://localhost:3006/login', { waitUntil: 'networkidle' })

    console.log('2. 📸 Taking screenshot of login page...')
    await page.screenshot({ path: 'login-debug.png', fullPage: true })

    console.log('3. 🔍 Checking page elements...')

    // Check if form exists
    const form = await page.locator('form').count()
    console.log(`   Forms found: ${form}`)

    // Check if email input exists
    const emailInput = await page.locator('input[name="email"]').count()
    console.log(`   Email inputs found: ${emailInput}`)

    // Check if password input exists
    const passwordInput = await page.locator('input[name="password"]').count()
    console.log(`   Password inputs found: ${passwordInput}`)

    // Check if submit button exists
    const submitButton = await page.locator('button[type="submit"]').count()
    console.log(`   Submit buttons found: ${submitButton}`)

    if (emailInput > 0 && passwordInput > 0) {
      console.log('4. 💾 Filling login form...')
      await page.fill('input[name="email"]', 'admin@tinedy.com')
      await page.fill('input[name="password"]', 'admin123')

      console.log('5. 📤 Submitting form...')

      // Wait for any response after submit
      const responsePromise = page.waitForResponse('**', { timeout: 10000 })
      await page.click('button[type="submit"]')

      try {
        const response = await responsePromise
        console.log(`   Response URL: ${response.url()}`)
        console.log(`   Response Status: ${response.status()}`)

        // Wait for potential redirect
        await page.waitForTimeout(3000)

        const currentUrl = page.url()
        console.log(`   Current URL after submit: ${currentUrl}`)

        if (currentUrl.includes('/customers')) {
          console.log('✅ SUCCESS: Redirected to customers page!')
        } else if (currentUrl.includes('/login')) {
          console.log('❌ FAILED: Still on login page')

          // Check for error messages
          const errorMessages = await page
            .locator('.text-red-600')
            .allTextContents()
          if (errorMessages.length > 0) {
            console.log('   Error messages found:', errorMessages)
          } else {
            console.log('   No visible error messages')
          }
        } else {
          console.log(`⚠️  UNEXPECTED: Redirected to ${currentUrl}`)
        }
      } catch (error) {
        console.log('❌ No response received or timeout')
        console.log('   Error:', error.message)
      }
    } else {
      console.log('❌ CRITICAL: Login form elements missing!')
    }

    // Keep browser open for 10 seconds for manual inspection
    console.log('6. 🔍 Keeping browser open for manual inspection...')
    await page.waitForTimeout(10000)
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await browser.close()
  }
}

// Check server first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3006/login')
    return response.ok
  } catch {
    console.log('❌ Server not running on port 3006, trying 3004...')
    try {
      const response = await fetch('http://localhost:3004/login')
      return response.ok
    } catch {
      return false
    }
  }
}

async function main() {
  const serverRunning = await checkServer()

  if (!serverRunning) {
    console.log('❌ Server is not running on port 3006 or 3004')
    console.log('Please start the development server first')
    process.exit(1)
  }

  console.log('✅ Server is running')
  await testLoginManual()
}

main().catch(console.error)
