# Story 2.5: Quality Control Checklist Management
## 📋 Comprehensive Testing Checklist

**Story**: Quality Control Checklist Management
**Created**: 2025-09-30
**Created By**: Quinn (Test Architect)
**Purpose**: Detailed testing guide for developers to ensure 100% test coverage before production

---

## 📊 Testing Overview

| Test Level | File Count | Scenario Count | Priority | Status |
|------------|------------|----------------|----------|--------|
| **Unit Tests** | 2 | 40+ | **P0** | ⚠️ **TODO** |
| **Integration Tests** | 2 | 30+ | **P0** | ⚠️ **TODO** |
| **Component Tests** | 2 | 40+ | **P0** | ⚠️ **TODO** |
| **E2E Tests** | 1 | 20+ | **P1** | ⚠️ **TODO** |
| **Total** | **7** | **130+** | - | **0% Complete** |

---

## 🎯 Test Execution Order

### Phase 1: Foundation (P0 - Day 1-2)
1. ✅ **Unit Tests** - ChecklistTemplateService (25 scenarios)
2. ✅ **Unit Tests** - JobService checklist methods (15 scenarios)
3. ✅ **Integration Tests** - API endpoints (30 scenarios)

### Phase 2: UI Components (P0 - Day 2-3)
4. ✅ **Component Tests** - ChecklistExecutor (35 scenarios)
5. ✅ **Component Tests** - ChecklistTemplateForm (20 scenarios)

### Phase 3: Full Workflow (P1 - Day 3-4)
6. ✅ **E2E Tests** - Complete user workflows (20 scenarios)

### Phase 4: Cross-Platform (P2 - Day 4-5)
7. ⚠️ **Manual Testing** - Cross-browser, mobile devices

---

## 📝 Detailed Test Checklists

### ✅ Unit Tests: ChecklistTemplateService

**File**: `apps/crm-app/__tests__/services/checklistTemplate.test.ts`
**Template**: ✅ Created
**Total Scenarios**: 35+

#### TEST GROUP 1: getAll() - List Templates (5 scenarios)

- [ ] **UT-001**: Should return all active templates without filters
  - Given: Multiple templates exist
  - When: getAll() called without filters
  - Then: Returns all templates with isTemplate=true, category='TEMPLATE'
  - Verify: Correct where clause, orderBy createdAt desc

- [ ] **UT-002**: Should filter templates by service type (CLEANING)
  - Given: Templates of different service types exist
  - When: getAll({ serviceType: 'CLEANING' })
  - Then: Returns only CLEANING templates
  - Verify: where.serviceType = CLEANING

- [ ] **UT-003**: Should filter templates by search query (case-insensitive)
  - Given: Templates with various names exist
  - When: getAll({ search: 'ห้องน้ำ' })
  - Then: Returns templates matching name OR description
  - Verify: OR clause with contains, mode: 'insensitive'

- [ ] **UT-004**: Should filter by isActive status
  - Given: Both active and inactive templates exist
  - When: getAll({ isActive: false })
  - Then: Returns only inactive templates
  - Verify: where.isActive = false

- [ ] **UT-005**: Should return empty array when no templates match filters
  - Given: No matching templates
  - When: getAll({ serviceType: 'TRAINING', search: 'ไม่มี' })
  - Then: Returns []

#### TEST GROUP 2: getById() - Get Single Template (3 scenarios)

- [ ] **UT-006**: Should return template by ID successfully
  - Given: Template exists with ID 'template-1'
  - When: getById('template-1')
  - Then: Returns template with _count.jobsUsingTemplate
  - Verify: Includes _count aggregation

- [ ] **UT-007**: Should throw error when template not found
  - Given: No template with ID 'non-existent'
  - When: getById('non-existent')
  - Then: Throws 'Checklist template not found'

- [ ] **UT-008**: Should not return non-template checklist (category != TEMPLATE)
  - Given: QualityChecklist with different category exists
  - When: getById('quality-control-id')
  - Then: Throws error (filters by isTemplate and category)

#### TEST GROUP 3: create() - Create Template (7 scenarios)

- [ ] **UT-009**: Should create template successfully with valid data
  - Given: Valid input data
  - When: create({ name, serviceType, items })
  - Then: Creates template with category='TEMPLATE', isTemplate=true, isActive=true
  - Verify: Prisma create called with correct data

- [ ] **UT-010**: Should throw error when name is empty
  - Given: input.name = '   '
  - When: create(input)
  - Then: Throws 'Template name is required'

- [ ] **UT-011**: Should throw error when service type is missing
  - Given: input.serviceType = null
  - When: create(input)
  - Then: Throws 'Service type is required'

