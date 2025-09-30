-- Migration: Unify QualityChecklist and ChecklistTemplate Models
-- Database Architect: Alex
-- Date: 2025-09-28
-- Purpose: Resolve data model conflict for Story 2.5 while maintaining backward compatibility

-- =============================================================================
-- STEP 1: Add new columns to existing quality_checklists table
-- =============================================================================

-- Add serviceType column with default value for existing records
ALTER TABLE "quality_checklists"
ADD COLUMN "serviceType" "ServiceType" DEFAULT 'CLEANING'::"ServiceType";

-- Add category column to distinguish between different use cases
ALTER TABLE "quality_checklists"
ADD COLUMN "category" TEXT DEFAULT 'QUALITY_CONTROL';

-- Add fields required for Story 2.5 functionality
ALTER TABLE "quality_checklists"
ADD COLUMN "isTemplate" BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- STEP 2: Update existing records to maintain current functionality
-- =============================================================================

-- Mark existing records as quality control checklists (not templates)
UPDATE "quality_checklists"
SET
  "category" = 'QUALITY_CONTROL',
  "isTemplate" = FALSE,
  "serviceType" = 'CLEANING'::"ServiceType"
WHERE "category" IS NULL;

-- =============================================================================
-- STEP 3: Rename table to reflect unified purpose
-- =============================================================================

-- Rename table from quality_checklists to checklist_templates
ALTER TABLE "quality_checklists" RENAME TO "checklist_templates";

-- =============================================================================
-- STEP 4: Update Foreign Key Constraints
-- =============================================================================

-- Update foreign key constraint name in quality_checks table
ALTER TABLE "quality_checks"
RENAME CONSTRAINT "quality_checks_checklistId_fkey"
TO "quality_checks_templateId_fkey";

-- =============================================================================
-- STEP 5: Add new Job model enhancements for Story 2.5
-- =============================================================================

-- Add checklistTemplateId for direct job-template relationship
ALTER TABLE "jobs"
ADD COLUMN "checklistTemplateId" TEXT;

-- Add itemStatus for tracking checklist completion
ALTER TABLE "jobs"
ADD COLUMN "itemStatus" JSONB;

-- Add completion tracking
ALTER TABLE "jobs"
ADD COLUMN "checklistCompletedAt" TIMESTAMP(3);

-- =============================================================================
-- STEP 6: Create Foreign Key Relationships
-- =============================================================================

-- Add foreign key constraint for job -> checklist template relationship
ALTER TABLE "jobs"
ADD CONSTRAINT "jobs_checklistTemplateId_fkey"
FOREIGN KEY ("checklistTemplateId") REFERENCES "checklist_templates"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- STEP 7: Update Indexes for Performance
-- =============================================================================

-- Update existing indexes to reflect table rename
DROP INDEX IF EXISTS "quality_checklists_isActive_idx";
DROP INDEX IF EXISTS "quality_checklists_name_idx";

-- Create new optimized indexes
CREATE INDEX "checklist_templates_isActive_idx" ON "checklist_templates"("isActive");
CREATE INDEX "checklist_templates_name_idx" ON "checklist_templates"("name");
CREATE INDEX "checklist_templates_serviceType_idx" ON "checklist_templates"("serviceType");
CREATE INDEX "checklist_templates_category_idx" ON "checklist_templates"("category");
CREATE INDEX "checklist_templates_isTemplate_idx" ON "checklist_templates"("isTemplate");

-- Add indexes for new Job fields
CREATE INDEX "jobs_checklistTemplateId_idx" ON "jobs"("checklistTemplateId");
CREATE INDEX "jobs_checklistCompletedAt_idx" ON "jobs"("checklistCompletedAt");

-- =============================================================================
-- STEP 8: Create Unique Constraints for Data Integrity
-- =============================================================================

-- Prevent duplicate template names per service type (for templates only)
CREATE UNIQUE INDEX "checklist_templates_name_serviceType_template_unique"
ON "checklist_templates"("name", "serviceType")
WHERE "isTemplate" = TRUE;

-- =============================================================================
-- STEP 9: Insert Sample Template Data for Story 2.5 Testing
-- =============================================================================

-- Insert sample cleaning checklist template
INSERT INTO "checklist_templates" (
  "id",
  "name",
  "description",
  "items",
  "serviceType",
  "category",
  "isTemplate",
  "isActive"
) VALUES (
  'clt_cleaning_basic_001',
  'Basic Cleaning Checklist',
  'Standard cleaning checklist for general cleaning services',
  '["เช็ดกระจก", "ดูดฝุ่น", "ถูพื้น", "เช็ดโต๊ะ", "จัดระเบียบ", "ทำความสะอาดห้องน้ำ"]'::jsonb,
  'CLEANING'::"ServiceType",
  'TEMPLATE',
  TRUE,
  TRUE
);

-- Insert sample training checklist template
INSERT INTO "checklist_templates" (
  "id",
  "name",
  "description",
  "items",
  "serviceType",
  "category",
  "isTemplate",
  "isActive"
) VALUES (
  'clt_training_basic_001',
  'Basic Training Checklist',
  'Standard training checklist for new employee training',
  '["ตรวจสอบเอกสาร", "อบรมเบื้องต้น", "ทดสอบความรู้", "ฝึกปฏิบัติ", "ประเมินผล", "รับรอง"]'::jsonb,
  'TRAINING'::"ServiceType",
  'TEMPLATE',
  TRUE,
  TRUE
);

-- =============================================================================
-- VERIFICATION QUERIES (for rollback validation)
-- =============================================================================

-- Count existing quality control records (should remain unchanged)
-- SELECT COUNT(*) as quality_control_count
-- FROM "checklist_templates"
-- WHERE "category" = 'QUALITY_CONTROL';

-- Count new template records (should show 2 new templates)
-- SELECT COUNT(*) as template_count
-- FROM "checklist_templates"
-- WHERE "isTemplate" = TRUE;

-- Verify foreign key relationships still work
-- SELECT COUNT(*) as quality_checks_count
-- FROM "quality_checks" q
-- JOIN "checklist_templates" ct ON q."checklistId" = ct."id";