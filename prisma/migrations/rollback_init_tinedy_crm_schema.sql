-- Rollback Script: Initialize Tinedy CRM Schema
-- ⚠️  WARNING: This will completely remove all Tinedy CRM data and schema
-- Use with extreme caution in production environments

-- =============================================================================
-- ROLLBACK INSTRUCTIONS
-- =============================================================================
-- To rollback this migration, execute this script in the following order:
-- 1. Remove all foreign key constraints
-- 2. Drop all tables
-- 3. Drop all enums
-- 4. Drop schema if needed

-- =============================================================================
-- REMOVE FOREIGN KEY CONSTRAINTS
-- =============================================================================

ALTER TABLE "public"."webhook_logs" DROP CONSTRAINT IF EXISTS "webhook_logs_createdJobId_fkey";
ALTER TABLE "public"."training_workflows" DROP CONSTRAINT IF EXISTS "training_workflows_jobId_fkey";
ALTER TABLE "public"."quality_checks" DROP CONSTRAINT IF EXISTS "quality_checks_checklistId_fkey";
ALTER TABLE "public"."quality_checks" DROP CONSTRAINT IF EXISTS "quality_checks_jobId_fkey";
ALTER TABLE "public"."jobs" DROP CONSTRAINT IF EXISTS "jobs_assignedToId_fkey";
ALTER TABLE "public"."jobs" DROP CONSTRAINT IF EXISTS "jobs_customerId_fkey";

-- =============================================================================
-- DROP INDEXES (will be dropped automatically with tables, but explicit for clarity)
-- =============================================================================

-- Customers indexes
DROP INDEX IF EXISTS "public"."customers_lineUserId_key";
DROP INDEX IF EXISTS "public"."customers_status_idx";
DROP INDEX IF EXISTS "public"."customers_createdAt_idx";
DROP INDEX IF EXISTS "public"."customers_lineUserId_idx";
DROP INDEX IF EXISTS "public"."customers_name_idx";

-- Jobs indexes
DROP INDEX IF EXISTS "public"."jobs_customerId_idx";
DROP INDEX IF EXISTS "public"."jobs_status_idx";
DROP INDEX IF EXISTS "public"."jobs_assignedToId_idx";
DROP INDEX IF EXISTS "public"."jobs_scheduledAt_idx";
DROP INDEX IF EXISTS "public"."jobs_createdAt_idx";
DROP INDEX IF EXISTS "public"."jobs_priority_idx";
DROP INDEX IF EXISTS "public"."jobs_serviceType_idx";
DROP INDEX IF EXISTS "public"."jobs_customerId_status_idx";
DROP INDEX IF EXISTS "public"."jobs_assignedToId_status_idx";
DROP INDEX IF EXISTS "public"."jobs_status_priority_idx";

-- Users indexes
DROP INDEX IF EXISTS "public"."users_email_key";
DROP INDEX IF EXISTS "public"."users_role_idx";
DROP INDEX IF EXISTS "public"."users_isActive_idx";
DROP INDEX IF EXISTS "public"."users_email_idx";

-- Quality checks indexes
DROP INDEX IF EXISTS "public"."quality_checks_jobId_idx";
DROP INDEX IF EXISTS "public"."quality_checks_status_idx";
DROP INDEX IF EXISTS "public"."quality_checks_createdAt_idx";
DROP INDEX IF EXISTS "public"."quality_checks_checklistId_idx";

-- Quality checklists indexes
DROP INDEX IF EXISTS "public"."quality_checklists_isActive_idx";
DROP INDEX IF EXISTS "public"."quality_checklists_name_idx";

-- Training workflows indexes
DROP INDEX IF EXISTS "public"."training_workflows_jobId_key";
DROP INDEX IF EXISTS "public"."training_workflows_status_idx";
DROP INDEX IF EXISTS "public"."training_workflows_createdAt_idx";

-- Webhook logs indexes
DROP INDEX IF EXISTS "public"."webhook_logs_source_idx";
DROP INDEX IF EXISTS "public"."webhook_logs_status_idx";
DROP INDEX IF EXISTS "public"."webhook_logs_createdAt_idx";
DROP INDEX IF EXISTS "public"."webhook_logs_workflowId_idx";
DROP INDEX IF EXISTS "public"."webhook_logs_processedAt_idx";

-- Failed webhooks indexes
DROP INDEX IF EXISTS "public"."failed_webhooks_failedAt_idx";
DROP INDEX IF EXISTS "public"."failed_webhooks_manualReview_idx";
DROP INDEX IF EXISTS "public"."failed_webhooks_retryAfter_idx";

-- Audit logs indexes
DROP INDEX IF EXISTS "public"."audit_logs_entityType_entityId_idx";
DROP INDEX IF EXISTS "public"."audit_logs_timestamp_idx";
DROP INDEX IF EXISTS "public"."audit_logs_userId_idx";
DROP INDEX IF EXISTS "public"."audit_logs_action_idx";

-- =============================================================================
-- DROP TABLES (in reverse dependency order)
-- =============================================================================

-- Drop dependent tables first
DROP TABLE IF EXISTS "public"."audit_logs";
DROP TABLE IF EXISTS "public"."failed_webhooks";
DROP TABLE IF EXISTS "public"."webhook_logs";
DROP TABLE IF EXISTS "public"."training_workflows";
DROP TABLE IF EXISTS "public"."quality_checks";
DROP TABLE IF EXISTS "public"."quality_checklists";

-- Drop main entities
DROP TABLE IF EXISTS "public"."jobs";
DROP TABLE IF EXISTS "public"."users";
DROP TABLE IF EXISTS "public"."customers";

-- =============================================================================
-- DROP ENUMS
-- =============================================================================

DROP TYPE IF EXISTS "public"."WebhookStatus";
DROP TYPE IF EXISTS "public"."TrainingStatus";
DROP TYPE IF EXISTS "public"."QCStatus";
DROP TYPE IF EXISTS "public"."UserRole";
DROP TYPE IF EXISTS "public"."Priority";
DROP TYPE IF EXISTS "public"."JobStatus";
DROP TYPE IF EXISTS "public"."CustomerStatus";

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify that all tables have been removed
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'customers', 'jobs', 'users', 'quality_checks', 'quality_checklists',
    'training_workflows', 'webhook_logs', 'failed_webhooks', 'audit_logs'
  );

-- Verify that all enums have been removed
SELECT typname
FROM pg_type
WHERE typname IN (
    'CustomerStatus', 'JobStatus', 'Priority', 'UserRole', 'QCStatus',
    'TrainingStatus', 'WebhookStatus'
);

-- =============================================================================
-- ROLLBACK COMPLETED
-- =============================================================================

-- If both queries above return empty results, the rollback was successful
-- Note: This script does not drop the public schema itself, as it may contain other objects