- [ ] **UT-012**: Should throw error when items array is empty
  - Given: input.items = []
  - When: create(input)
  - Then: Throws 'At least one checklist item is required'

- [ ] **UT-013**: Should throw error when items array is not provided
  - Given: input.items = null
  - When: create(input)
  - Then: Throws 'At least one checklist item is required'

- [ ] **UT-014**: Should throw error when duplicate template name exists for same service type
  - Given: Template 'Test' exists for CLEANING
  - When: create({ name: 'Test', serviceType: 'CLEANING', items: ['item'] })
  - Then: Throws 'Template with name "Test" already exists for CLEANING service type'

- [ ] **UT-015**: Should allow duplicate template name for different service type
  - Given: Template 'Standard' exists for CLEANING
  - When: create({ name: 'Standard', serviceType: 'TRAINING', items: ['item'] })
  - Then: Successfully creates template

#### TEST GROUP 4: update() - Update Template (6 scenarios)

- [ ] **UT-016**: Should update template successfully with partial data
  - Given: Template exists
  - When: update('template-1', { name: 'New Name' })
  - Then: Updates only name field
  - Verify: Other fields unchanged

- [ ] **UT-017**: Should update all fields successfully
  - Given: Template exists
  - When: update with all fields
  - Then: All fields updated

- [ ] **UT-018**: Should throw error when template not found
  - Given: No template with ID
  - When: update('non-existent', { name: 'Test' })
  - Then: Throws 'Checklist template not found'

- [ ] **UT-019**: Should throw error when updating to duplicate name in same service type
  - Given: Template 'Existing' exists for CLEANING
  - When: update('template-1', { name: 'Existing', serviceType: 'CLEANING' })
  - Then: Throws duplicate error

- [ ] **UT-020**: Should throw error when updating items to empty array
  - Given: Template exists
  - When: update('template-1', { items: [] })
  - Then: Throws 'At least one checklist item is required'

- [ ] **UT-021**: Should allow updating without duplicate check if name/serviceType unchanged
  - Given: Template 'Test' exists
  - When: update('template-1', { description: 'New description' })
  - Then: Updates without duplicate check

#### TEST GROUP 5: delete() - Smart Delete Logic (4 scenarios) ⭐

- [ ] **UT-022**: Should hard delete template when no jobs are using it
  - Given: Template with 0 jobs using it
  - When: delete('template-1')
  - Then: Calls prisma.checklistTemplate.delete()
  - Verify: Returns { success: true, message: 'Template deleted successfully', template: null }

- [ ] **UT-023**: Should soft delete template (set isActive=false) when jobs are using it
  - Given: Template with 10 jobs using it
  - When: delete('template-1')
  - Then: Calls prisma.checklistTemplate.update({ data: { isActive: false } })
  - Verify: Returns { success: true, message: 'Template deactivated (10 jobs...)', template }

- [ ] **UT-024**: Should throw error when template not found
  - Given: No template
  - When: delete('non-existent')
  - Then: Throws 'Checklist template not found'

- [ ] **UT-025**: Should include job count in soft delete message
  - Given: Template with 3 jobs
  - When: delete('template-1')
  - Then: Message contains '3 jobs are using this template'

#### TEST GROUP 6: getByServiceType() - For Template Selector (6 scenarios)

- [ ] **UT-026**: Should return only active templates for CLEANING service
  - Given: Multiple CLEANING templates
  - When: getByServiceType('CLEANING')
  - Then: Returns only active templates, filtered by serviceType, isTemplate, category
  - Verify: orderBy name asc

- [ ] **UT-027**: Should return only active templates for TRAINING service
  - Given: TRAINING templates exist
  - When: getByServiceType('TRAINING')
  - Then: Returns only TRAINING templates

- [ ] **UT-028**: Should return empty array when no templates available
  - Given: No templates for service type
  - When: getByServiceType('TRAINING')
  - Then: Returns []

- [ ] **UT-029**: Should return templates sorted by name (ascending)
  - Given: Templates 'ก', 'ข', 'ค' exist
  - When: getByServiceType('CLEANING')
  - Then: Returns in order ['ก', 'ข', 'ค']

- [ ] **UT-030**: Should not return inactive templates
  - Given: Mix of active and inactive templates
  - When: getByServiceType('CLEANING')
  - Then: where.isActive = true

- [ ] **UT-031**: Should select only required fields (id, name, description, items)
  - Given: Templates exist
  - When: getByServiceType('CLEANING')
  - Then: select clause includes only id, name, description, items

---

### ✅ Unit Tests: JobService - Checklist Methods

**File**: `apps/crm-app/__tests__/services/job.test.ts`
**Template**: ⚠️ **TODO** (Create similar to ChecklistTemplateService)
**Total Scenarios**: 15+

