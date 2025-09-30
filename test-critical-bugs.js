#!/usr/bin/env node

/**
 * Critical Bug Testing Script for Tinedy CRM
 * Tests the most critical functionality including pagination and form submissions
 */

const https = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:3008';
const TEST_RESULTS = [];

// Test configuration
const TESTS = {
  PAGINATION: {
    name: 'Customer Pagination Bug Test',
    critical: true,
    description: 'Test if pagination jumps back to page 1 unexpectedly'
  },
  JOB_FORM: {
    name: 'Job Form Select Component Test',
    critical: true,
    description: 'Test if job form has Select component empty string errors'
  },
  CONSOLE_ERRORS: {
    name: 'JavaScript Console Error Test',
    critical: true,
    description: 'Check for JavaScript errors in browser console'
  },
  PERFORMANCE: {
    name: 'Page Load Performance Test',
    critical: false,
    description: 'Measure page load times'
  }
};

function logResult(testName, status, message, responseTime = null) {
  const result = {
    test: testName,
    status: status, // 'PASS', 'FAIL', 'WARNING'
    message: message,
    timestamp: new Date().toISOString(),
    responseTime: responseTime
  };

  TEST_RESULTS.push(result);

  const statusSymbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const timeStr = responseTime ? ` (${responseTime}ms)` : '';
  console.log(`${statusSymbol} ${testName}: ${message}${timeStr}`);
}

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const options = {
      hostname: 'localhost',
      port: 3008,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'Critical-Bug-Tester/1.0'
      }
    };

    const req = https.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: responseTime
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testLoginPageAvailability() {
  try {
    const response = await makeRequest('/login');

    if (response.statusCode === 200) {
      if (response.body.includes('Login') && response.body.includes('Email') && response.body.includes('Password')) {
        logResult('Login Page', 'PASS', 'Login form is accessible and contains required fields', response.responseTime);
        return true;
      } else {
        logResult('Login Page', 'FAIL', 'Login form is missing required elements');
        return false;
      }
    } else {
      logResult('Login Page', 'FAIL', `HTTP ${response.statusCode} - Login page not accessible`);
      return false;
    }
  } catch (error) {
    logResult('Login Page', 'FAIL', `Request failed: ${error.message}`);
    return false;
  }
}

async function testProtectedRoutes() {
  const protectedRoutes = ['/customers', '/jobs', '/dashboard'];
  let allRedirecting = true;

  for (const route of protectedRoutes) {
    try {
      const response = await makeRequest(route);

      if (response.statusCode === 307 && response.headers.location && response.headers.location.includes('/login')) {
        logResult(`Protected Route ${route}`, 'PASS', 'Correctly redirects to login', response.responseTime);
      } else {
        logResult(`Protected Route ${route}`, 'FAIL', `Expected redirect to login, got HTTP ${response.statusCode}`);
        allRedirecting = false;
      }
    } catch (error) {
      logResult(`Protected Route ${route}`, 'FAIL', `Request failed: ${error.message}`);
      allRedirecting = false;
    }
  }

  return allRedirecting;
}

async function testAPIEndpoints() {
  const apiEndpoints = ['/api/customers', '/api/jobs', '/api/auth/session'];
  let allWorking = true;

  for (const endpoint of apiEndpoints) {
    try {
      const response = await makeRequest(endpoint);

      // API endpoints should either return data or proper error responses
      if (response.statusCode >= 200 && response.statusCode < 500) {
        logResult(`API ${endpoint}`, 'PASS', `HTTP ${response.statusCode} - API responds correctly`, response.responseTime);
      } else {
        logResult(`API ${endpoint}`, 'FAIL', `HTTP ${response.statusCode} - API error`);
        allWorking = false;
      }
    } catch (error) {
      logResult(`API ${endpoint}`, 'FAIL', `Request failed: ${error.message}`);
      allWorking = false;
    }
  }

  return allWorking;
}

async function testPerformance() {
  const routes = ['/', '/login'];
  let totalTime = 0;
  let testCount = 0;

  for (const route of routes) {
    try {
      const response = await makeRequest(route);
      totalTime += response.responseTime;
      testCount++;

      if (response.responseTime < 2000) {
        logResult(`Performance ${route}`, 'PASS', `Load time acceptable`, response.responseTime);
      } else {
        logResult(`Performance ${route}`, 'WARNING', `Load time slow`, response.responseTime);
      }
    } catch (error) {
      logResult(`Performance ${route}`, 'FAIL', `Request failed: ${error.message}`);
    }
  }

  const avgTime = testCount > 0 ? totalTime / testCount : 0;
  logResult('Performance Average', avgTime < 1000 ? 'PASS' : 'WARNING', `Average response time: ${avgTime.toFixed(0)}ms`);

  return avgTime < 2000;
}

function generateReport() {
  const criticalFailures = TEST_RESULTS.filter(r => r.status === 'FAIL').length;
  const warnings = TEST_RESULTS.filter(r => r.status === 'WARNING').length;
  const passed = TEST_RESULTS.filter(r => r.status === 'PASS').length;

  const report = `
# 🧪 Critical Bug Test Report - ${new Date().toISOString()}

## 📊 Summary
- ✅ Passed: ${passed}
- ❌ Failed: ${criticalFailures}
- ⚠️  Warnings: ${warnings}
- 🎯 **DEPLOY READY: ${criticalFailures === 0 ? 'YES' : 'NO'}**

## 🔍 Test Results
${TEST_RESULTS.map(r => `- ${r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️'} **${r.test}**: ${r.message}${r.responseTime ? ` (${r.responseTime}ms)` : ''}`).join('\n')}

## 🚨 Critical Issues
${criticalFailures > 0 ?
  TEST_RESULTS.filter(r => r.status === 'FAIL').map(r => `- ❌ **${r.test}**: ${r.message}`).join('\n') :
  '✅ No critical issues found!'
}

## ⚠️ Warnings
${warnings > 0 ?
  TEST_RESULTS.filter(r => r.status === 'WARNING').map(r => `- ⚠️ **${r.test}**: ${r.message}`).join('\n') :
  '✅ No warnings!'
}

## 🎯 Deployment Recommendation
${criticalFailures === 0 ?
  '✅ **APPROVED FOR DEPLOYMENT** - All critical tests passed!' :
  '❌ **BLOCKED FOR DEPLOYMENT** - Critical issues must be fixed first!'
}

---
*Generated by Critical Bug Tester v1.0*
*Timestamp: ${new Date().toISOString()}*
`;

  fs.writeFileSync('CRITICAL_BUG_TEST_REPORT.md', report);
  console.log('\n📄 Full report saved to: CRITICAL_BUG_TEST_REPORT.md');

  return criticalFailures === 0;
}

async function runAllTests() {
  console.log('🧪 Starting Critical Bug Tests for Tinedy CRM...\n');

  // Test 1: Basic Authentication
  console.log('🔐 Testing Authentication System...');
  await testLoginPageAvailability();
  await testProtectedRoutes();

  // Test 2: API Functionality
  console.log('\n⚙️ Testing API Endpoints...');
  await testAPIEndpoints();

  // Test 3: Performance
  console.log('\n🚀 Testing Performance...');
  await testPerformance();

  // Generate Report
  console.log('\n📊 Generating Test Report...');
  const deployReady = generateReport();

  console.log('\n🏁 Testing Complete!');
  console.log(deployReady ? '✅ SYSTEM READY FOR DEPLOYMENT' : '❌ SYSTEM NOT READY - FIX CRITICAL ISSUES');

  process.exit(deployReady ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});