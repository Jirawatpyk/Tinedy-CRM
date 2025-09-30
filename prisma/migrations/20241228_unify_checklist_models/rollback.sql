-- ROLLBACK Migration: Unify QualityChecklist and ChecklistTemplate Models
-- Database Architect: Alex
-- Date: 2025-09-28
-- Purpose: Rollback script for emergency recovery

-- =============================================================================
-- EMERGENCY ROLLBACK INSTRUCTIONS
-- =============================================================================
-- 1. Run this script only if migration fails or causes issues
-- 2. Verify data integrity before and after rollback
-- 3. Contact Database Architect (Alex) if issues persist
-- =============================================================================

-- STEP 1: Remove foreign key constraint from jobs table
ALTER TABLE "jobs"
DROP CONSTRAINT IF EXISTS "jobs_checklistTemplateId_fkey";

-- STEP 2: Remove new columns from jobs table
ALTER TABLE "jobs"
DROP COLUMN IF EXISTS "checklistTemplateId";
ALTER TABLE "jobs"
DROP COLUMN IF EXISTS "itemStatus";
ALTER TABLE "jobs"
DROP COLUMN IF EXISTS "checklistCompletedAt";

-- STEP 3: Remove sample template data
DELETE FROM "checklist_templates"
WHERE "id" IN ('clt_cleaning_basic_001', 'clt_training_basic_001');

-- STEP 4: Remove new indexes
DROP INDEX IF EXISTS "checklist_templates_serviceType_idx";
DROP INDEX IF EXISTS "checklist_templates_category_idx";
DROP INDEX IF EXISTS "checklist_templates_isTemplate_idx";
DROP INDEX IF EXISTS "checklist_templates_name_serviceType_template_unique";
DROP INDEX IF EXISTS "jobs_checklistTemplateId_idx";
DROP INDEX IF EXISTS "jobs_checklistCompletedAt_idx";

-- STEP 5: Rename table back to original name
ALTER TABLE "checklist_templates" RENAME TO "quality_checklists";

-- STEP 6: Restore original foreign key constraint name
ALTER TABLE "quality_checks"
RENAME CONSTRAINT "quality_checks_templateId_fkey"
TO "quality_checks_checklistId_fkey";

-- STEP 7: Remove new columns from quality_checklists
ALTER TABLE "quality_checklists"
DROP COLUMN IF EXISTS "serviceType";
ALTER TABLE "quality_checklists"
DROP COLUMN IF EXISTS "category";
ALTER TABLE "quality_checklists"
DROP COLUMN IF EXISTS "isTemplate";

-- STEP 8: Restore original indexes
CREATE INDEX "quality_checklists_isActive_idx" ON "quality_checklists"("isActive");
CREATE INDEX "quality_checklists_name_idx" ON "quality_checklists"("name");

-- =============================================================================
-- VERIFICATION QUERIES (run after rollback)
-- =============================================================================

-- Verify table structure restored
-- DESCRIBE "quality_checklists";

-- Verify existing quality checks still work
-- SELECT COUNT(*) as existing_checks
-- FROM "quality_checks" q
-- JOIN "quality_checklists" qc ON q."checklistId" = qc."id";

-- Verify jobs table cleaned up
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'jobs'
-- AND column_name IN ('checklistTemplateId', 'itemStatus', 'checklistCompletedAt');