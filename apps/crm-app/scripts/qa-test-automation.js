/**
 * QA Test Automation Script for Tinedy CRM
 * ทดสอบ API endpoints และ functionality ต่างๆ
 */

const axios = require('axios')

const BASE_URL = 'http://localhost:3003'
const TEST_CREDENTIALS = {
  email: 'admin@tinedy.com',
  password: 'admin123',
}

let authCookies = ''

// Helper function สำหรับแสดงผลการทดสอบ
function logResult(testName, success, message = '', details = null) {
  const status = success ? '✅ PASS' : '❌ FAIL'
  console.log(`${status} ${testName}`)
  if (message) console.log(`   ${message}`)
  if (details && !success) {
    console.log(`   Details:`, details)
  }
  console.log('')
}

// Helper function สำหรับทำ HTTP requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookies,
        ...headers,
      },
      timeout: 10000,
    }

    if (data) {
      config.data = data
    }

    const response = await axios(config)
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : 0,
      details: error.message,
    }
  }
}

// Test 1: ทดสอบการเข้าถึงหน้า Login
async function testLoginPage() {
  console.log('🧪 Testing Login Page Access...')

  try {
    const response = await axios.get(`${BASE_URL}/login`, { timeout: 5000 })
    const hasLoginForm =
      response.data.includes('login') || response.data.includes('Login')
    logResult(
      'Login Page Access',
      response.status === 200 && hasLoginForm,
      `Status: ${response.status}, Contains login form: ${hasLoginForm}`
    )
    return response.status === 200
  } catch (error) {
    logResult(
      'Login Page Access',
      false,
      'Failed to access login page',
      error.message
    )
    return false
  }
}