#### TEST GROUP 7: attachChecklistTemplate() (8 scenarios) ⭐

- [ ] **UT-032**: Should attach template to job successfully
  - Given: Valid job and template
  - When: attachChecklistTemplate('job-1', 'template-1')
  - Then: Updates job with checklistTemplateId and initialized itemStatus
  - Verify: itemStatus has all items set to false

- [ ] **UT-033**: Should validate service type compatibility (REC-001) ⭐
  - Given: TRAINING job, CLEANING template
  - When: attachChecklistTemplate('job-1', 'template-1')
  - Then: Throws 'Service type mismatch: Template is for CLEANING but job is TRAINING'

- [ ] **UT-034**: Should initialize itemStatus from template items
  - Given: Template with 3 items
  - When: attachChecklistTemplate()
  - Then: itemStatus = { 'item1': false, 'item2': false, 'item3': false }

- [ ] **UT-035**: Should reset checklistCompletedAt when attaching template
  - Given: Job with checklistCompletedAt set
  - When: attachChecklistTemplate()
  - Then: checklistCompletedAt = null

- [ ] **UT-036**: Should throw error when job not found
  - Given: No job with ID
  - When: attachChecklistTemplate('non-existent', 'template-1')
  - Then: Throws 'Job not found'

- [ ] **UT-037**: Should throw error when template not found
  - Given: No template with ID
  - When: attachChecklistTemplate('job-1', 'non-existent')
  - Then: Throws 'Checklist template not found or inactive'

- [ ] **UT-038**: Should throw error when template is inactive
  - Given: Template with isActive=false
  - When: attachChecklistTemplate('job-1', 'inactive-template')
  - Then: Throws 'Checklist template not found or inactive'

- [ ] **UT-039**: Should detach template when templateId is null
  - Given: Job with attached template
  - When: attachChecklistTemplate('job-1', null)
  - Then: Sets checklistTemplateId=null, itemStatus=null, checklistCompletedAt=null

#### TEST GROUP 8: updateChecklistItemStatus() (7 scenarios) ⭐

- [ ] **UT-040**: Should update item status successfully
  - Given: Job with attached template
  - When: updateChecklistItemStatus('job-1', { 'item1': true, 'item2': false })
  - Then: Updates job.itemStatus with new values

- [ ] **UT-041**: Should calculate progress correctly
  - Given: 4 total items, 2 completed
  - When: updateChecklistItemStatus()
  - Then: Returns { completed: 2, total: 4, percentage: 50, isComplete: false }

- [ ] **UT-042**: Should set checklistCompletedAt when 100% complete
  - Given: All items checked
  - When: updateChecklistItemStatus({ all items: true })
  - Then: checklistCompletedAt = current timestamp

- [ ] **UT-043**: Should clear checklistCompletedAt when unchecking items
  - Given: Previously 100% complete
  - When: updateChecklistItemStatus({ 'item1': false })
  - Then: checklistCompletedAt = null

- [ ] **UT-044**: Should throw error when job not found
  - Given: No job
  - When: updateChecklistItemStatus('non-existent', {})
  - Then: Throws 'Job not found'

- [ ] **UT-045**: Should throw error when job has no checklist template
  - Given: Job without checklistTemplateId
  - When: updateChecklistItemStatus('job-1', {})
  - Then: Throws 'Job does not have a checklist template attached'

- [ ] **UT-046**: Should handle empty itemStatus object
  - Given: Valid job
  - When: updateChecklistItemStatus('job-1', {})
  - Then: Returns { completed: 0, total: N, percentage: 0, isComplete: false }

---

### ✅ Integration Tests: API Endpoints

**File**: `apps/crm-app/__tests__/api/checklist-templates.test.ts`
**Template**: ✅ Created
**Total Scenarios**: 27+

#### TEST GROUP 9: GET /api/checklist-templates (7 scenarios)

- [ ] **INT-001**: Should return all templates for authenticated admin
  - Given: Admin session
  - When: GET /api/checklist-templates
  - Then: 200, returns array of templates with success: true

- [ ] **INT-002**: Should filter templates by service type query param
  - Given: Admin session
  - When: GET /api/checklist-templates?serviceType=CLEANING
  - Then: 200, returns only CLEANING templates

- [ ] **INT-003**: Should filter templates by search query param
  - Given: Admin session
  - When: GET /api/checklist-templates?search=ห้องน้ำ
  - Then: 200, calls service with search filter

- [ ] **INT-004**: Should return 401 when not authenticated
  - Given: No session
  - When: GET /api/checklist-templates
  - Then: 401, { error: 'Unauthorized' }

