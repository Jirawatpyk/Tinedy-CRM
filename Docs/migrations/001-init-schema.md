# Migration 001: Initialize Tinedy CRM Schema

**Date:** 2024-01-27
**Database Agent:** Alex
**Migration ID:** `20241227060000_init_tinedy_crm_schema`

## 📋 Overview

การ migration นี้เป็นการสร้าง database schema เริ่มต้นสำหรับ Tinedy CRM system ครบถ้วนสมบูรณ์ รองรับการจัดการลูกค้า งาน ระบบควบคุมคุณภาพ และการฝึกอบรม

## 🎯 Objectives

- สร้าง database schema สำหรับ CRM system
- รองรับ N8N webhook integration
- รองรับ LINE OA customer data
- ระบบ role-based access control
- ระบบ audit trail ครบถ้วน

## 📊 Schema Changes

### 🔢 Enums Created

| Enum | Values | Purpose |
|------|--------|---------|
| `CustomerStatus` | ACTIVE, INACTIVE, BLOCKED | สถานะลูกค้า |
| `JobStatus` | NEW, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD | สถานะงาน |
| `Priority` | LOW, MEDIUM, HIGH, URGENT | ลำดับความสำคัญ |
| `UserRole` | ADMIN, OPERATIONS, TRAINING, QC_MANAGER | บทบาทผู้ใช้ |
| `QCStatus` | PENDING, IN_PROGRESS, PASSED, FAILED, NEEDS_REVIEW | สถานะ QC |
| `TrainingStatus` | AWAITING_DOCUMENTS, DOCUMENTS_RECEIVED, TRAINING_IN_PROGRESS, TRAINING_COMPLETED, COMPLETED | สถานะการฝึกอบรม |
| `WebhookStatus` | RECEIVED, PROCESSING, PROCESSED, FAILED, RETRY_NEEDED | สถานะ webhook |

### 🗄️ Tables Created

#### Core Business Tables

1. **customers** - ข้อมูลลูกค้า
   - Primary Key: `id` (TEXT)
   - Unique: `lineUserId` (สำหรับ LINE OA integration)
   - Fields: name, phone, email, address, notes, status
   - Indexes: status, createdAt, lineUserId, name

2. **jobs** - ข้อมูลงาน/การจอง
   - Primary Key: `id` (TEXT)
   - Foreign Keys: `customerId` → customers, `assignedToId` → users
   - Fields: serviceType, description, status, priority, scheduledAt, completedAt
   - Special: `n8nWorkflowId`, `webhookData` (JSONB)
   - Indexes: หลายตัวรวม composite indexes

3. **users** - ข้อมูลผู้ใช้
   - Primary Key: `id` (TEXT)
   - Unique: `email`
   - Fields: name, role, isActive
   - Indexes: role, isActive, email

#### Quality Control System

4. **quality_checks** - การตรวจสอบคุณภาพ
   - Links: `jobId` → jobs, `checklistId` → quality_checklists
   - Fields: status, completedBy, completedAt, notes

5. **quality_checklists** - เทมเพลตเช็คลิสต์
   - Fields: name, description, items (JSONB), isActive

#### Training System

6. **training_workflows** - ระบบการฝึกอบรม
   - One-to-one: `jobId` → jobs (UNIQUE)
   - Fields: status, documentsReceived, trainingCompleted, notes

#### Integration & Monitoring

7. **webhook_logs** - บันทึก N8N webhooks
   - Fields: source, workflowId, executionId, payload (JSONB)
   - Status tracking: status, processedAt, errorMessage, retryCount

8. **failed_webhooks** - Dead letter queue
   - Fields: originalLogId, payload (JSONB), errorDetails
   - Recovery: retryAfter, manualReview

9. **audit_logs** - ระบบ audit trail
   - Fields: entityType, entityId, action, oldValues/newValues (JSONB)
   - Tracking: userId, timestamp

### 🔗 Relationships

```
Customer (1) ←→ (N) Job ←→ (1) User
    ↓                ↓
QualityCheck    TrainingWorkflow
    ↓
QualityChecklist

Job (1) ←→ (N) WebhookLog
```

### 📈 Performance Optimizations

#### Single Column Indexes (17 indexes)
- Primary lookups: customers.status, jobs.status, users.role
- Search optimizations: customers.name, jobs.serviceType
- Time-based queries: createdAt, scheduledAt, processedAt

#### Composite Indexes (3 indexes)
- `jobs(customerId, status)` - Customer job history
- `jobs(assignedToId, status)` - User workload queries
- `jobs(status, priority)` - Job prioritization

#### Unique Constraints
- `customers.lineUserId` - LINE OA integration
- `users.email` - Authentication
- `training_workflows.jobId` - One training per job

## 🔒 Security Features

- **Role-based access control** via UserRole enum
- **Foreign key constraints** prevent orphaned data
- **Audit trail** ใน audit_logs table
- **Webhook security** via payload validation
- **Data integrity** ด้วย Prisma constraints

## 📊 Estimated Impact

### Performance
- **Migration time**: ~30 seconds (empty database)
- **Index creation**: ~10 seconds
- **Disk space**: ~50MB (with initial data)

### Data Volume Capacity
- **Customers**: 1M+ records
- **Jobs**: 10M+ records
- **Webhooks**: 100M+ records (with cleanup)

## 🚀 Deployment Instructions

### Pre-Deployment Checklist

- [ ] Database backup completed
- [ ] Staging environment tested
- [ ] All tests passing
- [ ] Rollback script prepared
- [ ] Monitoring alerts configured

### Deployment Steps

1. **Backup Database**
   ```bash
   pg_dump $DATABASE_URL > backup_pre_migration.sql
   ```

2. **Run Migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify Schema**
   ```bash
   npx prisma db pull
   npx prisma validate
   ```

4. **Run Validation Tests**
   ```bash
   npm run test:integration
   ```

## 🔄 Rollback Procedure

**⚠️ WARNING: Rollback will destroy all data**

1. **Emergency Rollback**
   ```bash
   psql $DATABASE_URL -f prisma/migrations/rollback_init_tinedy_crm_schema.sql
   ```

2. **Restore from Backup**
   ```bash
   psql $DATABASE_URL < backup_pre_migration.sql
   ```

## ✅ Post-Migration Validation

### Functional Tests

```sql
-- Test table creation
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Test enum creation
SELECT typname FROM pg_type
WHERE typname IN ('CustomerStatus', 'JobStatus', 'UserRole');

-- Test indexes
SELECT indexname FROM pg_indexes
WHERE tablename IN ('customers', 'jobs', 'users');

-- Test foreign keys
SELECT constraint_name FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY';
```

### Sample Data Test

```sql
-- Test customer creation
INSERT INTO customers (id, name, status)
VALUES ('test-1', 'Test Customer', 'ACTIVE');

-- Test job creation with FK
INSERT INTO jobs (id, customerId, serviceType, status)
VALUES ('job-1', 'test-1', 'Test Service', 'NEW');

-- Verify relationships
SELECT c.name, j.serviceType
FROM customers c
JOIN jobs j ON c.id = j.customerId;
```

## 📝 Notes

- Schema เป็น PostgreSQL specific (ใช้ JSONB, TIMESTAMP(3))
- รองรับ Vercel Postgres platform
- Prisma ORM compatible
- TypeScript type generation ready

## 👥 Migration Team

- **Database Agent**: Alex
- **Review**: Product Owner (Sarah)
- **Approval**: Technical Lead

---

**Migration Status**: ✅ Ready for Deployment
**Risk Level**: 🟢 Low (Initial schema creation)
**Estimated Downtime**: ~1 minute