// Test 2: ทดสอบการ Login
async function testAuthentication() {
  console.log('🔐 Testing Authentication...')

  try {
    // ทดสอบการ login ผ่าน NextAuth
    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/callback/credentials`,
      {
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password,
        callbackUrl: '/',
        json: true,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status < 400 // Accept redirects as success
        },
      }
    )

    // Extract cookies from response
    if (loginResponse.headers['set-cookie']) {
      authCookies = loginResponse.headers['set-cookie'].join('; ')
    }

    logResult(
      'Authentication',
      loginResponse.status === 302 || loginResponse.status === 200,
      `Login response status: ${loginResponse.status}`
    )

    return loginResponse.status === 302 || loginResponse.status === 200
  } catch (error) {
    logResult('Authentication', false, 'Login failed', error.message)
    return false
  }
}

// Test 3: ทดสอบ API /api/customers GET
async function testCustomersAPI() {
  console.log('📋 Testing Customers API...')

  const result = await makeRequest('GET', '/api/customers')

  if (result.success) {
    const hasExpectedFields =
      result.data.customers !== undefined &&
      result.data.pagination !== undefined
    logResult(
      'Customers API GET',
      hasExpectedFields,
      `Status: ${result.status}, Has customers array: ${!!result.data.customers}, Has pagination: ${!!result.data.pagination}`
    )
    return hasExpectedFields
  } else {
    logResult(
      'Customers API GET',
      false,
      `Status: ${result.status}, Error: ${JSON.stringify(result.error)}`
    )
    return false
  }
}

// Test 4: ทดสอบ API /api/jobs GET
async function testJobsAPI() {
  console.log('💼 Testing Jobs API...')

  const result = await makeRequest('GET', '/api/jobs')

  if (result.success) {
    const hasJobsData = result.data.jobs !== undefined
    logResult(
      'Jobs API GET',
      hasJobsData,
      `Status: ${result.status}, Has jobs array: ${hasJobsData}`
    )
    return hasJobsData
  } else {
    logResult(
      'Jobs API GET',
      false,
      `Status: ${result.status}, Error: ${JSON.stringify(result.error)}`
    )
    return false
  }
}

// Test 5: ทดสอบการสร้างลูกค้าใหม่
async function testCreateCustomer() {
  console.log('➕ Testing Create Customer...')

  const testCustomer = {
    name: `Test Customer ${Date.now()}`,
    phone: `081${Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(7, '0')}`,
    address: 'Test Address Bangkok',
    contactChannel: 'LINE',
  }

  const result = await makeRequest('POST', '/api/customers', testCustomer)

  if (result.success) {
    const isValidCustomer =
      result.data.id && result.data.name === testCustomer.name
    logResult(
      'Create Customer',
      isValidCustomer,
      `Status: ${result.status}, Customer ID: ${result.data.id}`
    )
    return { success: isValidCustomer, customerId: result.data.id }
  } else {
    logResult(
      'Create Customer',
      false,
      `Status: ${result.status}, Error: ${JSON.stringify(result.error)}`
    )
    return { success: false }
  }
}

// Test 6: ทดสอบการสร้างงานใหม่
async function testCreateJob(customerId) {
  console.log('🔧 Testing Create Job...')

  if (!customerId) {
    logResult('Create Job', false, 'No customer ID available for job creation')
    return false
  }

  const testJob = {
    customerId: customerId,
    serviceType: 'CLEANING',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    price: 1500,
    description: 'Test job creation',
    priority: 'MEDIUM',
  }

  const result = await makeRequest('POST', '/api/jobs', testJob)

  if (result.success) {
    const isValidJob = result.data.id && result.data.customerId === customerId
    logResult(
      'Create Job',
      isValidJob,
      `Status: ${result.status}, Job ID: ${result.data.id}`
    )
    return isValidJob
  } else {
    logResult(
      'Create Job',
      false,
      `Status: ${result.status}, Error: ${JSON.stringify(result.error)}`
    )
    return false
  }
}

// Test 7: ทดสอบการเข้าถึงหน้าต่างๆ หลังจาก login
async function testPageAccess() {
  console.log('🌐 Testing Page Access...')

  const pagesToTest = [
    { path: '/', name: 'Dashboard' },
    { path: '/customers', name: 'Customers Page' },
    { path: '/jobs', name: 'Jobs Page' },
    { path: '/customers/new', name: 'New Customer Page' },
    { path: '/jobs/new', name: 'New Job Page' },
  ]

  let passedPages = 0

  for (const page of pagesToTest) {
    try {
      const response = await axios.get(`${BASE_URL}${page.path}`, {
        headers: { Cookie: authCookies },
        timeout: 5000,
        maxRedirects: 0,
        validateStatus: function (status) {
          return status < 400 // Accept all 2xx and 3xx status codes
        },
      })

      const isSuccess = response.status === 200
      logResult(
        `Page Access - ${page.name}`,
        isSuccess,
        `Status: ${response.status}, Path: ${page.path}`
      )

      if (isSuccess) passedPages++
    } catch (error) {
      logResult(
        `Page Access - ${page.name}`,
        false,
        `Path: ${page.path}, Error: ${error.message}`
      )
    }
  }

  return passedPages
}

// Main testing function
async function runQATests() {
  console.log('🚀 Starting Tinedy CRM QA Test Automation')
  console.log('='.repeat(50))

  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
  }

  // Test 1: Login Page
  testResults.total++
  if (await testLoginPage()) {
    testResults.passed++
  } else {
    testResults.failed++
  }

  // Test 2: Authentication
  testResults.total++
  const authSuccess = await testAuthentication()
  if (authSuccess) {
    testResults.passed++
  } else {
    testResults.failed++
    console.log('❌ Authentication failed - skipping protected route tests')
    return testResults
  }

  // Test 3: Customers API
  testResults.total++
  if (await testCustomersAPI()) {
    testResults.passed++
  } else {
    testResults.failed++
  }

  // Test 4: Jobs API
  testResults.total++
  if (await testJobsAPI()) {
    testResults.passed++
  } else {
    testResults.failed++
  }

  // Test 5: Create Customer
  testResults.total++
  const customerResult = await testCreateCustomer()
  if (customerResult.success) {
    testResults.passed++
  } else {
    testResults.failed++
  }

  // Test 6: Create Job (if customer creation succeeded)
  if (customerResult.customerId) {
    testResults.total++
    if (await testCreateJob(customerResult.customerId)) {
      testResults.passed++
    } else {
      testResults.failed++
    }
  }

  // Test 7: Page Access
  const pageResults = await testPageAccess()
  testResults.total += 5 // We test 5 pages
  testResults.passed += pageResults
  testResults.failed += 5 - pageResults

  return testResults
}

// Execute tests
runQATests()
  .then((results) => {
    console.log('📊 QA TEST SUMMARY')
    console.log('='.repeat(30))
    console.log(`Total Tests: ${results.total}`)
    console.log(`✅ Passed: ${results.passed}`)
    console.log(`❌ Failed: ${results.failed}`)
    console.log(
      `Success Rate: ${Math.round((results.passed / results.total) * 100)}%`
    )

    if (results.failed === 0) {
      console.log('\n🎉 All tests passed! System is working correctly.')
    } else {
      console.log(
        `\n⚠️  ${results.failed} test(s) failed. Please check the issues above.`
      )
    }

    process.exit(results.failed === 0 ? 0 : 1)
  })
  .catch((error) => {
    console.error('💥 Test execution failed:', error)
    process.exit(1)
  })
