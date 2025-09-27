# Authentication & Authorization API Documentation

This document covers authentication and authorization mechanisms for the Tinedy CRM API.

## Table of Contents

- [Overview](#overview)
- [Authentication Methods](#authentication-methods)
- [Authorization & Roles](#authorization--roles)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Overview

The Tinedy CRM uses **NextAuth.js v5** for authentication with role-based access control (RBAC) for authorization.

### Authentication Flow

1. **Web Application**: Session-based authentication with cookies
2. **API Integration**: JWT tokens for external systems
3. **Webhook Integration**: API key authentication for webhooks
4. **Mobile Apps**: JWT tokens with refresh mechanism

### Security Features

- **Multi-factor Authentication**: Optional 2FA via LINE OA
- **Session Management**: Secure session handling with rotation
- **Role-based Access**: Granular permissions per user role
- **API Rate Limiting**: Configurable rate limits per endpoint
- **Audit Logging**: Comprehensive authentication logs

## Authentication Methods

### 1. Session-based Authentication (Web App)

Used for the main web application interface.

#### Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "admin@tinedy.com",
  "password": "secure-password",
  "remember": true
}
```

#### Response

```json
{
  "user": {
    "id": "clr123user456",
    "email": "admin@tinedy.com",
    "name": "ผู้ดูแลระบบ",
    "role": "ADMIN",
    "permissions": ["*"],
    "lastLoginAt": "2024-01-20T10:30:00Z"
  },
  "session": {
    "expires": "2024-02-20T10:30:00Z",
    "sessionToken": "session-token-hash"
  }
}
```

### 2. JWT Token Authentication (API)

Used for external integrations and mobile applications.

#### Get JWT Token

```http
POST /api/auth/token
Content-Type: application/json

{
  "email": "operations@tinedy.com",
  "password": "secure-password",
  "scope": "api"
}
```

#### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "api",
  "user": {
    "id": "clr456operations789",
    "role": "OPERATIONS",
    "permissions": ["customers:read", "jobs:*", "webhooks:read"]
  }
}
```

#### Using JWT Token

```http
GET /api/customers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. API Key Authentication (Webhooks)

Used for webhook integrations (N8N, LINE OA, custom systems).

#### Request with API Key

```http
POST /api/webhook/n8n
X-API-Key: your-webhook-api-key
Content-Type: application/json

{
  "executionId": "n8n-exec-12345",
  "data": {...}
}
```

#### API Key Scopes

| Key Type | Scope | Usage |
|----------|-------|-------|
| `webhook:n8n` | N8N webhooks only | N8N automation |
| `webhook:line` | LINE OA webhooks only | LINE integration |
| `webhook:manual` | Manual webhooks only | Custom integrations |
| `api:read` | Read-only API access | Monitoring systems |
| `api:full` | Full API access | Trusted integrations |

## Authorization & Roles

### User Roles

#### ADMIN
- **Description**: System administrators
- **Permissions**: Full system access
- **Capabilities**:
  - User management
  - System configuration
  - All customer and job operations
  - Webhook management
  - Quality control oversight

#### OPERATIONS
- **Description**: Operations team members
- **Permissions**: Customer and job management
- **Capabilities**:
  - Create/update customers
  - Manage assigned jobs
  - View job assignments
  - Update job status
  - Basic quality checks

#### QC_MANAGER
- **Description**: Quality control managers
- **Permissions**: Quality assurance and reporting
- **Capabilities**:
  - Create/manage quality checklists
  - Perform quality checks
  - Generate quality reports
  - View all jobs for QC purposes
  - Approve/reject quality standards

#### TRAINING
- **Description**: Training coordinators
- **Permissions**: Training workflow management
- **Capabilities**:
  - Manage training jobs
  - Track training progress
  - Update training status
  - View training analytics
  - Coordinate with operations

### Permission Matrix

| Resource | ADMIN | OPERATIONS | QC_MANAGER | TRAINING |
|----------|-------|------------|------------|----------|
| **Customers** |
| List/Search | ✅ All | ✅ All | ✅ All | ✅ All |
| Create | ✅ | ✅ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |
| **Jobs** |
| List/Search | ✅ All | ✅ Assigned + Own | ✅ All | ✅ Training only |
| Create | ✅ | ✅ | ❌ | ✅ Training only |
| Update | ✅ | ✅ Assigned | ✅ QC fields | ✅ Training only |
| Delete/Cancel | ✅ | ✅ Assigned | ❌ | ✅ Training only |
| Assign | ✅ | ✅ Team lead | ❌ | ✅ Training team |
| **Users** |
| List | ✅ | ✅ Team only | ✅ QC team | ✅ Training team |
| Create | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ Self only | ✅ Self only | ✅ Self only |
| Delete | ✅ | ❌ | ❌ | ❌ |
| **Quality Control** |
| View Checks | ✅ | ✅ Own jobs | ✅ All | ❌ |
| Create Checks | ✅ | ❌ | ✅ | ❌ |
| Update Checks | ✅ | ❌ | ✅ | ❌ |
| Manage Checklists | ✅ | ❌ | ✅ | ❌ |
| **Webhooks** |
| View Logs | ✅ | ✅ Related jobs | ✅ Related jobs | ✅ Training jobs |
| Manage Config | ✅ | ❌ | ❌ | ❌ |
| Retry Failed | ✅ | ❌ | ❌ | ❌ |

### Dynamic Permissions

Some permissions are context-dependent:

#### Job Assignment Rules
- Operations users can only be assigned to jobs matching their specialization
- Training users can only be assigned to training-related jobs
- QC Managers cannot be assigned to operational jobs

#### Customer Access Rules
- All roles can view customer information
- Only ADMIN and OPERATIONS can modify customer data
- Customer deletion requires no active jobs

#### Data Visibility Rules
- Operations users see customers and jobs in their region/team
- QC Managers see all jobs but limited customer modification rights
- Training users see only training-related data

## API Endpoints

### Authentication Endpoints

#### Sign In
```http
POST /api/auth/signin
```

#### Sign Out
```http
POST /api/auth/signout
```

#### Get Current Session
```http
GET /api/auth/session
```

#### Refresh Token
```http
POST /api/auth/refresh
```

#### Change Password
```http
PUT /api/auth/password
```

### User Management Endpoints

#### List Users
```http
GET /api/users
```

#### Get User Profile
```http
GET /api/users/{id}
```

#### Update User Profile
```http
PUT /api/users/{id}
```

#### Create User (Admin only)
```http
POST /api/users
```

#### Deactivate User (Admin only)
```http
PUT /api/users/{id}/deactivate
```

### API Key Management

#### List API Keys (Admin only)
```http
GET /api/auth/api-keys
```

#### Create API Key (Admin only)
```http
POST /api/auth/api-keys
```

#### Revoke API Key (Admin only)
```http
DELETE /api/auth/api-keys/{keyId}
```

## Security Features

### Password Requirements

- **Minimum Length**: 8 characters
- **Complexity**: Must include uppercase, lowercase, number
- **Thai Support**: Supports Thai characters in passwords
- **Forbidden**: Common passwords, sequential characters
- **Expiration**: Optional password expiration (90 days default)

### Session Security

- **Secure Cookies**: HTTPOnly, Secure, SameSite attributes
- **Session Rotation**: New session ID on role changes
- **Concurrent Sessions**: Limited to 3 active sessions per user
- **Idle Timeout**: 30 minutes of inactivity
- **Absolute Timeout**: 8 hours maximum session duration

### API Security

- **Rate Limiting**: Per-endpoint and per-user limits
- **Request Signing**: HMAC signature for sensitive operations
- **IP Whitelisting**: Optional IP restrictions for API keys
- **Scope Limitation**: Fine-grained permission scopes
- **Audit Logging**: All API access logged

### Two-Factor Authentication

Optional 2FA via LINE OA integration:

#### Enable 2FA
```http
POST /api/auth/2fa/enable
```

#### Verify 2FA Code
```http
POST /api/auth/2fa/verify
```

#### Generate Backup Codes
```http
POST /api/auth/2fa/backup-codes
```

## Examples

### Web Application Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "operations@tinedy.com",
  "password": "SecurePass123!",
  "remember": true
}

Response:
{
  "success": true,
  "user": {
    "id": "clr456ops789",
    "email": "operations@tinedy.com",
    "name": "สมหญิง ออปเปอร์เรเตอร์",
    "role": "OPERATIONS",
    "team": "cleaning-team-1",
    "permissions": [
      "customers:read",
      "customers:write",
      "jobs:read",
      "jobs:write",
      "jobs:assign"
    ],
    "lastLoginAt": "2024-01-20T10:30:00Z",
    "profilePicture": "/avatars/user-456.jpg"
  },
  "session": {
    "expires": "2024-01-20T18:30:00Z"
  },
  "redirect": "/dashboard"
}
```

### API Token for Integration

```http
POST /api/auth/token
Content-Type: application/json

{
  "email": "integration@tinedy.com",
  "password": "IntegrationPass456!",
  "scope": "api:read",
  "client_id": "monitoring-dashboard"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHI3ODlpbnRlZ3JhdGlvbjEyMyIsInJvbGUiOiJPUEVSQVRJT05TIiwic2NvcGUiOiJhcGk6cmVhZCIsImlhdCI6MTcwNTc0NTg4MCwiZXhwIjoxNzA1NzQ5NDgwfQ.signature",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_token_payload.signature",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "api:read",
  "permissions": [
    "customers:read",
    "jobs:read",
    "webhooks:read"
  ]
}
```

### Using JWT Token for API Access

```http
GET /api/customers?limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "data": [
    {
      "id": "clr123customer456",
      "name": "สมชาย ใจดี",
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10
  }
}
```

### Create API Key for Webhook

```http
POST /api/auth/api-keys
Authorization: Bearer admin-jwt-token
Content-Type: application/json

{
  "name": "N8N Automation Webhook",
  "scope": "webhook:n8n",
  "expiresIn": "365d",
  "ipWhitelist": ["203.0.113.1", "203.0.113.2"],
  "description": "API key for N8N workflow automation"
}

Response:
{
  "id": "clr123apikey456",
  "name": "N8N Automation Webhook",
  "key": "sk_n8n_1234567890abcdef1234567890abcdef",
  "scope": "webhook:n8n",
  "expiresAt": "2025-01-20T10:30:00Z",
  "createdAt": "2024-01-20T10:30:00Z",
  "lastUsedAt": null,
  "ipWhitelist": ["203.0.113.1", "203.0.113.2"],
  "isActive": true
}
```

### Role-based Job Access

```http
# OPERATIONS user - can only see assigned jobs
GET /api/jobs
Authorization: Bearer operations-jwt-token

Response:
{
  "data": [
    {
      "id": "clr789job123",
      "serviceType": "บริการทำความสะอาด",
      "status": "IN_PROGRESS",
      "assignedToId": "clr456ops789", // Current user
      "customer": {
        "name": "สมชาย ใจดี"
      }
    }
  ]
}

# ADMIN user - can see all jobs
GET /api/jobs
Authorization: Bearer admin-jwt-token

Response:
{
  "data": [
    {
      "id": "clr789job123",
      "serviceType": "บริการทำความสะอาด",
      "assignedToId": "clr456ops789"
    },
    {
      "id": "clr456job789",
      "serviceType": "บริการฝึกอบรม",
      "assignedToId": "clr123training456"
    }
  ]
}
```

## Error Handling

### Authentication Errors

#### 401 Unauthorized - Invalid Credentials

```json
{
  "error": "Invalid credentials",
  "errorTh": "ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง",
  "code": "INVALID_CREDENTIALS",
  "timestamp": "2024-01-20T10:30:00Z",
  "details": {
    "email": "user@example.com",
    "attemptsRemaining": 3,
    "lockoutAt": null
  }
}
```

#### 401 Unauthorized - Session Expired

```json
{
  "error": "Session expired",
  "errorTh": "เซสชันหมดอายุ",
  "code": "SESSION_EXPIRED",
  "timestamp": "2024-01-20T10:30:00Z",
  "details": {
    "expiredAt": "2024-01-20T10:00:00Z",
    "redirect": "/auth/signin"
  }
}
```

#### 401 Unauthorized - Invalid JWT Token

```json
{
  "error": "Invalid or expired token",
  "errorTh": "โทเค็นไม่ถูกต้องหรือหมดอายุ",
  "code": "INVALID_TOKEN",
  "timestamp": "2024-01-20T10:30:00Z",
  "details": {
    "reason": "token_expired",
    "expiredAt": "2024-01-20T09:30:00Z"
  }
}
```

### Authorization Errors

#### 403 Forbidden - Insufficient Permissions

```json
{
  "error": "Insufficient permissions",
  "errorTh": "สิทธิ์ไม่เพียงพอ",
  "code": "INSUFFICIENT_PERMISSIONS",
  "timestamp": "2024-01-20T10:30:00Z",
  "details": {
    "required": ["customers:delete"],
    "userRole": "OPERATIONS",
    "userPermissions": ["customers:read", "customers:write"]
  }
}
```

#### 403 Forbidden - Role Restriction

```json
{
  "error": "Operation not allowed for user role",
  "errorTh": "ไม่อนุญาตให้ผู้ใช้บทบาทนี้ดำเนินการ",
  "code": "ROLE_RESTRICTION",
  "timestamp": "2024-01-20T10:30:00Z",
  "details": {
    "userRole": "TRAINING",
    "operation": "assign_cleaning_job",
    "allowedRoles": ["ADMIN", "OPERATIONS"]
  }
}
```

### Security Errors

#### 429 Too Many Requests - Rate Limited

```json
{
  "error": "Rate limit exceeded",
  "errorTh": "เกินขีดจำกัดการใช้งาน",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-20T10:30:00Z",
  "details": {
    "limit": 100,
    "window": "1h",
    "remaining": 0,
    "resetAt": "2024-01-20T11:00:00Z"
  }
}
```

#### 423 Locked - Account Locked

```json
{
  "error": "Account temporarily locked",
  "errorTh": "บัญชีถูกล็อกชั่วคราว",
  "code": "ACCOUNT_LOCKED",
  "timestamp": "2024-01-20T10:30:00Z",
  "details": {
    "reason": "too_many_failed_attempts",
    "lockoutDuration": 900,
    "unlockAt": "2024-01-20T10:45:00Z",
    "failedAttempts": 5
  }
}
```

### Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email/password combination invalid |
| `SESSION_EXPIRED` | 401 | User session has expired |
| `INVALID_TOKEN` | 401 | JWT token invalid or expired |
| `INVALID_API_KEY` | 401 | API key invalid or revoked |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `ROLE_RESTRICTION` | 403 | Operation not allowed for user role |
| `ACCOUNT_LOCKED` | 423 | Account temporarily locked |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `2FA_REQUIRED` | 428 | Two-factor authentication required |
| `PASSWORD_EXPIRED` | 428 | Password needs to be changed |