- [ ] **INT-005**: Should return 403 when user is not admin
  - Given: Operations user session
  - When: GET /api/checklist-templates
  - Then: 403, { error: 'Forbidden - Admin access required' }

- [ ] **INT-006**: Should return 400 when invalid service type provided
  - Given: Admin session
  - When: GET /api/checklist-templates?serviceType=INVALID
  - Then: 400, { error: 'Invalid service type. Must be CLEANING or TRAINING' }

- [ ] **INT-007**: Should handle service errors gracefully
  - Given: Admin session, service throws error
  - When: GET /api/checklist-templates
  - Then: 500, { error: 'Failed to fetch checklist templates' }

#### TEST GROUP 10: POST /api/checklist-templates (10 scenarios)

- [ ] **INT-008**: Should create template successfully with valid data
  - Given: Admin session, valid body
  - When: POST /api/checklist-templates
  - Then: 201, { success: true, message: 'created successfully', data: template }

- [ ] **INT-009**: Should return 401 when not authenticated
  - When: POST without session
  - Then: 401

- [ ] **INT-010**: Should return 403 when user is not admin
  - Given: Operations session
  - When: POST /api/checklist-templates
  - Then: 403

- [ ] **INT-011**: Should return 400 when name is missing
  - Given: Admin session, body without name
  - When: POST
  - Then: 400, { error: 'name is required' }

- [ ] **INT-012**: Should return 400 when service type is invalid
  - Given: Admin session, serviceType='INVALID'
  - When: POST
  - Then: 400, { error: 'Valid service type is required' }

- [ ] **INT-013**: Should return 400 when items array is empty
  - Given: Admin session, items=[]
  - When: POST
  - Then: 400, { error: 'At least one checklist item is required' }

- [ ] **INT-014**: Should return 400 when items contain non-string values
  - Given: Admin session, items=[123, null, '']
  - When: POST
  - Then: 400, { error: 'All checklist items must be non-empty strings' }

- [ ] **INT-015**: Should return 409 when duplicate template name exists
  - Given: Admin session, service throws duplicate error
  - When: POST
  - Then: 409, { error: '...already exists...' }

- [ ] **INT-016**: Should trim whitespace from name, description, and items
  - Given: Admin session, input with whitespace
  - When: POST
  - Then: Service called with trimmed values

- [ ] **INT-017**: Should validate items are non-empty strings after trim
  - Given: Admin session, items=['  ', 'valid']
  - When: POST
  - Then: 400, validation error

#### TEST GROUP 11: GET /api/checklist-templates/[id] (4 scenarios)

- [ ] **INT-018**: Should return template by ID successfully
  - Given: Admin session
  - When: GET /api/checklist-templates/template-1
  - Then: 200, { success: true, data: template }

- [ ] **INT-019**: Should return 404 when template not found
  - Given: Admin session
  - When: GET /api/checklist-templates/non-existent
  - Then: 404, { error: 'Checklist template not found' }

- [ ] **INT-020**: Should return 401 when not authenticated
  - When: GET without session
  - Then: 401

- [ ] **INT-021**: Should return 403 when user is not admin
  - Given: Operations session
  - When: GET
  - Then: 403

#### TEST GROUP 12: PUT /api/checklist-templates/[id] (3 scenarios)

- [ ] **INT-022**: Should update template successfully
  - Given: Admin session, valid update data
  - When: PUT /api/checklist-templates/template-1
  - Then: 200, { success: true, message: 'updated successfully', data }

- [ ] **INT-023**: Should return 400 when items array is empty
  - Given: Admin session, items=[]
  - When: PUT
  - Then: 400

- [ ] **INT-024**: Should return 409 when duplicate name exists
  - Given: Admin session, service throws duplicate error
  - When: PUT
  - Then: 409

#### TEST GROUP 13: DELETE /api/checklist-templates/[id] (6 scenarios) ⭐

- [ ] **INT-025**: Should delete template successfully (hard delete)
  - Given: Admin session, template not in use
  - When: DELETE /api/checklist-templates/template-1
  - Then: 200, { success: true, message: 'deleted successfully' }

- [ ] **INT-026**: Should soft delete template when jobs are using it
  - Given: Admin session, template in use
  - When: DELETE
  - Then: 200, { success: true, message: 'deactivated (N jobs...)' }

- [ ] **INT-027**: Should return 404 when template not found
  - Given: Admin session
  - When: DELETE /api/checklist-templates/non-existent
  - Then: 404

- [ ] **INT-028**: Should return 401 when not authenticated
  - When: DELETE without session
  - Then: 401

- [ ] **INT-029**: Should return 403 when user is not admin
  - Given: Operations session
  - When: DELETE
  - Then: 403

