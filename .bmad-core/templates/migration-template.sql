-- Migration Template for Tinedy CRM
-- Migration Name: {MIGRATION_NAME}
-- Created: {DATE}
-- Description: {DESCRIPTION}

-- =============================================================================
-- MIGRATION: {MIGRATION_NAME}
-- =============================================================================

-- Prerequisites check
-- Verify current schema version and dependencies

-- =============================================================================
-- CREATE ENUMS (if needed)
-- =============================================================================

-- Example: Customer Status Enum
-- CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- Example: Job Status Enum
-- CREATE TYPE "JobStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- Example: Priority Enum
-- CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- =============================================================================
-- CREATE TABLES
-- =============================================================================

-- Example: Customers Table
-- CREATE TABLE "customers" (
--     "id" TEXT NOT NULL,
--     "lineUserId" TEXT,
--     "name" TEXT NOT NULL,
--     "phone" TEXT,
--     "email" TEXT,
--     "address" TEXT,
--     "notes" TEXT,
--     "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--
--     CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
-- );

-- Example: Jobs Table
-- CREATE TABLE "jobs" (
--     "id" TEXT NOT NULL,
--     "customerId" TEXT NOT NULL,
--     "serviceType" TEXT NOT NULL,
--     "description" TEXT,
--     "status" "JobStatus" NOT NULL DEFAULT 'NEW',
--     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
--     "scheduledAt" TIMESTAMP(3),
--     "completedAt" TIMESTAMP(3),
--     "assignedToId" TEXT,
--     "n8nWorkflowId" TEXT,
--     "webhookData" JSONB,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--
--     CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
-- );

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================

-- Performance indexes for common queries
-- CREATE INDEX "customers_status_idx" ON "customers"("status");
-- CREATE INDEX "customers_lineUserId_idx" ON "customers"("lineUserId");
-- CREATE INDEX "customers_createdAt_idx" ON "customers"("createdAt");

-- CREATE INDEX "jobs_customerId_idx" ON "jobs"("customerId");
-- CREATE INDEX "jobs_status_idx" ON "jobs"("status");
-- CREATE INDEX "jobs_assignedToId_idx" ON "jobs"("assignedToId");
-- CREATE INDEX "jobs_scheduledAt_idx" ON "jobs"("scheduledAt");
-- CREATE INDEX "jobs_createdAt_idx" ON "jobs"("createdAt");

-- Composite indexes for complex queries
-- CREATE INDEX "jobs_customer_status_idx" ON "jobs"("customerId", "status");
-- CREATE INDEX "jobs_assigned_status_idx" ON "jobs"("assignedToId", "status");

-- =============================================================================
-- CREATE UNIQUE CONSTRAINTS
-- =============================================================================

-- Unique constraints for business rules
-- CREATE UNIQUE INDEX "customers_lineUserId_key" ON "customers"("lineUserId");

-- =============================================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Foreign key relationships
-- ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customerId_fkey"
--     FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ALTER TABLE "jobs" ADD CONSTRAINT "jobs_assignedToId_fkey"
--     FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- DATA MIGRATION (if needed)
-- =============================================================================

-- Example: Migrate existing data to new structure
-- UPDATE "jobs" SET "priority" = 'MEDIUM' WHERE "priority" IS NULL;

-- Example: Batch update for large tables
-- DO $$
-- DECLARE
--     batch_size INTEGER := 1000;
--     offset_val INTEGER := 0;
--     rows_updated INTEGER;
-- BEGIN
--     LOOP
--         UPDATE jobs
--         SET status = 'NEW'
--         WHERE id IN (
--             SELECT id FROM jobs
--             WHERE status IS NULL
--             LIMIT batch_size OFFSET offset_val
--         );

--         GET DIAGNOSTICS rows_updated = ROW_COUNT;
--         EXIT WHEN rows_updated = 0;

--         offset_val := offset_val + batch_size;
--         PERFORM pg_sleep(0.1); -- Prevent overwhelming the database
--     END LOOP;
-- END $$;

-- =============================================================================
-- CREATE VIEWS (if needed)
-- =============================================================================

-- Example: Customer summary view
-- CREATE VIEW "customer_summary" AS
-- SELECT
--     c.id,
--     c.name,
--     c.status,
--     COUNT(j.id) as total_jobs,
--     COUNT(CASE WHEN j.status = 'COMPLETED' THEN 1 END) as completed_jobs,
--     MAX(j.createdAt) as last_job_date
-- FROM customers c
-- LEFT JOIN jobs j ON c.id = j.customerId
-- GROUP BY c.id, c.name, c.status;

-- =============================================================================
-- INSERT SEED DATA (if needed)
-- =============================================================================

-- Example: Insert default quality checklists
-- INSERT INTO "quality_checklists" ("id", "name", "description", "items", "isActive") VALUES
-- ('default-service-checklist', 'Standard Service Quality Check', 'Default checklist for all services',
--  '[{"item": "Service completion verified", "required": true}, {"item": "Customer satisfaction confirmed", "required": true}]',
--  true);

-- =============================================================================
-- VALIDATION QUERIES
-- =============================================================================

-- Verify migration success
-- SELECT 'customers' as table_name, COUNT(*) as row_count FROM customers
-- UNION ALL
-- SELECT 'jobs' as table_name, COUNT(*) as row_count FROM jobs;

-- Check foreign key constraints
-- SELECT
--     tc.table_name,
--     kcu.column_name,
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('customers', 'jobs');

-- Verify indexes created
-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('customers', 'jobs')
-- ORDER BY tablename, indexname;

-- =============================================================================
-- ROLLBACK SCRIPT (create separate file: rollback_{MIGRATION_NAME}.sql)
-- =============================================================================

-- Instructions for rollback:
-- 1. Create rollback script file
-- 2. Test rollback on staging environment
-- 3. Document rollback procedure
-- 4. Estimate rollback time

-- Example rollback commands:
-- DROP VIEW IF EXISTS "customer_summary";
-- ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "jobs_customerId_fkey";
-- ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "jobs_assignedToId_fkey";
-- DROP INDEX IF EXISTS "customers_status_idx";
-- DROP INDEX IF EXISTS "jobs_customer_status_idx";
-- DROP TABLE IF EXISTS "jobs";
-- DROP TABLE IF EXISTS "customers";
-- DROP TYPE IF EXISTS "CustomerStatus";
-- DROP TYPE IF EXISTS "JobStatus";
-- DROP TYPE IF EXISTS "Priority";

-- =============================================================================
-- PERFORMANCE NOTES
-- =============================================================================

-- Expected impact:
-- - Table creation time: {ESTIMATED_TIME}
-- - Index creation time: {ESTIMATED_TIME}
-- - Data migration time: {ESTIMATED_TIME}
-- - Total migration time: {ESTIMATED_TIME}

-- Resource requirements:
-- - Disk space: {ESTIMATED_SIZE}
-- - Memory usage: {ESTIMATED_MEMORY}
-- - CPU impact: {ESTIMATED_CPU}

-- =============================================================================
-- POST-MIGRATION TASKS
-- =============================================================================

-- TODO after migration:
-- [ ] Update application configuration
-- [ ] Deploy new application code
-- [ ] Update monitoring dashboards
-- [ ] Update documentation
-- [ ] Notify stakeholders of completion

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================