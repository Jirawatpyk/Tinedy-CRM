# Testing Documentation - Tinedy CRM

This document provides comprehensive information about the testing framework and practices for the Tinedy CRM system.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [Configuration](#configuration)
- [CI/CD Integration](#cicd-integration)
- [Coverage Reports](#coverage-reports)
- [Thai-Specific Testing](#thai-specific-testing)

## Overview

The Tinedy CRM testing framework is designed to ensure the reliability, security, and performance of our internal CRM system. Our testing strategy focuses on:

- **Thai Business Context**: Tests are designed for Thai customers, phone numbers, and business practices
- **LINE OA Integration**: Comprehensive testing of LINE User ID validation and webhook processing
- **N8N Workflow Testing**: End-to-end testing of automation workflow integrations
- **Database Integrity**: Thorough testing of data relationships and business rules
- **API Security**: Validation of authentication, authorization, and input sanitization

## Test Structure

```
tests/
├── setup/
│   ├── test-config.ts          # Central test configuration and utilities
│   └── jest.setup.ts           # Jest global setup and custom matchers
├── unit/
│   ├── database/               # Database operation tests
│   │   ├── customer.test.ts    # Customer CRUD operations
│   │   └── job.test.ts         # Job management tests
│   └── validation/             # Validation logic tests
│       ├── schema-validator.test.ts      # Entity validation tests
│       ├── data-type-validator.test.ts   # Data type validation tests
│       └── database-constraints.test.ts  # Database constraint tests
├── integration/
│   └── api/                    # API endpoint tests
│       ├── customers.test.ts   # Customer API integration tests
│       └── webhooks.test.ts    # Webhook processing tests
└── README.md                   # This documentation
```

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Specific Test Categories

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# API tests only
npm run test:api

# Validation tests only
npm run test:validation

# Database tests only
npm run test:database

# Security tests
npm run test:security

# Performance tests
npm run test:performance
```

### Development

```bash
# Debug tests
npm run test:debug

# Run specific test file
npm test customer.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create customer"
```

## Test Types

### 1. Unit Tests (`tests/unit/`)

Test individual functions and components in isolation.

**Database Tests** (`tests/unit/database/`)
- CRUD operations for all entities
- Data validation and sanitization
- Business rule enforcement
- Performance benchmarks

**Validation Tests** (`tests/unit/validation/`)
- Schema validation for all entities
- Thai-specific data type validation
- Database constraint validation
- Business logic validation

### 2. Integration Tests (`tests/integration/`)

Test interactions between different components and systems.

**API Tests** (`tests/integration/api/`)
- Full HTTP request/response cycles
- Authentication and authorization
- Error handling and status codes
- Data transformation and formatting

### 3. Security Tests

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Authentication bypass attempts
- Rate limiting

### 4. Performance Tests

- Response time benchmarks
- Database query optimization
- Memory usage validation
- Concurrent user simulation

## Writing Tests

### Test File Conventions

1. **Naming**: Use `.test.ts` suffix
2. **Location**: Mirror the source code structure
3. **Organization**: Group related tests in `describe` blocks
4. **Thai Content**: Use Thai text for realistic test data

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { TestUtils, TestAssertions } from '../../setup/test-config';

describe('Customer Management', () => {
  beforeEach(async () => {
    await TestDatabaseManager.reset();
  });

  describe('Customer Creation', () => {
    it('should create customer with Thai name', async () => {
      const customerData = TestUtils.generateCustomerData({
        name: 'สมชาย ใจดี',
        phone: '+66812345678'
      });

      const result = await createCustomer(customerData);

      expect(result.id).toBeValidCUID();
      expect(result.name).toBe('สมชาย ใจดี');
      expect(result.phone).toBeValidThaiPhone();
    });
  });
});
```

### Custom Test Utilities

**TestUtils** - Data generation and helpers
```typescript
// Generate realistic Thai customer data
const customerData = TestUtils.generateCustomerData({
  name: 'สมชาย ใจดี',
  lineUserId: TestUtils.randomLineUserId()
});

// Generate job data
const jobData = TestUtils.generateJobData(customerId, {
  serviceType: 'บริการทำความสะอาด'
});

// Measure performance
const { duration, result } = await TestUtils.measureTime(async () => {
  return await performOperation();
});
```

**TestAssertions** - Custom validation
```typescript
// Custom matchers for Thai business data
expect(phoneNumber).toBeValidThaiPhone();
expect(lineUserId).toBeValidLineUserId();
expect(id).toBeValidCUID();
expect(timestamp).toBeValidTimestamp();
expect(response).toHaveValidPagination();

// Performance assertions
TestAssertions.assertPerformance(duration, 1000); // Max 1 second
```

### Test Data Management

**Database Reset**: Each test starts with a clean database state
```typescript
beforeEach(async () => {
  await TestDatabaseManager.reset();
});
```

**Seed Data**: Realistic test data for integration tests
```typescript
// Automatically creates users, customers, jobs, and quality checklists
await TestDatabaseManager.seedTestData();
```

## Configuration

### Jest Configuration (`jest.config.js`)

- **Environment**: Node.js with TypeScript support
- **Coverage**: 80% threshold globally, 90% for validation modules
- **Timeouts**: 30 seconds for unit tests, 60 seconds for integration tests
- **Projects**: Separate configurations for unit and integration tests

### Environment Variables

Required for testing:
```bash
# Database
TEST_DATABASE_URL=postgresql://localhost:5432/tinedy_crm_test

# API Testing
TEST_API_URL=http://localhost:3000

# Authentication
NEXTAUTH_SECRET=test-secret-key
JWT_SECRET=test-jwt-secret

# Webhooks
N8N_WEBHOOK_SECRET=test-n8n-secret
LINE_OA_WEBHOOK_SECRET=test-line-secret

# Logging
SUPPRESS_TEST_LOGS=true
```

### Database Setup

1. **Test Database**: Uses separate database for testing
2. **Migrations**: Automatically applied before tests
3. **Cleanup**: All data cleared between tests
4. **Seeding**: Realistic test data available when needed

## CI/CD Integration

### GitHub Actions Workflow (`.github/workflows/test.yml`)

**Test Pipeline**:
1. **Lint & Type Check**: Code quality validation
2. **Unit Tests**: Fast, isolated component tests
3. **Integration Tests**: Database and API testing with PostgreSQL
4. **API Tests**: Full application testing with running server
5. **Security Tests**: Vulnerability scanning and security validation
6. **Coverage Report**: Comprehensive coverage analysis

**Environments**:
- **Node.js**: Version 18 LTS
- **PostgreSQL**: Version 15
- **Test Database**: Isolated PostgreSQL instance per job

**Artifacts**:
- Test results (JUnit XML)
- Coverage reports (HTML + LCOV)
- Performance metrics
- Security scan results

### Running in CI

```bash
# CI-optimized test command
npm run test:ci

# Coverage with CI reporting
npm run test:coverage
```

## Coverage Reports

### Coverage Thresholds

- **Global**: 80% (branches, functions, lines, statements)
- **Validation Modules**: 90% (critical business logic)
- **Service Layer**: 85% (core business operations)

### Coverage Exclusions

- Type definition files (`*.d.ts`)
- Configuration files
- Test files themselves
- Node modules

### Viewing Reports

```bash
# Generate HTML coverage report
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

## Thai-Specific Testing

### Thai Name Validation
```typescript
// Valid Thai names
'สมชาย ใจดี'
'นางสาวสมหญิง ดีใจ'
'นายอนันต์ มั่นคง'

// Mixed Thai-English
'สมชาย Smith'
'John ใจดี'
```

### Thai Phone Number Validation
```typescript
// Valid formats
'+66812345678'  // International format
'0812345678'    // Local format (auto-converted)

// Invalid formats
'+1234567890'   // Non-Thai country code
'812345678'     // Missing prefix
```

### LINE User ID Validation
```typescript
// Valid LINE User ID format
'U' + 32 hex characters
// Example: 'Uab1234567890abcdef1234567890abcd'
```

### Thai Business Context
- Service types in Thai language
- Business hours and scheduling
- Thai address formats
- Cultural considerations in UX testing

## Troubleshooting

### Common Issues

**Database Connection**:
```bash
# Ensure PostgreSQL is running
brew services start postgresql
# or
sudo service postgresql start
```

**Environment Variables**:
```bash
# Check required variables are set
echo $TEST_DATABASE_URL
```

**Jest Cache Issues**:
```bash
# Clear Jest cache
npm run test -- --clearCache
```

**TypeScript Issues**:
```bash
# Run type check
npm run type-check
```

### Debug Mode

```bash
# Debug specific test
npm run test:debug -- customer.test.ts

# Debug with breakpoints
node --inspect-brk node_modules/.bin/jest --runInBand customer.test.ts
```

### Performance Issues

```bash
# Run performance tests
npm run test:performance

# Profile memory usage
node --max_old_space_size=4096 node_modules/.bin/jest
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` for setup
- Clean database between tests

### 2. Realistic Data
- Use Thai names, addresses, and business contexts
- Generate data that matches production patterns
- Test edge cases specific to Thai business

### 3. Performance Awareness
- Set reasonable performance thresholds
- Test with realistic data volumes
- Monitor memory usage in long-running tests

### 4. Security Focus
- Test all input validation
- Verify authentication requirements
- Check authorization boundaries
- Test against common attack vectors

### 5. Maintainability
- Keep tests simple and focused
- Use descriptive test names
- Group related tests logically
- Document complex test scenarios

## Contributing

When adding new tests:

1. **Follow Conventions**: Use established patterns and naming
2. **Update Documentation**: Add new test types or utilities here
3. **Thai Context**: Ensure tests reflect Thai business requirements
4. **Coverage**: Maintain or improve coverage thresholds
5. **Performance**: Verify tests run efficiently in CI

For questions or issues with the testing framework, please check the existing tests for examples or reach out to the development team.