- [ ] **INT-030**: Should handle service errors gracefully
  - Given: Admin session, service throws error
  - When: DELETE
  - Then: 500

---

### ✅ Integration Tests: Job Checklist APIs

**File**: `apps/crm-app/__tests__/api/jobs-checklist.test.ts`
**Template**: ⚠️ **TODO** (Create similar to checklist-templates)
**Total Scenarios**: 12+

#### TEST GROUP 14: PATCH /api/jobs/[id]/checklist (6 scenarios)

- [ ] **INT-031**: Should attach checklist template to job successfully
  - Given: Admin session, valid templateId
  - When: PATCH /api/jobs/job-1/checklist
  - Then: 200, { success: true, message: 'attached successfully' }

- [ ] **INT-032**: Should validate service type compatibility (REC-001) ⭐
  - Given: Admin session, mismatched service types
  - When: PATCH with CLEANING template for TRAINING job
  - Then: 400, { error: 'Service type mismatch...' }

- [ ] **INT-033**: Should detach template when templateId is null
  - Given: Admin session, templateId=null
  - When: PATCH
  - Then: 200, { message: 'detached successfully' }

- [ ] **INT-034**: Should return 404 when job not found
  - Given: Admin session
  - When: PATCH /api/jobs/non-existent/checklist
  - Then: 404

- [ ] **INT-035**: Should return 401 when not authenticated
  - When: PATCH without session
  - Then: 401

- [ ] **INT-036**: Should return 403 when user is not admin
  - Given: Operations session
  - When: PATCH
  - Then: 403 (only admin can attach templates)

#### TEST GROUP 15: PATCH /api/jobs/[id]/checklist-status (6 scenarios) ⭐

- [ ] **INT-037**: Should update checklist status successfully
  - Given: Admin or Operations session
  - When: PATCH /api/jobs/job-1/checklist-status
  - Then: 200, { success: true, data: job, progress }

- [ ] **INT-038**: Should calculate progress correctly
  - Given: Admin session, 2 of 4 items checked
  - When: PATCH
  - Then: Returns { completed: 2, total: 4, percentage: 50 }

- [ ] **INT-039**: Should allow Operations role to update
  - Given: Operations session
  - When: PATCH
  - Then: 200 (success)

- [ ] **INT-040**: Should return 400 when itemStatus is invalid
  - Given: Admin session, itemStatus='string'
  - When: PATCH
  - Then: 400, { error: 'itemStatus must be an object...' }

- [ ] **INT-041**: Should return 401 when not authenticated
  - When: PATCH without session
  - Then: 401

- [ ] **INT-042**: Should return 403 when user is neither Admin nor Operations
  - Given: Training session
  - When: PATCH
  - Then: 403

---

### ✅ Component Tests: ChecklistExecutor

**File**: `apps/crm-app/__tests__/components/ChecklistExecutor.test.tsx`
**Template**: ✅ Created
**Total Scenarios**: 35+

#### TEST GROUP 16: Component Rendering (6 scenarios)

- [ ] **COMP-001**: Should render template name and all checklist items
  - Given: items=['เช็ดกระจก', 'ดูดฝุ่น', 'ถูพื้น']
  - When: Render component
  - Then: All items visible with numbered list

- [ ] **COMP-002**: Should show progress percentage as 0% when no items completed
  - Given: currentStatus={}
  - When: Render
  - Then: Shows '0 / 3 (0%)'

- [ ] **COMP-003**: Should show current completion status correctly
  - Given: currentStatus={ 'เช็ดกระจก': true, 'ถูพื้น': true }
  - When: Render
  - Then: Shows '2 / 3 (67%)'

- [ ] **COMP-004**: Should show completion badge when all items completed
  - Given: All items completed
  - When: Render
  - Then: Badge 'Completed' visible, shows '3 / 3 (100%)'

- [ ] **COMP-005**: Should render items with numbered list
  - When: Render
  - Then: Shows '1.', '2.', '3.'

- [ ] **COMP-006**: Should show quality control checklist description
  - When: Render
  - Then: Contains 'Quality control checklist for this job'

#### TEST GROUP 17: Checkbox Interaction (5 scenarios)

- [ ] **COMP-007**: Should toggle checkbox state when clicked
  - When: Click checkbox
  - Then: Checkbox becomes checked

- [ ] **COMP-008**: Should update progress when checkbox is toggled
  - When: Check 2 checkboxes
  - Then: Shows '2 / 3 (67%)'

- [ ] **COMP-009**: Should show completed styling for checked items
  - When: Check checkbox
  - Then: Label has 'text-green-900', 'font-medium' classes

