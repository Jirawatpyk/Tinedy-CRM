#!/usr/bin/env tsx

// Comprehensive API testing script
import { chromium } from 'playwright'

async function getAllCookies() {
  console.log('🔐 Getting authentication cookies...')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto('http://localhost:3006/login')
    await page.fill('input[name="email"]', 'admin@tinedy.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/customers', { timeout: 10000 })

    const cookies = await page.context().cookies()
    const cookieString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    console.log('   ✅ Authentication successful')
    await browser.close()
    return cookieString
  } catch (error) {
    await browser.close()
    throw error
  }
}

async function testAPIEndpoint(
  url: string,
  method: string = 'GET',
  body?: any,
  cookies?: string
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookies && { Cookie: cookies }),
    },
    ...(body && { body: JSON.stringify(body) }),
  }

  try {
    const response = await fetch(url, options)
    const contentType = response.headers.get('content-type')

    let responseData
    if (contentType?.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    return {
      status: response.status,
      statusText: response.statusText,
      contentType,
      data: responseData,
      success: response.ok,
    }
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      error: error.message,
      success: false,
    }
  }
}

async function testAllAPIs() {
  console.log('🔍 Comprehensive API Testing')
  console.log('============================')

  const baseUrl = 'http://localhost:3006'

  // Get authentication cookies
  let cookies = ''
  try {
    cookies = await getAllCookies()
  } catch (error) {
    console.log('❌ Failed to get authentication cookies:', error.message)
    return false
  }

  const tests = [
    // Authentication endpoints (should return 200 without auth)
    {
      name: 'Auth Session (GET)',
      url: `${baseUrl}/api/auth/session`,
      method: 'GET',
      needsAuth: false,
      expectStatus: 200,
    },
    {
      name: 'Auth Providers (GET)',
      url: `${baseUrl}/api/auth/providers`,
      method: 'GET',
      needsAuth: false,
      expectStatus: 200,
    },
    {
      name: 'Auth CSRF (GET)',
      url: `${baseUrl}/api/auth/csrf`,
      method: 'GET',
      needsAuth: false,
      expectStatus: 200,
    },

    // Customers endpoints
    {
      name: 'Customers List (GET)',
      url: `${baseUrl}/api/customers`,
      method: 'GET',
      needsAuth: true,
    },
    {
      name: 'Customers with Pagination',
      url: `${baseUrl}/api/customers?page=1&limit=10`,
      method: 'GET',
      needsAuth: true,
    },
    {
      name: 'Customers with Search',
      url: `${baseUrl}/api/customers?q=test&page=1&limit=5`,
      method: 'GET',
      needsAuth: true,
    },

    // Jobs endpoints
    {
      name: 'Jobs List (GET)',
      url: `${baseUrl}/api/jobs`,
      method: 'GET',
      needsAuth: true,
    },
    {
      name: 'Jobs with Pagination',
      url: `${baseUrl}/api/jobs?page=1&limit=10`,
      method: 'GET',
      needsAuth: true,
    },

    // Users endpoints
    {
      name: 'Users List (GET)',
      url: `${baseUrl}/api/users`,
      method: 'GET',
      needsAuth: true,
    },
    {
      name: 'Operations Users',
      url: `${baseUrl}/api/users?role=OPERATIONS`,
      method: 'GET',
      needsAuth: true,
    },

    // Security tests (should return 401)
    {
      name: 'Customers Unauthorized',
      url: `${baseUrl}/api/customers`,
      method: 'GET',
      needsAuth: false,
      expectStatus: 401,
    },
    {
      name: 'Jobs Unauthorized',
      url: `${baseUrl}/api/jobs`,
      method: 'GET',
      needsAuth: false,
      expectStatus: 401,
    },
    {
      name: 'Users Unauthorized',
      url: `${baseUrl}/api/users`,
      method: 'GET',
      needsAuth: false,
      expectStatus: 401,
    },
  ]

  console.log(`\n🧪 Running ${tests.length} API tests...\n`)

  let passedTests = 0
  let failedTests = 0

  for (const test of tests) {
    const testCookies = test.needsAuth ? cookies : undefined
    const result = await testAPIEndpoint(
      test.url,
      test.method,
      undefined,
      testCookies
    )

    const expectedStatus = test.expectStatus || (test.needsAuth ? 200 : 401)
    const passed = result.status === expectedStatus

    if (passed) {
      passedTests++
      console.log(`✅ ${test.name}: ${result.status} ${result.statusText}`)

      // Show some data info for successful requests
      if (result.success && result.data && typeof result.data === 'object') {
        if (Array.isArray(result.data)) {
          console.log(`   📊 Returned ${result.data.length} items`)
        } else if (result.data.customers) {
          console.log(`   👥 Customers: ${result.data.customers.length} items`)
        } else if (result.data.jobs) {
          console.log(`   📋 Jobs: ${result.data.jobs.length} items`)
        } else if (result.data.users) {
          console.log(`   👤 Users: ${result.data.users.length} items`)
        }
      }
    } else {
      failedTests++
      console.log(
        `❌ ${test.name}: Expected ${expectedStatus}, got ${result.status} ${result.statusText}`
      )
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    }
  }

  // Test data creation (POST endpoints)
  console.log('\n🆕 Testing data creation endpoints...')

  const createTests = [
    {
      name: 'Create Customer',
      url: `${baseUrl}/api/customers`,
      method: 'POST',
      body: {
        name: 'Test Customer API',
        phone: `081${Date.now().toString().slice(-7)}`, // Generate unique phone
        address: 'Test Address',
        contactChannel: 'LINE',
      },
    },
  ]

  for (const test of createTests) {
    const result = await testAPIEndpoint(
      test.url,
      test.method,
      test.body,
      cookies
    )

    if (result.success) {
      passedTests++
      console.log(`✅ ${test.name}: ${result.status} ${result.statusText}`)
    } else {
      failedTests++
      console.log(`❌ ${test.name}: ${result.status} ${result.statusText}`)
      if (result.data && typeof result.data === 'object') {
        console.log(`   Response:`, JSON.stringify(result.data, null, 2))
      }
    }
  }

  console.log('\n📊 API Test Results:')
  console.log('====================')
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(
    `📈 Success Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`
  )

  return failedTests === 0
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

  const success = await testAllAPIs()

  if (success) {
    console.log(
      '\n🎉 All API tests passed! All endpoints are working correctly.'
    )
  } else {
    console.log('\n⚠️ Some API tests failed. Please check the issues above.')
  }
}

main().catch(console.error)
