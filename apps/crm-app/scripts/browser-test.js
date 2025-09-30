/**
 * Browser-based Testing with Manual Steps
 * ทดสอบผ่าน browser automation แทน API calls
 */

const { chromium } = require('playwright')

async function runBrowserTest() {
  console.log('🌐 Starting Browser-Based QA Testing...\n')

  let browser, page

  try {
    // Launch browser
    browser = await chromium.launch({ headless: false, slowMo: 1000 })
    const context = await browser.newContext()
    page = await context.newPage()

    // Enable console logging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`🔴 Browser Console Error: ${msg.text()}`)
      }
    })

    // Test 1: Access login page
    console.log('🔍 Test 1: Accessing login page...')
    try {
      await page.goto('http://localhost:3002/login', {
        waitUntil: 'networkidle',
      })

      // Check if login form exists
      const loginForm = await page.$('form')
      const emailInput = await page.$('input[type="email"]')
      const passwordInput = await page.$('input[type="password"]')

      if (loginForm && emailInput && passwordInput) {
        console.log('✅ Login page loaded successfully with form elements')
      } else {
        console.log('❌ Login page missing form elements')
        console.log(
          `Form: ${!!loginForm}, Email: ${!!emailInput}, Password: ${!!passwordInput}`
        )
      }
    } catch (error) {
      console.log('❌ Failed to access login page:', error.message)
    }

    // Test 2: Perform login
    console.log('\n🔐 Test 2: Performing login...')
    try {
      await page.fill('input[type="email"]', 'admin@tinedy.com')
      await page.fill('input[type="password"]', 'admin123')

      // Click login button
      await page.click('button[type="submit"]')

      // Wait for navigation
      await page.waitForLoadState('networkidle', { timeout: 10000 })

      const currentUrl = page.url()
      console.log(`Current URL after login: ${currentUrl}`)

      if (currentUrl.includes('/login')) {
        console.log('❌ Still on login page - authentication may have failed')

        // Check for error messages
        const errorMsg = await page.$('.text-red-600')
        if (errorMsg) {
          const errorText = await errorMsg.textContent()
          console.log(`Error message: ${errorText}`)
        }
      } else {
        console.log('✅ Successfully redirected after login')
      }
    } catch (error) {
      console.log('❌ Login process failed:', error.message)
    }

    // Test 3: Try accessing customers page
    console.log('\n📋 Test 3: Accessing customers page...')
    try {
      await page.goto('http://localhost:3002/customers', {
        waitUntil: 'networkidle',
      })

      const currentUrl = page.url()
      console.log(`Customers page URL: ${currentUrl}`)

      if (currentUrl.includes('/customers') && !currentUrl.includes('/login')) {
        console.log('✅ Customers page accessible')

        // Check for table or customer data
        const customerTable = await page.$(
          'table, .customers-table, [role="table"]'
        )
        const customerList = await page.$('.customer-item, .customer-row')

        if (customerTable || customerList) {
          console.log('✅ Customer data/table found on page')
        } else {
          console.log('⚠️ Customers page loaded but no data table found')
        }
      } else {
        console.log('❌ Redirected away from customers page (likely to login)')
      }
    } catch (error) {
      console.log('❌ Failed to access customers page:', error.message)
    }

    // Test 4: Try accessing jobs page
    console.log('\n💼 Test 4: Accessing jobs page...')
    try {
      await page.goto('http://localhost:3002/jobs', {
        waitUntil: 'networkidle',
      })

      const currentUrl = page.url()
      console.log(`Jobs page URL: ${currentUrl}`)

      if (currentUrl.includes('/jobs') && !currentUrl.includes('/login')) {
        console.log('✅ Jobs page accessible')

        // Check for "Create New Job" button
        const createButton = await page.$(
          'text=สร้างงานใหม่, text=Create Job, text=New Job'
        )
        if (createButton) {
          console.log('✅ Create Job button found')
        } else {
          console.log('⚠️ Create Job button not found')
        }
      } else {
        console.log('❌ Redirected away from jobs page (likely to login)')
      }
    } catch (error) {
      console.log('❌ Failed to access jobs page:', error.message)
    }

    // Test 5: Check for JavaScript errors
    console.log('\n🔍 Test 5: Checking for JavaScript errors...')
    await page.evaluate(() => {
      // Trigger any potential client-side errors
      console.log('Client-side script executing...')
    })

    // Test 6: Try creating a customer
    console.log('\n➕ Test 6: Testing customer creation...')
    try {
      await page.goto('http://localhost:3002/customers/new', {
        waitUntil: 'networkidle',
      })

      const currentUrl = page.url()
      if (currentUrl.includes('/customers/new')) {
        console.log('✅ New customer page accessible')

        // Try filling the form
        const nameInput = await page.$(
          'input[name="name"], input[placeholder*="name"], input[placeholder*="ชื่อ"]'
        )
        const phoneInput = await page.$(
          'input[name="phone"], input[placeholder*="phone"], input[placeholder*="เบอร์"]'
        )

        if (nameInput && phoneInput) {
          console.log('✅ Customer form fields found')
        } else {
          console.log('⚠️ Customer form fields missing')
        }
      } else {
        console.log('❌ Cannot access new customer page')
      }
    } catch (error) {
      console.log('❌ Failed to test customer creation:', error.message)
    }
  } catch (error) {
    console.log('💥 Browser testing failed:', error)
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  console.log('\n📊 Browser testing completed!')
}

// Run the test
runBrowserTest().catch((error) => {
  console.error('💥 Test execution failed:', error)
  process.exit(1)
})