- [ ] **COMP-010**: Should uncheck checkbox when clicked again
  - Given: Checkbox checked
  - When: Click again
  - Then: Checkbox unchecked, progress decreases

- [ ] **COMP-011**: Should show checkmark icon for completed items
  - When: Check checkbox
  - Then: CheckCircle2 icon visible

#### TEST GROUP 18: Auto-Save Functionality (9 scenarios) ⭐ CRITICAL

- [ ] **COMP-012**: Should trigger auto-save after 1 second debounce ⭐
  - When: Check checkbox
  - Wait: 1 second
  - Then: fetch() called with PATCH /api/jobs/[id]/checklist-status

- [ ] **COMP-013**: Should show "saving" indicator during API call
  - When: Check checkbox, wait 1s
  - Then: Shows 'Saving...' during API call

- [ ] **COMP-014**: Should show "All changes saved" after successful save
  - When: Check checkbox, wait 1s, API success
  - Then: Shows 'All changes saved'

- [ ] **COMP-015**: Should show toast notification after successful save
  - When: Save completes
  - Then: toast({ title: 'Saved', description: '...saved successfully' })

- [ ] **COMP-016**: Should reset timer when toggling multiple checkboxes rapidly ⭐
  - When: Check 3 boxes rapidly (within 1s)
  - Then: Only calls API once after final debounce
  - Verify: All 3 changes included in single request

- [ ] **COMP-017**: Should show error toast when API call fails
  - Given: API returns error
  - When: Check checkbox, wait 1s
  - Then: toast({ title: 'Error', variant: 'destructive' })

- [ ] **COMP-018**: Should handle network errors gracefully
  - Given: fetch() throws network error
  - When: Check checkbox, wait 1s
  - Then: Shows error toast

- [ ] **COMP-019**: Should send correct itemStatus in API request
  - Given: 3 items, 1st checked
  - When: Auto-save triggers
  - Then: body = { itemStatus: { 'item1': true, 'item2': false, 'item3': false } }

- [ ] **COMP-020**: Should not save in readonly mode
  - Given: readonly=true
  - When: Try to check (disabled)
  - Then: No API call

#### TEST GROUP 19: Manual Save Button (5 scenarios)

- [ ] **COMP-021**: Should render "Save Now" button
  - When: Render
  - Then: Button 'Save Now' visible

- [ ] **COMP-022**: Should trigger immediate save when button clicked
  - Given: Changes pending
  - When: Click 'Save Now'
  - Then: API called immediately (no debounce wait)

- [ ] **COMP-023**: Should disable button when no pending changes
  - Given: No changes or already saved
  - When: Render
  - Then: Button disabled

- [ ] **COMP-024**: Should enable button when there are pending changes
  - When: Check checkbox
  - Then: Button enabled

- [ ] **COMP-025**: Should show "Changes pending..." indicator
  - When: Check checkbox
  - Before: Auto-save
  - Then: Shows 'Changes pending...'

#### TEST GROUP 20: Readonly Mode (5 scenarios)

- [ ] **COMP-026**: Should disable all checkboxes in readonly mode
  - Given: readonly=true
  - When: Render
  - Then: All checkboxes have disabled attribute

- [ ] **COMP-027**: Should hide "Save Now" button in readonly mode
  - Given: readonly=true
  - When: Render
  - Then: Button not in document

- [ ] **COMP-028**: Should show readonly notice message
  - Given: readonly=true
  - When: Render
  - Then: Shows 'View only - Contact admin to update checklist'

- [ ] **COMP-029**: Should not trigger API calls in readonly mode
  - Given: readonly=true
  - When: Try to interact, wait 1s
  - Then: fetch() never called

- [ ] **COMP-030**: Should display current completion status
  - Given: readonly=true, 2/3 completed
  - When: Render
  - Then: Shows '2 / 3 (67%)'

#### TEST GROUP 21: Timer Cleanup (2 scenarios) ⭐ Memory Leak Prevention

- [ ] **COMP-031**: Should cleanup auto-save timer on component unmount ⭐
  - When: Check checkbox, unmount before 1s
  - Then: No API call (timer cleared)

- [ ] **COMP-032**: Should clear existing timer when new change occurs
  - When: Check box 1, wait 0.5s, check box 2, wait 1s
  - Then: Only 1 API call (timer reset)

#### TEST GROUP 22: Progress Calculation (3 scenarios)

- [ ] **COMP-033**: Should calculate progress correctly for various states
  - Test: 0%, 33%, 67%, 100%
  - Verify: Text and badge display correctly

- [ ] **COMP-034**: Should handle empty checklist items array
  - Given: items=[]
  - When: Render
  - Then: Shows '0 / 0 (0%)', no errors

