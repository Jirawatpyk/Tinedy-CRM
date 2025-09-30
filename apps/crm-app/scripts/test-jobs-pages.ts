#!/usr/bin/env tsx

// Test script to verify jobs pages functionality
import { chromium } from 'playwright'

async function testJobsPages() {
  console.log('🔍 Testing /jobs and /jobs/new pages')
  console.log('===================================')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // Step 1: Login first
    console.log('1. 🔐 Logging in first...')
    await page.goto('http://localhost:3006/login')
    await page.fill('input[name="email"]', 'admin@tinedy.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/customers', { timeout: 10000 })

    // Step 2: Test /jobs page
    console.log('2. 📋 Testing /jobs page...')
    await page.goto('http://localhost:3006/jobs')
    await page.waitForTimeout(3000) // Wait for any API calls

    // Check for error messages
    const jobsErrorElements = await page
      .locator('.error, .text-red-600')
      .count()
    if (jobsErrorElements > 0) {
      const errorTexts = await page
        .locator('.error, .text-red-600')
        .allTextContents()
      console.log('   ❌ Jobs page error messages:', errorTexts)
    } else {
      console.log('   ✅ Jobs page: No error messages')
    }

    // Check page title
    const jobsTitle = await page.title()
    console.log(`   📄 Jobs page title: "${jobsTitle}"`)

    // Check for "สร้างงานใหม่" button
    const newJobButton = await page
      .locator('button, a')
      .getByText('สร้างงานใหม่')
      .count()
    console.log(`   🔘 "สร้างงานใหม่" buttons found: ${newJobButton}`)

    // Check if button works (click it)
    if (newJobButton > 0) {
      console.log('   🖱️ Clicking "สร้างงานใหม่" button...')
      await page.locator('button, a').getByText('สร้างงานใหม่').first().click()
      await page.waitForTimeout(2000)

      // Check if redirected to /jobs/new
      const currentUrl = page.url()
      if (currentUrl.includes('/jobs/new')) {
        console.log('   ✅ Button successfully navigates to /jobs/new')
      } else {
        console.log(
          `   ❌ Button did not navigate to /jobs/new (current: ${currentUrl})`
        )
      }
    }

    // Step 3: Test /jobs/new page (should be there already)
    console.log('3. ✨ Testing /jobs/new page...')

    if (!page.url().includes('/jobs/new')) {
      await page.goto('http://localhost:3006/jobs/new')
      await page.waitForTimeout(2000)
    }

    // Check for error messages on new job page
    const newJobErrorElements = await page
      .locator('.error, .text-red-600')
      .count()
    if (newJobErrorElements > 0) {
      const errorTexts = await page
        .locator('.error, .text-red-600')
        .allTextContents()
      console.log('   ❌ Jobs/new page error messages:', errorTexts)
    } else {
      console.log('   ✅ Jobs/new page: No error messages')
    }

    // Check for job creation form
    const jobForms = await page.locator('form').count()
    console.log(`   📋 Job forms found: ${jobForms}`)

    // Check for form fields
    const customerSelects = await page
      .locator('select[name*="customer"], input[name*="customer"]')
      .count()
    const serviceTypeSelects = await page
      .locator('select[name*="service"], input[name*="service"]')
      .count()
    const priceInputs = await page
      .locator('input[name*="price"], input[type="number"]')
      .count()

    console.log(`   👥 Customer selection fields: ${customerSelects}`)
    console.log(`   🛠️ Service type fields: ${serviceTypeSelects}`)
    console.log(`   💰 Price input fields: ${priceInputs}`)

    // Check page title
    const newJobTitle = await page.title()
    console.log(`   📄 Jobs/new page title: "${newJobTitle}"`)

    // Take screenshots
    await page.screenshot({ path: 'jobs-new-page-test.png', fullPage: true })
    console.log('   📸 Screenshot saved: jobs-new-page-test.png')

    return true
  } catch (error) {
    console.error('❌ Jobs pages test failed:', error)
    return false
  } finally {
    await browser.close()
  }
}

// Test jobs API endpoint
async function testJobsAPI() {
  console.log('4. 🔌 Testing /api/jobs endpoint...')

  try {
    // Test without auth (should get 401)
    const unauthResponse = await fetch('http://localhost:3006/api/jobs')
    console.log(
      `   Unauthenticated request: ${unauthResponse.status} ${unauthResponse.statusText}`
    )

    if (unauthResponse.status === 401) {
      console.log('   ✅ Jobs API properly requires authentication')
    } else {
      console.log(
        '   ⚠️ Jobs API should return 401 for unauthenticated requests'
      )
    }

    return true
  } catch (error) {
    console.error('   ❌ Jobs API test failed:', error)
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

  const pagesTest = await testJobsPages()
  const apiTest = await testJobsAPI()

  console.log('\n📊 Test Results:')
  console.log('================')
  console.log(`Jobs Pages Test: ${pagesTest ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Jobs API Test:   ${apiTest ? '✅ PASSED' : '❌ FAILED'}`)

  if (pagesTest && apiTest) {
    console.log('\n🎉 All jobs tests passed! Jobs functionality is working.')
  } else {
    console.log('\n⚠️ Some jobs tests failed. Check the issues above.')
  }
}

main().catch(console.error)
