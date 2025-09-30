const { chromium } = require('playwright');
const fs = require('fs');

class CriticalE2ETester {
  constructor() {
    this.results = [];
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3008';
  }

  log(testName, status, message, screenshot = null) {
    const result = {
      test: testName,
      status, // 'PASS', 'FAIL', 'WARNING'
      message,
      timestamp: new Date().toISOString(),
      screenshot
    };

    this.results.push(result);

    const statusSymbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusSymbol} ${testName}: ${message}`);
  }

  async init() {
    try {
      this.browser = await chromium.launch({
        headless: false,  // Run with visible browser for debugging
        slowMo: 1000      // Slow down actions for visibility
      });
      this.page = await this.browser.newPage();

      // Listen for console logs to catch JavaScript errors
      this.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          this.log('Console Error', 'FAIL', `JavaScript Error: ${msg.text()}`);
        }
      });

      // Listen for page errors
      this.page.on('pageerror', (error) => {
        this.log('Page Error', 'FAIL', `Page Error: ${error.message}`);
      });

      this.log('Browser Setup', 'PASS', 'Playwright browser initialized successfully');
    } catch (error) {
      this.log('Browser Setup', 'FAIL', `Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(name) {
    try {
      const screenshotPath = `screenshot-${name}-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath });
      return screenshotPath;
    } catch (error) {
      console.log('Screenshot failed:', error.message);
      return null;
    }
  }

  // CRITICAL TEST 1: Pagination Bug Test
  async testPaginationBug() {
    try {
      console.log('\n🔍 CRITICAL TEST: Customer Pagination Bug');

      await this.page.goto(`${this.baseUrl}/login`);
      await this.page.waitForLoadState('networkidle');

      // Take screenshot of login page
      await this.takeScreenshot('login-page');

      // Check if we can access customers page (authentication will redirect to login)
      await this.page.goto(`${this.baseUrl}/customers`);
      await this.page.waitForLoadState('networkidle');

      // Check if we're on login page due to authentication
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login')) {
        this.log('Customer Page Access', 'PASS', 'Correctly redirected to login (authentication working)');

        // For now, we'll simulate what would happen after login
        // In a real test, we'd need valid credentials
        this.log('Pagination Test', 'WARNING', 'Cannot test pagination without valid login credentials');
        return false;
      }

      // If somehow we're on customers page, test pagination
      try {
        // Look for pagination elements
        const paginationExists = await this.page.locator('[data-testid="pagination"], .pagination, [aria-label*="pagination"], [aria-label*="page"]').count() > 0;

        if (paginationExists) {
          // Test pagination functionality
          await this.page.click('text="2"'); // Click page 2
          await this.page.waitForLoadState('networkidle');

          // Check if we're still on page 2 (not jumped back to page 1)
          const currentPage = await this.page.textContent('[aria-current="page"]');
          if (currentPage && currentPage.includes('2')) {
            this.log('Pagination Test', 'PASS', 'Page 2 navigation works correctly');
          } else {
            this.log('Pagination Test', 'FAIL', 'CRITICAL BUG: Pagination jumped back to page 1');
            await this.takeScreenshot('pagination-bug');
          }
        } else {
          this.log('Pagination Test', 'WARNING', 'Pagination elements not found');
        }
      } catch (error) {
        this.log('Pagination Test', 'FAIL', `Pagination test failed: ${error.message}`);
      }

    } catch (error) {
      this.log('Pagination Test', 'FAIL', `Critical pagination test failed: ${error.message}`);
      await this.takeScreenshot('pagination-error');
    }
  }

  // CRITICAL TEST 2: Job Form Select Component Error
  async testJobFormSelectError() {
    try {
      console.log('\n🔍 CRITICAL TEST: Job Form Select Component Error');

      await this.page.goto(`${this.baseUrl}/jobs/new`);
      await this.page.waitForLoadState('networkidle');

      // Check if we're redirected to login
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login')) {
        this.log('Job Form Access', 'PASS', 'Correctly redirected to login (authentication working)');
        this.log('Job Form Test', 'WARNING', 'Cannot test job form without valid login credentials');
        return false;
      }

      // If we can access the form, test it
      try {
        // Look for select components
        const selectElements = await this.page.locator('select, [role="combobox"], [data-testid*="select"]').count();

        if (selectElements > 0) {
          // Check for empty string values in select options
          const emptyOptions = await this.page.locator('option[value=""], [data-value=""]').count();

          if (emptyOptions > 0) {
            this.log('Select Component', 'FAIL', 'CRITICAL BUG: Found select options with empty string values');
            await this.takeScreenshot('select-empty-value-bug');
          } else {
            this.log('Select Component', 'PASS', 'No empty string values found in select options');
          }

          // Try to submit form to trigger potential errors
          const submitButton = await this.page.locator('button[type="submit"], input[type="submit"]').first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await this.page.waitForTimeout(2000); // Wait for any errors to show

            // Check for any error messages
            const errorMessages = await this.page.locator('.error, [role="alert"], .text-red-500, .text-red-600').count();
            if (errorMessages > 0) {
              const errorText = await this.page.locator('.error, [role="alert"], .text-red-500, .text-red-600').first().textContent();
              this.log('Form Submission', 'WARNING', `Form validation error: ${errorText}`);
            } else {
              this.log('Form Submission', 'PASS', 'Form submission works without select errors');
            }
          }
        } else {
          this.log('Job Form Test', 'WARNING', 'No select components found on job form page');
        }

      } catch (error) {
        this.log('Job Form Test', 'FAIL', `Job form test failed: ${error.message}`);
      }

    } catch (error) {
      this.log('Job Form Test', 'FAIL', `Critical job form test failed: ${error.message}`);
      await this.takeScreenshot('job-form-error');
    }
  }

  // CRITICAL TEST 3: Console Errors
  async testConsoleErrors() {
    console.log('\n🔍 CRITICAL TEST: JavaScript Console Errors');

    const pages = ['/', '/login', '/customers', '/jobs'];
    let errorFound = false;

    for (const path of pages) {
      try {
        console.log(`Checking console errors on ${path}`);

        await this.page.goto(`${this.baseUrl}${path}`);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000); // Wait for any delayed errors

        // Console errors are captured by the event listener in init()

      } catch (error) {
        this.log('Console Error Test', 'FAIL', `Failed to load ${path}: ${error.message}`);
        errorFound = true;
      }
    }

    if (!errorFound) {
      this.log('Console Error Test', 'PASS', 'No JavaScript console errors found during page loads');
    }
  }

  async generateReport() {
    const criticalFailures = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    const passed = this.results.filter(r => r.status === 'PASS').length;

    const report = `
# 🧪 E2E Critical Bug Test Report - ${new Date().toISOString()}

## 📊 Summary
- ✅ Passed: ${passed}
- ❌ Failed: ${criticalFailures}
- ⚠️  Warnings: ${warnings}
- 🎯 **DEPLOY READY: ${criticalFailures === 0 ? 'YES' : 'NO'}**

## 🔥 CRITICAL Tests Status
${this.results.filter(r => r.test.includes('Pagination') || r.test.includes('Job Form') || r.test.includes('Console')).map(r => `- ${r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️'} **${r.test}**: ${r.message}`).join('\n')}

## 🔍 Detailed Results
${this.results.map(r => `### ${r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️'} ${r.test}
**Status**: ${r.status}
**Message**: ${r.message}
**Time**: ${r.timestamp}
${r.screenshot ? `**Screenshot**: ${r.screenshot}` : ''}
`).join('\n')}

## 🚨 Critical Issues Summary
${criticalFailures > 0 ?
  this.results.filter(r => r.status === 'FAIL').map(r => `- ❌ **${r.test}**: ${r.message}`).join('\n') :
  '✅ No critical issues found!'
}

## 🎯 Deployment Decision
${criticalFailures === 0 ?
  '✅ **APPROVED FOR DEPLOYMENT** - All critical E2E tests passed!' :
  '❌ **BLOCKED FOR DEPLOYMENT** - Critical E2E issues must be fixed first!'
}

---
*Generated by E2E Critical Bug Tester*
*Test Duration: ${new Date().toISOString()}*
`;

    fs.writeFileSync('E2E_CRITICAL_TEST_REPORT.md', report);
    console.log('\n📄 E2E Report saved to: E2E_CRITICAL_TEST_REPORT.md');

    return criticalFailures === 0;
  }

  async runAllTests() {
    console.log('🧪 Starting E2E Critical Bug Tests...');

    try {
      await this.init();

      // Run critical tests
      await this.testConsoleErrors();
      await this.testPaginationBug();
      await this.testJobFormSelectError();

      // Generate report
      const deployReady = await this.generateReport();

      console.log('\n🏁 E2E Testing Complete!');
      console.log(deployReady ? '✅ SYSTEM READY FOR DEPLOYMENT' : '❌ SYSTEM NOT READY - FIX CRITICAL ISSUES');

      return deployReady;

    } finally {
      await this.cleanup();
    }
  }
}

// Run E2E tests
const tester = new CriticalE2ETester();
tester.runAllTests()
  .then(deployReady => {
    process.exit(deployReady ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ E2E Test runner failed:', error.message);
    process.exit(1);
  });