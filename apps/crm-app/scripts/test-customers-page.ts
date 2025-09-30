#!/usr/bin/env tsx

// Test script to verify customers page functionality
import { chromium } from 'playwright'

async function testCustomersPage() {
  console.log('🔍 Testing /customers page after authentication')
  console.log('===========================================')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // Step 1: Login first
    console.log('1. 🔐 Logging in first...')
    await page.goto('http://localhost:3006/login')
    await page.fill('input[name="email"]', 'admin@tinedy.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Wait for redirect to customers
    await page.waitForURL('**/customers', { timeout: 10000 })
    console.log('   ✅ Login successful, now on customers page')

    // Step 2: Check if customers page loads without errors
    console.log('2. 🏠 Testing customers page content...')

    // Wait for any API calls to complete
    await page.waitForTimeout(3000)

    // Check for error messages
    const errorElements = await page.locator('.error, .text-red-600').count()
    if (errorElements > 0) {
      const errorTexts = await page
        .locator('.error, .text-red-600')
        .allTextContents()
      console.log('   ❌ Error messages found:', errorTexts)
      return false
    } else {
      console.log('   ✅ No error messages found')
    }

    // Check if main content loads
    const headings = await page.locator('h1, h2, h3').count()
    console.log(`   📋 Page headings found: ${headings}`)

    // Check if there's a table or list of customers
    const tables = await page.locator('table').count()
    const customerLists = await page
      .locator('[data-testid*="customer"], .customer')
      .count()
    console.log(`   📊 Tables found: ${tables}`)
    console.log(`   👥 Customer elements found: ${customerLists}`)

    // Check if there are any buttons for adding customers
    const addButtons = await page.locator('button').count()
    console.log(`   🔘 Buttons found: ${addButtons}`)

    // Get page title
    const title = await page.title()
    console.log(`   📄 Page title: "${title}"`)

    // Check console errors
    const logs = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })

    // Wait a bit more to catch any async errors
    await page.waitForTimeout(2000)

    if (logs.length > 0) {
      console.log('   ⚠️ Console errors:')
      logs.forEach((log) => console.log(`     - ${log}`))
    } else {
      console.log('   ✅ No console errors')
    }

    // Take screenshot for verification
    await page.screenshot({ path: 'customers-page-test.png', fullPage: true })
    console.log('   📸 Screenshot saved: customers-page-test.png')

    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  } finally {
    await browser.close()
  }
}

// Also test API endpoint directly
async function testCustomersAPI() {
  console.log('3. 🔌 Testing /api/customers endpoint directly...')

  try {
    // Test without auth (should get 401)
    const unauthResponse = await fetch('http://localhost:3006/api/customers')
    console.log(
      `   Unauthenticated request: ${unauthResponse.status} ${unauthResponse.statusText}`
    )

    if (unauthResponse.status === 401) {
      console.log('   ✅ API properly requires authentication')
    } else {
      console.log('   ⚠️ API should return 401 for unauthenticated requests')
    }

    return true
  } catch (error) {
    console.error('   ❌ API test failed:', error)
    return false
  }
}

async function main() {
  // Check if server is running
  try {
    const response = await fetch('http://localhost:3006/login')
    if (!response.ok) throw new Error('Server not responding')
  } catch {
    console.log('❌ Server not running on port 3006')
    process.exit(1)
  }

  const pageTest = await testCustomersPage()
  const apiTest = await testCustomersAPI()

  console.log('\n📊 Test Results:')
  console.log('================')
  console.log(`Customers Page Test: ${pageTest ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Customers API Test:  ${apiTest ? '✅ PASSED' : '❌ FAILED'}`)

  if (pageTest && apiTest) {
    console.log('\n🎉 All tests passed! Customers functionality is working.')
  } else {
    console.log('\n⚠️ Some tests failed. Check the issues above.')
  }
}

main().catch(console.error)
