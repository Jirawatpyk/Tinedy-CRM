# Tinedy CRM API Documentation

Welcome to the Tinedy CRM API documentation. This API provides endpoints for managing customers, jobs, quality control workflows, and webhook integrations for our internal CRM system.

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Thai Business Context](#thai-business-context)
- [Integration Guides](#integration-guides)

## Overview

The Tinedy CRM API is a RESTful API designed specifically for Thai business operations. It handles:

- **Customer Management** - Thai customers with LINE OA integration
- **Job Management** - Service bookings and workflow tracking
- **Quality Control** - Standardized quality assurance processes
- **Webhook Integration** - N8N automation and LINE OA webhooks
- **User Management** - Role-based access control for internal teams

### API Features

- **Thai Language Support** - Native support for Thai names and addresses
- **LINE OA Integration** - Direct integration with LINE Official Account
- **N8N Automation** - Webhook endpoints for workflow automation
- **Real-time Updates** - Event-driven updates for job status changes
- **Comprehensive Validation** - Thai phone numbers, business rules, data integrity

## Base URL

```
Production:  https://crm.tinedy.com/api
Development: http://localhost:3000/api
```

## Authentication

The API uses **NextAuth.js v5** with role-based access control.

### Authentication Methods

1. **Session-based** (Web Application)
2. **API Key** (Webhook Integrations)
3. **JWT Token** (Mobile/External Integrations)

### Headers

```http
# Session-based (cookies automatically included)
Cookie: next-auth.session-token=...

# API Key (for webhooks)
X-API-Key: your-api-key

# JWT Token (for external integrations)
Authorization: Bearer your-jwt-token
```

### User Roles

- **ADMIN** - Full system access, user management
- **OPERATIONS** - Job management, customer updates
- **QC_MANAGER** - Quality control, checklist management
- **TRAINING** - Training workflow management

## API Endpoints

### Core Resources

| Resource | Description |
|----------|-------------|
| [**Customers**](./customers.md) | Thai customer management with LINE OA integration |
| [**Jobs**](./jobs.md) | Service bookings and job workflow management |
| [**Users**](./users.md) | Internal team member management |
| [**Quality Control**](./quality-control.md) | Quality assurance and checklist management |
| [**Webhooks**](./webhooks.md) | N8N and LINE OA webhook endpoints |
| [**Training**](./training.md) | Training workflow management |

### Quick Reference

```http
# Customers
GET    /api/customers           # List customers with search/filter
POST   /api/customers           # Create new customer
GET    /api/customers/{id}      # Get customer details
PUT    /api/customers/{id}      # Update customer
DELETE /api/customers/{id}      # Delete customer

# Jobs
GET    /api/jobs                # List jobs with filters
POST   /api/jobs                # Create new job
GET    /api/jobs/{id}           # Get job details
PUT    /api/jobs/{id}           # Update job status/assignment
DELETE /api/jobs/{id}           # Cancel job

# Webhooks
POST   /api/webhook/n8n         # N8N automation webhook
POST   /api/webhook/line        # LINE OA webhook
POST   /api/webhook/manual      # Manual webhook trigger

# Authentication
POST   /api/auth/signin         # Sign in user
POST   /api/auth/signout        # Sign out user
GET    /api/auth/session        # Get current session
```

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message in English",
  "errorTh": "ข้อความผิดพลาดเป็นภาษาไทย",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/customers",
  "details": {
    "field": "phone",
    "message": "Phone number must be valid Thai format"
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful deletion) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (authentication required) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate data) |
| `422` | Unprocessable Entity (business rule violation) |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

### Common Error Codes

```javascript
// Validation Errors
INVALID_THAI_PHONE     // Phone number not in Thai format
INVALID_LINE_USER_ID   // LINE User ID format invalid
INVALID_THAI_NAME      // Name contains invalid characters

// Business Logic Errors
CUSTOMER_HAS_ACTIVE_JOBS    // Cannot delete customer with active jobs
INVALID_STATUS_TRANSITION   // Job status transition not allowed
DUPLICATE_LINE_USER_ID      // LINE User ID already exists

// Authorization Errors
INSUFFICIENT_PERMISSIONS    // User role doesn't have required permissions
INVALID_API_KEY           // Webhook API key is invalid
SESSION_EXPIRED           // User session has expired
```

## Rate Limiting

API requests are rate limited to ensure system stability:

- **Authenticated Users**: 1000 requests per hour
- **Webhook Endpoints**: 100 requests per minute
- **Public Endpoints**: 60 requests per hour per IP

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
X-RateLimit-Window: 3600
```

## Thai Business Context

### Phone Number Format

Thai phone numbers are validated and stored in international format:

```javascript
// Input formats (automatically converted)
"0812345678"     → "+66812345678"
"+66812345678"   → "+66812345678" (no change)

// Valid patterns
"+66[8-9]XXXXXXXX"  // Mobile numbers
"+66[2-7]XXXXXXX"   // Landline numbers
```

### Thai Name Validation

Names support Thai and mixed Thai-English characters:

```javascript
// Valid examples
"สมชาย ใจดี"        // Pure Thai
"John สมิท"          // Mixed Thai-English
"นางสาวสุดา วงศ์ใหญ่"  // Thai with title

// Invalid characters
"สมชาย@gmail.com"    // Email characters
"John#Smith"         // Special characters
"สมชาย<script>"      // HTML/Script tags
```

### LINE User ID Format

LINE User IDs follow LINE's official format:

```javascript
// Valid format: U + 32 hexadecimal characters
"Uab1234567890abcdef1234567890abcdef"

// Validation regex
/^U[a-fA-F0-9]{32}$/
```

### Service Types

Common Thai service types in the system:

```javascript
[
  "บริการทำความสะอาด",      // Cleaning service
  "บริการฝึกอบรม",          // Training service
  "บริการตรวจสอบคุณภาพ",     // Quality control service
  "บริการซ่อมแซม",          // Repair service
  "บริการดูแลรักษา"         // Maintenance service
]
```

## Integration Guides

### N8N Integration

For automated workflows, use the N8N webhook endpoint:

```javascript
// N8N Webhook Configuration
URL: https://crm.tinedy.com/api/webhook/n8n
Method: POST
Headers: {
  "X-API-Key": "your-n8n-api-key",
  "Content-Type": "application/json"
}

// Payload structure
{
  "executionId": "n8n-execution-id",
  "workflowId": "workflow-name",
  "data": {
    "customer": {
      "name": "ลูกค้าจาก N8N",
      "lineUserId": "U1234567890abcdef..."
    },
    "booking": {
      "serviceType": "บริการทำความสะอาด",
      "scheduledDate": "2024-01-20T09:00:00Z"
    }
  }
}
```

### LINE OA Integration

For LINE Official Account webhooks:

```javascript
// LINE Webhook Configuration
URL: https://crm.tinedy.com/api/webhook/line
Method: POST
Headers: {
  "X-Line-Signature": "generated-by-line",
  "Content-Type": "application/json"
}

// Payload (LINE webhook format)
{
  "events": [
    {
      "type": "message",
      "source": {
        "type": "user",
        "userId": "U1234567890abcdef..."
      },
      "message": {
        "type": "text",
        "text": "ต้องการจองบริการทำความสะอาด"
      }
    }
  ]
}
```

### Frontend Integration

For React/Next.js frontend integration:

```typescript
// API Client Setup
import { createApiClient } from '@/lib/api-client';

const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true // For session-based auth
});

// Example: Create customer
const customer = await api.customers.create({
  name: 'สมชาย ใจดี',
  phone: '+66812345678',
  email: 'somchai@example.com',
  lineUserId: 'U1234567890abcdef...'
});

// Example: Search customers
const customers = await api.customers.list({
  search: 'สมชาย',
  status: 'ACTIVE',
  page: 1,
  limit: 20
});
```

## API Versioning

Currently using v1 (implicit). Future versions will be explicitly versioned:

```http
# Current (v1)
GET /api/customers

# Future versioning
GET /api/v2/customers
Accept: application/vnd.tinedy.v2+json
```

## Support

For API support and questions:

- **Technical Issues**: Create issue in repository
- **Integration Help**: Contact development team
- **Business Logic**: Contact operations team

## Changelog

### v1.0.0 (Current)
- Initial API release
- Customer, Job, and User management
- N8N and LINE OA webhook integration
- Thai business data validation
- Role-based access control