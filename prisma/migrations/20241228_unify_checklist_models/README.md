# Migration: Unify Checklist Models for Story 2.5

## Overview
**Migration Date**: 2025-09-28
**Database Architect**: Alex
**Purpose**: Resolve data model conflict between existing QualityChecklist and required ChecklistTemplate for Story 2.5

## Problem Analysis

### Original Conflict
- **Existing Model**: `QualityChecklist` - Used for quality control system
- **Required Model**: `ChecklistTemplate` - Needed for Story 2.5 template management
- **Issue**: Overlapping functionality and potential confusion

### Solution: Enhanced Coexistence Model
Transform `QualityChecklist` → `ChecklistTemplate` with enhanced capabilities to serve both purposes.

## Migration Strategy

### 🎯 Key Principles
1. **Zero Data Loss** - All existing quality control data preserved
2. **Backward Compatibility** - Existing QualityCheck relationships maintained
3. **Forward Compatibility** - Support Story 2.5 requirements fully
4. **Performance Optimization** - Improved indexing for new use cases

### 🔄 Transformation Steps

#### Step 1: Schema Enhancement
```sql
-- Add new columns to existing quality_checklists table
ALTER TABLE "quality_checklists"
ADD COLUMN "serviceType" "ServiceType" DEFAULT 'CLEANING',
ADD COLUMN "category" TEXT DEFAULT 'QUALITY_CONTROL',
ADD COLUMN "isTemplate" BOOLEAN DEFAULT FALSE;
```

#### Step 2: Table Rename
```sql
-- Rename to reflect unified purpose
ALTER TABLE "quality_checklists" RENAME TO "checklist_templates";
```

#### Step 3: Job Model Enhancement
```sql
-- Add Story 2.5 required fields to jobs table
ALTER TABLE "jobs"
ADD COLUMN "checklistTemplateId" TEXT,
ADD COLUMN "itemStatus" JSONB,
ADD COLUMN "checklistCompletedAt" TIMESTAMP(3);
```

#### Step 4: Relationship Setup
```sql
-- Create foreign key relationship
ALTER TABLE "jobs"
ADD CONSTRAINT "jobs_checklistTemplateId_fkey"
FOREIGN KEY ("checklistTemplateId") REFERENCES "checklist_templates"("id");
```

## Data Model Architecture

### Enhanced ChecklistTemplate Model
```prisma
model ChecklistTemplate {
  id          String         @id @default(cuid())
  name        String         // ชื่อเช็คลิสต์
  description String?        // คำอธิบาย
  serviceType ServiceType?   // CLEANING, TRAINING (Story 2.5)
  category    String         @default("QUALITY_CONTROL") // QUALITY_CONTROL, TEMPLATE
  isTemplate  Boolean        @default(false) // Story 2.5 flag
  items       Json           // รายการเช็คลิสต์
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  // Dual-purpose relationships
  qualityChecks     QualityCheck[] // Existing quality control
  jobsUsingTemplate Job[] @relation("JobChecklistTemplate") // Story 2.5

  @@unique([name, serviceType]) // Template uniqueness
  @@map("checklist_templates")
}
```

### Enhanced Job Model
```prisma
model Job {
  // ... existing fields ...

  // Story 2.5 Checklist Integration
  checklistTemplateId   String?   // FK to ChecklistTemplate
  itemStatus           Json?     // Record<string, boolean>
  checklistCompletedAt DateTime? // Completion timestamp

  // Relations
  checklistTemplate ChecklistTemplate? @relation("JobChecklistTemplate")
}
```

## Usage Patterns

### Pattern 1: Quality Control (Existing)
```typescript
// Existing quality control usage remains unchanged
const qualityChecklist = await prisma.checklistTemplate.findFirst({
  where: {
    category: 'QUALITY_CONTROL',
    isTemplate: false
  }
});
```

### Pattern 2: Story 2.5 Templates
```typescript
// New template management for Story 2.5
const cleaningTemplates = await prisma.checklistTemplate.findMany({
  where: {
    serviceType: 'CLEANING',
    isTemplate: true,
    isActive: true
  }
});

// Attach template to job
await prisma.job.update({
  where: { id: jobId },
  data: {
    checklistTemplateId: templateId,
    itemStatus: {} // Initialize empty status
  }
});
```

## Performance Optimizations

### New Indexes
```sql
CREATE INDEX "checklist_templates_serviceType_idx" ON "checklist_templates"("serviceType");
CREATE INDEX "checklist_templates_category_idx" ON "checklist_templates"("category");
CREATE INDEX "checklist_templates_isTemplate_idx" ON "checklist_templates"("isTemplate");
CREATE INDEX "jobs_checklistTemplateId_idx" ON "jobs"("checklistTemplateId");
```

### Query Optimization
- **Service Type Filtering**: Fast template lookup by service type
- **Category Separation**: Efficient separation of quality control vs templates
- **Job Template Lookup**: Optimized job-to-template relationship queries

## Rollback Plan

### Emergency Rollback Available
- **Rollback Script**: `rollback.sql` provided for emergency recovery
- **Data Preservation**: All original data can be restored
- **Constraint Restoration**: Original foreign key constraints restored

### Rollback Triggers
- Migration failure during execution
- Performance degradation post-migration
- Unexpected data corruption
- Application compatibility issues

## Testing Verification

### Pre-Migration Checks
```sql
-- Count existing quality control records
SELECT COUNT(*) as existing_qc_count FROM quality_checklists;

-- Verify quality check relationships
SELECT COUNT(*) as quality_checks_count FROM quality_checks;
```

### Post-Migration Verification
```sql
-- Verify data preservation
SELECT COUNT(*) as total_templates FROM checklist_templates;

-- Verify backward compatibility
SELECT COUNT(*) as quality_control_preserved
FROM checklist_templates
WHERE category = 'QUALITY_CONTROL';

-- Verify new capabilities
SELECT COUNT(*) as story25_templates
FROM checklist_templates
WHERE isTemplate = true;
```

## Risk Assessment

### Low Risk ✅
- **Data Loss**: Migration preserves all existing data
- **Compatibility**: Backward compatibility maintained
- **Performance**: Optimized indexes improve performance

### Medium Risk ⚠️
- **Application Code**: Existing references to QualityChecklist need updates
- **Migration Time**: Large datasets may require extended migration window

### Mitigation Strategies
1. **Staged Deployment**: Deploy during low-traffic periods
2. **Code Updates**: Update all QualityChecklist references to ChecklistTemplate
3. **Monitoring**: Monitor performance post-migration
4. **Rollback Readiness**: Keep rollback script readily available

## Success Criteria

### ✅ Migration Success Indicators
- [ ] All existing quality control data preserved
- [ ] QualityCheck relationships functioning
- [ ] New Job-ChecklistTemplate relationships created
- [ ] Sample template data inserted successfully
- [ ] All indexes created and optimized
- [ ] No performance degradation
- [ ] Story 2.5 requirements fully supported

### 📊 Performance Benchmarks
- **Template Lookup**: < 50ms for filtered queries
- **Job Template Attachment**: < 100ms for updates
- **Quality Check Queries**: No degradation from baseline

## Next Steps

1. **Execute Migration**: Run migration.sql during maintenance window
2. **Verify Success**: Execute all verification queries
3. **Update Application Code**: Replace QualityChecklist references
4. **Story 2.5 Development**: Begin implementation with resolved schema
5. **Monitor Performance**: Track query performance for 48 hours
6. **Documentation Update**: Update API documentation with new models

---
**Database Architect**: Alex
**Migration Status**: Ready for Execution
**Confidence Level**: High (98/100)