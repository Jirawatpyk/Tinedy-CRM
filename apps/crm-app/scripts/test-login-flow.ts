#!/usr/bin/env tsx

// Test script to verify login flow and redirect
import { JSDOM } from 'jsdom'

const BASE_URL = 'http://localhost:3004'

interface TestResult {
  test: string
  passed: boolean
  message: string
}

const results: TestResult[] = []

async function testLoginPageAccess() {
  try {
    console.log('🔍 Testing login page access...')
    const response = await fetch(`${BASE_URL}/login`)

    if (response.ok) {
      const html = await response.text()
      const hasLoginForm = html.includes('Enter your email and password')

      results.push({
        test: 'Login Page Access',
        passed: hasLoginForm,
        message: hasLoginForm
          ? 'Login page loads correctly with form'
          : 'Login page missing form elements',
      })
    } else {
      results.push({
        test: 'Login Page Access',
        passed: false,
        message: `Login page returned ${response.status}`,
      })
    }
  } catch (error) {
    results.push({
      test: 'Login Page Access',
      passed: false,
      message: `Error accessing login page: ${error}`,
    })
  }
}

async function testProtectedPageRedirect() {
  try {
    console.log('🔍 Testing protected page redirect...')
    const response = await fetch(`${BASE_URL}/customers`, {
      redirect: 'manual', // Don't follow redirects automatically
    })

    if (response.status === 302 || response.status === 307) {
      const location = response.headers.get('location') || ''
      const redirectsToLogin =
        location.includes('/login') && location.includes('callbackUrl')

      results.push({
        test: 'Protected Page Redirect',
        passed: redirectsToLogin,
        message: redirectsToLogin
          ? `Correctly redirects to: ${location}`
          : `Unexpected redirect to: ${location}`,
      })
    } else {
      results.push({
        test: 'Protected Page Redirect',
        passed: false,
        message: `Expected redirect but got ${response.status}`,
      })
    }
  } catch (error) {
    results.push({
      test: 'Protected Page Redirect',
      passed: false,
      message: `Error testing redirect: ${error}`,
    })
  }
}

async function testApiEndpointSecurity() {
  try {
    console.log('🔍 Testing API endpoint security...')
    const response = await fetch(`${BASE_URL}/api/customers`)

    const isUnauthorized = response.status === 401

    results.push({
      test: 'API Endpoint Security',
      passed: isUnauthorized,
      message: isUnauthorized
        ? 'API correctly returns 401 Unauthorized'
        : `API returned ${response.status} instead of 401`,
    })
  } catch (error) {
    results.push({
      test: 'API Endpoint Security',
      passed: false,
      message: `Error testing API security: ${error}`,
    })
  }
}

async function testServerResponsiveness() {
  try {
    console.log('🔍 Testing server responsiveness...')
    const startTime = Date.now()
    const response = await fetch(`${BASE_URL}/login`)
    const endTime = Date.now()

    const responseTime = endTime - startTime
    const isResponsive = response.ok && responseTime < 2000 // Less than 2 seconds

    results.push({
      test: 'Server Responsiveness',
      passed: isResponsive,
      message: isResponsive
        ? `Server responds in ${responseTime}ms`
        : `Server slow or unresponsive (${responseTime}ms)`,
    })
  } catch (error) {
    results.push({
      test: 'Server Responsiveness',
      passed: false,
      message: `Server connection error: ${error}`,
    })
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Flow Tests...\n')

  await testServerResponsiveness()
  await testLoginPageAccess()
  await testProtectedPageRedirect()
  await testApiEndpointSecurity()

  console.log('\n📊 Test Results:')
  console.log('================')

  let passedTests = 0
  results.forEach((result) => {
    const status = result.passed ? '✅' : '❌'
    console.log(`${status} ${result.test}: ${result.message}`)
    if (result.passed) passedTests++
  })

  console.log(`\n📈 Summary: ${passedTests}/${results.length} tests passed`)

  if (passedTests === results.length) {
    console.log('🎉 All authentication flow tests passed!')
    console.log('✨ LoginForm redirect fix appears to be working correctly')
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.')
  }
}

// Run the tests
runTests().catch(console.error)
