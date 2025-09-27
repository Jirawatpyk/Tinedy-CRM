# Create Migration Task

## Objective
Generate safe, reversible Prisma migrations with proper validation and rollback procedures for Tinedy CRM database changes.

## Prerequisites
- [ ] Schema changes designed and reviewed
- [ ] Database backup available
- [ ] Migration checklist completed

## Task Steps

### 1. Pre-Migration Validation
- [ ] Review schema changes against business requirements
- [ ] Check for breaking changes to existing data
- [ ] Validate foreign key relationships
- [ ] Ensure proper indexing strategy
- [ ] Test migration on development database copy

### 2. Generate Migration
```bash
# Generate migration with descriptive name
npx prisma migrate dev --name add_webhook_logging_and_quality_control

# Or for production-ready migration
npx prisma migrate deploy
```

### 3. Migration Naming Convention
Use descriptive names that indicate the change:
- `add_customer_line_integration`
- `create_quality_control_system`
- `update_job_status_enum`
- `add_webhook_processing_tables`
- `create_audit_trail_system`

### 4. Review Generated Migration SQL

#### Example Migration Structure:
```sql
-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "lineUserId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_lineUserId_key" ON "customers"("lineUserId");
CREATE INDEX "customers_status_idx" ON "customers"("status");
CREATE INDEX "customers_createdAt_idx" ON "customers"("createdAt");
```

### 5. Data Migration Considerations

#### Handle Existing Data
If modifying existing tables:
```sql
-- Safe data migration example
-- Step 1: Add new column as nullable
ALTER TABLE "jobs" ADD COLUMN "priority" "Priority";

-- Step 2: Update existing records with default values
UPDATE "jobs" SET "priority" = 'MEDIUM' WHERE "priority" IS NULL;

-- Step 3: Make column non-nullable (in separate migration)
ALTER TABLE "jobs" ALTER COLUMN "priority" SET NOT NULL;
```

#### Large Table Migrations
For tables with significant data:
```sql
-- Use batched updates for large datasets
DO $$
DECLARE
    batch_size INTEGER := 1000;
    offset_val INTEGER := 0;
    rows_updated INTEGER;
BEGIN
    LOOP
        UPDATE jobs
        SET status = 'NEW'
        WHERE id IN (
            SELECT id FROM jobs
            WHERE status IS NULL
            LIMIT batch_size OFFSET offset_val
        );

        GET DIAGNOSTICS rows_updated = ROW_COUNT;
        EXIT WHEN rows_updated = 0;

        offset_val := offset_val + batch_size;

        -- Add delay to prevent overwhelming the database
        PERFORM pg_sleep(0.1);
    END LOOP;
END $$;
```

### 6. Migration Testing Strategy

#### Development Testing
```bash
# Test migration up
npx prisma migrate dev

# Test with seed data
npx prisma db seed

# Test rollback (if supported)
npx prisma migrate reset
```

#### Production Simulation
```bash
# Create production database dump
pg_dump production_db > backup_before_migration.sql

# Apply migration to staging
npx prisma migrate deploy

# Run integration tests
npm run test:integration

# Validate data integrity
npm run validate:data
```

### 7. Rollback Strategy

#### Automatic Rollback (Development)
```bash
# Reset database to last migration
npx prisma migrate reset

# Deploy specific migration
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

#### Manual Rollback (Production)
Create rollback SQL scripts:
```sql
-- rollback_add_quality_control.sql
DROP TABLE IF EXISTS "quality_checks";
DROP TABLE IF EXISTS "quality_checklists";
DROP TYPE IF EXISTS "QCStatus";
```

### 8. Migration Documentation

#### Migration README Template:
```markdown
# Migration: Add Quality Control System

## Changes
- Added QualityCheck model
- Added QualityChecklist model
- Added QCStatus enum
- Added foreign key relationships
- Added performance indexes

## Data Impact
- No existing data affected
- New tables created empty
- No breaking changes

## Rollback Instructions
```sql
-- Execute rollback_quality_control.sql
```

## Validation Steps
1. Verify new tables created
2. Check foreign key constraints
3. Test quality check creation
4. Validate enum values
```

### 9. Performance Considerations

#### Index Strategy
```sql
-- Essential indexes for CRM performance
CREATE INDEX CONCURRENTLY "jobs_customer_status_idx" ON "jobs"("customerId", "status");
CREATE INDEX CONCURRENTLY "jobs_assigned_status_idx" ON "jobs"("assignedToId", "status");
CREATE INDEX CONCURRENTLY "webhook_logs_status_created_idx" ON "webhook_logs"("status", "createdAt");
```

#### Large Migration Optimization
```sql
-- Disable triggers during large migrations
ALTER TABLE jobs DISABLE TRIGGER ALL;
-- Perform migration
ALTER TABLE jobs ENABLE TRIGGER ALL;

-- Use concurrent index creation
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_name" ON "table"("column");
```

### 10. Post-Migration Validation

#### Data Integrity Checks
```sql
-- Check foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- Verify indexes created
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'jobs';
```

#### Business Logic Validation
```typescript
// Test core business operations after migration
async function validateMigration() {
  // Test customer creation
  const customer = await prisma.customer.create({
    data: { name: 'Test Customer', status: 'ACTIVE' }
  });

  // Test job creation with relations
  const job = await prisma.job.create({
    data: {
      customerId: customer.id,
      serviceType: 'Test Service',
      status: 'NEW',
      priority: 'MEDIUM'
    }
  });

  // Test quality check creation
  const qc = await prisma.qualityCheck.create({
    data: {
      jobId: job.id,
      checklistId: 'checklist-id',
      status: 'PENDING'
    }
  });

  console.log('Migration validation successful');
}
```

## Validation Steps
- [ ] Migration SQL reviewed and approved
- [ ] Backup created before migration
- [ ] Migration tested on staging environment
- [ ] Performance impact assessed
- [ ] Rollback procedure tested
- [ ] Post-migration validation scripts prepared

## Deliverables
1. Generated migration files
2. Migration documentation
3. Rollback scripts
4. Validation procedures
5. Performance impact assessment

## Success Criteria
- Migration executes without errors
- Data integrity maintained
- Performance impact acceptable
- Rollback procedure confirmed working
- All tests pass post-migration