- [ ] **COMP-035**: Should update progress bar visually
  - When: Check 1 of 3 boxes
  - Then: progressbar aria-valuenow='33'

#### TEST GROUP 23: Callback Integration (2 scenarios)

- [ ] **COMP-036**: Should call onStatusUpdate after successful save
  - Given: onStatusUpdate callback provided
  - When: Save completes
  - Then: onStatusUpdate() called once

- [ ] **COMP-037**: Should not call onStatusUpdate when save fails
  - Given: API error
  - When: Save fails
  - Then: onStatusUpdate() not called

---

### ✅ Component Tests: ChecklistTemplateForm

**File**: `apps/crm-app/__tests__/components/ChecklistTemplateForm.test.tsx`
**Template**: ⚠️ **TODO** (Create similar to ChecklistExecutor)
**Total Scenarios**: 15+

#### TEST GROUP 24: Form Rendering (4 scenarios)

- [ ] **COMP-038**: Should render form fields for create mode
- [ ] **COMP-039**: Should populate form fields in edit mode
- [ ] **COMP-040**: Should render service type dropdown with CLEANING/TRAINING
- [ ] **COMP-041**: Should render dynamic items editor component

#### TEST GROUP 25: Form Validation (6 scenarios)

- [ ] **COMP-042**: Should show error when name is empty
- [ ] **COMP-043**: Should show error when items array is empty
- [ ] **COMP-044**: Should trim whitespace from all inputs
- [ ] **COMP-045**: Should validate all items are non-empty strings
- [ ] **COMP-046**: Should show loading state during submission
- [ ] **COMP-047**: Should disable submit button while loading

#### TEST GROUP 26: Items Management (5 scenarios)

- [ ] **COMP-048**: Should add new item when "Add Item" clicked
- [ ] **COMP-049**: Should remove item when delete button clicked
- [ ] **COMP-050**: Should update item value when input changes
- [ ] **COMP-051**: Should prevent removing last item
- [ ] **COMP-052**: Should reorder items with drag-and-drop (if implemented)

---

### ✅ E2E Tests: Complete Workflows

**File**: `apps/crm-app/tests/e2e/checklist-management-workflow.spec.ts`
**Template**: ✅ Created
**Total Scenarios**: 20+

#### TEST GROUP 27: Admin CRUD Workflow (5 scenarios)

- [ ] **E2E-001**: Should complete full CRUD workflow for template ⭐
  - CREATE → READ → UPDATE → DELETE
  - Verify: Success toasts, data persistence

- [ ] **E2E-002**: Should show validation errors for invalid data
  - Submit: Empty form
  - Verify: Error messages displayed

- [ ] **E2E-003**: Should prevent duplicate template names
  - Create: Template 'Test'
  - Try create: Another 'Test' for same service type
  - Verify: Error toast

- [ ] **E2E-004**: Should filter templates by service type
  - Filter: CLEANING
  - Verify: Only CLEANING shown

- [ ] **E2E-005**: Should search templates by name
  - Search: 'ห้องน้ำ'
  - Verify: Matching results only

#### TEST GROUP 28: Job Integration (4 scenarios)

- [ ] **E2E-006**: Should attach checklist template to job ⭐
  - Navigate: Job details
  - Click: Attach Checklist
  - Select: Template
  - Verify: Checklist section appears

- [ ] **E2E-007**: Should validate service type compatibility (REC-001) ⭐
  - Job: TRAINING
  - Try attach: CLEANING template
  - Verify: Error 'Service type mismatch'

- [ ] **E2E-008**: Should filter templates by job service type
  - Open: Template selector for CLEANING job
  - Verify: Only CLEANING templates in dropdown

- [ ] **E2E-009**: Should detach checklist template
  - Click: Detach Checklist
  - Confirm: Dialog
  - Verify: Checklist removed

#### TEST GROUP 29: Operations Workflow (6 scenarios) ⭐

- [ ] **E2E-010**: Should complete checklist execution with auto-save ⭐
  - Check: All items one by one
  - Wait: 1s after each
  - Verify: Progress updates, 'Saved' indicators
  - Final: 100%, 'Completed' badge

- [ ] **E2E-011**: Should show visual feedback during auto-save
  - Check: Item
  - Verify: 'Changes pending...', then 'Saving...', then 'All changes saved'

- [ ] **E2E-012**: Should use manual save button
  - Check: 3 items rapidly
  - Click: 'Save Now'
  - Verify: Immediate save (no 1s wait)

- [ ] **E2E-013**: Should handle rapid checkbox toggles with debounce
  - Check: 3 boxes within 1 second
  - Wait: 1s more
  - Verify: Only 1 save, all changes included

- [ ] **E2E-014**: Should show error toast when save fails
  - Mock: API failure
  - Check: Item
  - Verify: Error toast displayed

- [ ] **E2E-015**: Operations cannot access template management
  - Login: Operations
  - Navigate: /settings/checklist-templates
  - Verify: 403 Forbidden

#### TEST GROUP 30: Mobile Responsive (2 scenarios)

- [ ] **E2E-016**: Should render template list on mobile
  - Viewport: 375x667
  - Verify: Cards instead of table

- [ ] **E2E-017**: Should execute checklist on mobile
  - Viewport: 375x667
  - Check: Items
  - Verify: Large tap targets (>24px), progress visible

#### TEST GROUP 31: Cross-Browser (3 scenarios)

- [ ] **E2E-018**: Should work in Chromium
- [ ] **E2E-019**: Should work in Firefox
- [ ] **E2E-020**: Should work in WebKit (Safari)

---

## 🔧 Running Tests

### Run All Tests
```bash
# Unit + Integration + Component tests
npm run test

# E2E tests
npx playwright test

# E2E with UI mode (recommended)
npx playwright test --ui
```

### Run Specific Test Files
```bash
# Unit tests - ChecklistTemplateService
npm run test apps/crm-app/__tests__/services/checklistTemplate.test.ts

# Integration tests - API
npm run test apps/crm-app/__tests__/api/checklist-templates.test.ts

# Component tests - ChecklistExecutor
npm run test apps/crm-app/__tests__/components/ChecklistExecutor.test.tsx

# E2E tests - Full workflow
npx playwright test tests/e2e/checklist-management-workflow.spec.ts
```

### Run Tests with Coverage
```bash
npm run test -- --coverage
```

### Run Tests in Watch Mode
```bash
npm run test -- --watch
```

---

## 📊 Test Coverage Goals

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| **Statements** | ≥90% | 0% | ⚠️ **TODO** |
| **Branches** | ≥85% | 0% | ⚠️ **TODO** |
| **Functions** | ≥90% | 0% | ⚠️ **TODO** |
| **Lines** | ≥90% | 0% | ⚠️ **TODO** |

---

## ✅ Definition of Done - Testing

A test is considered "Done" when:

1. ✅ Test file created and all scenarios implemented
2. ✅ All assertions pass consistently
3. ✅ No flaky tests (passes 100% of time)
4. ✅ Test names clearly describe what is being tested
5. ✅ Mocks properly configured and reset between tests
6. ✅ No console warnings or errors during test run
7. ✅ Coverage report shows adequate coverage
8. ✅ Code review completed (if applicable)

---

## 🎯 Priority Matrix

### P0 - BLOCKING (Must Complete Before Production)
- All Unit Tests (UT-001 to UT-046)
- All Integration Tests (INT-001 to INT-042)
- Critical Component Tests (COMP-012 to COMP-020: Auto-save)
- Component Memory Leak Prevention (COMP-031, COMP-032)

### P1 - HIGH (Should Complete Before Production)
- Remaining Component Tests (COMP-001 to COMP-037)
- Critical E2E Tests (E2E-001, E2E-006, E2E-010)
- Service Type Validation Tests (UT-033, INT-032, E2E-007)

### P2 - MEDIUM (Complete After Initial Deployment)
- Remaining E2E Tests (E2E-002 to E2E-015)
- Mobile Responsive Tests (E2E-016, E2E-017)
- Cross-Browser Tests (E2E-018 to E2E-020)

---

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
npm install --save-dev @testing-library/react @testing-library/user-event vitest
npm install --save-dev @playwright/test
```

### Step 2: Review Test Templates
All test templates are created and ready:
- ✅ `apps/crm-app/__tests__/services/checklistTemplate.test.ts`
- ✅ `apps/crm-app/__tests__/api/checklist-templates.test.ts`
- ✅ `apps/crm-app/__tests__/components/ChecklistExecutor.test.tsx`
- ✅ `apps/crm-app/tests/e2e/checklist-management-workflow.spec.ts`

### Step 3: Start With Unit Tests
Focus on P0 unit tests first - they're fastest to write and provide foundation.

### Step 4: Move to Integration Tests
Once services are well-tested, test API endpoints.

### Step 5: Component Tests
Test React components, especially critical auto-save functionality.

### Step 6: E2E Tests
Complete user workflows to ensure everything works together.

---

## 📞 Support

**Questions?** Contact Quinn (Test Architect) for guidance.

**Found a bug in tests?** Update this checklist and test templates.

**Need help?** Review test templates - they include detailed examples.

---

**Last Updated**: 2025-09-30
**Version**: 1.0
**Status**: Ready for Implementation ✅