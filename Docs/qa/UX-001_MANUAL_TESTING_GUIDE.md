# 🧪 UX-001: Manual E2E Testing Guide
## Story 2.5 - Staging Environment Validation

**Test Owner**: QA Team
**Story**: 2.5 - Quality Control Checklist Management
**Environment**: Staging
**Duration**: 1-2 days
**Priority**: P1 - Required before production

---

## 📋 Pre-Testing Checklist

Before starting manual testing, verify:

- [ ] Staging environment deployed successfully
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Application accessible at staging URL
- [ ] Admin user account available
- [ ] Operations user account available
- [ ] Test data loaded (customers, jobs)

---

## 🎯 Testing Scope

**Total Test Scenarios**: 45+ manual tests
**Acceptance Criteria Coverage**: 9/9 (100%)
**Estimated Time**: 6-8 hours

---

## 📱 Test Environment Setup

### Required Test Accounts

**Admin Account**:
- Username: `admin@tinedy.com`
- Password: [Use staging credentials]
- Role: Admin

**Operations Account**:
- Username: `operations@tinedy.com`
- Password: [Use staging credentials]
- Role: Operations

### Required Test Data

**Customers**: At least 3 test customers
**Jobs**: At least 5 test jobs with different service types:
- 2 × CLEANING jobs
- 2 × PLUMBING jobs
- 1 × ELECTRICAL job

### Test Devices

- [ ] Desktop - Chrome (Windows/Mac)
- [ ] Desktop - Firefox (Windows/Mac)
- [ ] Desktop - Safari (Mac only)
- [ ] Mobile - iOS Safari (iPhone)
- [ ] Mobile - Android Chrome (Samsung/Pixel)
- [ ] Tablet - iPad Safari

---

## 🔍 Test Scenarios

---

## GROUP 1: Admin Workflow - Template Management (AC 1-4)

### Test 1.1: Navigate to Template Management ✅
**AC**: AC1, AC2
**Priority**: P0

**Steps**:
1. Login as Admin
2. Navigate to Settings menu
3. Click "Checklist Templates"

**Expected Results**:
- [ ] Settings menu visible in navigation
- [ ] "Checklist Templates" option present
- [ ] Page loads successfully
- [ ] Template list displays (empty or with existing templates)

**Bug Report Format**: If failed, note: Page URL, Error message, Screenshot

---

### Test 1.2: Create New Template - CLEANING Service ✅
**AC**: AC1
**Priority**: P0

**Steps**:
1. Click "Create New Template" button
2. Fill in form:
   - Name: "ทำความสะอาดบ้าน - Standard"
   - Service Type: Select "CLEANING"
   - Add checklist items:
     - "เช็ดกระจกทุกบาน"
     - "ดูดฝุ่นพรม"
     - "ถูพื้นทั้งหมด"
     - "ล้างห้องน้ำ"
     - "เช็คอุปกรณ์ครบถ้วน"
3. Click "Save" button

**Expected Results**:
- [ ] Form validation works (required fields)
- [ ] Items can be added dynamically
- [ ] Template saves successfully
- [ ] Success toast notification appears
- [ ] Redirect to template list
- [ ] New template visible in list

**Verification**:
- [ ] Template name displayed correctly (ทำความสะอาดบ้าน - Standard)
- [ ] Service type shown: CLEANING
- [ ] Item count: 5 items

---

### Test 1.3: Create Template - PLUMBING Service ✅
**AC**: AC1
**Priority**: P0

**Steps**:
1. Click "Create New Template"
2. Fill in:
   - Name: "ซ่อมประปา - Basic"
   - Service Type: "PLUMBING"
   - Items:
     - "ตรวจสอบท่อรั่ว"
     - "เช็คแรงดันน้ำ"
     - "ทดสอบระบบ"
3. Save

**Expected Results**:
- [ ] Template created successfully
- [ ] PLUMBING service type saved correctly
- [ ] Template appears in list

---

### Test 1.4: Create Template - Validation Errors ✅
**AC**: AC1
**Priority**: P0

**Steps**:
1. Click "Create New Template"
2. Try to save with empty name
3. Try to save without service type
4. Try to save with no checklist items

**Expected Results**:
- [ ] Validation error for empty name: "Name is required"
- [ ] Validation error for missing service type
- [ ] Validation error for empty items: "At least one item required"
- [ ] Error messages displayed clearly in red
- [ ] Form does NOT submit
- [ ] User stays on form page

---

### Test 1.5: Prevent Duplicate Template Names (Same Service Type) ✅
**AC**: AC1
**Priority**: P0

**Steps**:
1. Try to create new template:
   - Name: "ทำความสะอาดบ้าน - Standard" (exact match)
   - Service Type: CLEANING (same as existing)
2. Click Save

**Expected Results**:
- [ ] Error message: "Template with this name already exists for CLEANING service"
- [ ] Form does NOT submit
- [ ] Existing template unchanged

**Verification**:
- [ ] Duplicate with same name + same service type: REJECTED ✅
- [ ] Same name + different service type: ALLOWED ✅

---

### Test 1.6: Filter Templates by Service Type ✅
**AC**: AC2
**Priority**: P0

**Steps**:
1. On template list page
2. Use service type filter dropdown
3. Select "CLEANING"
4. Select "PLUMBING"
5. Select "All" or clear filter

**Expected Results**:
- [ ] Filter dropdown visible and functional
- [ ] Selecting CLEANING shows only CLEANING templates
- [ ] Selecting PLUMBING shows only PLUMBING templates
- [ ] "All" shows all templates
- [ ] Count updates correctly

---

### Test 1.7: Search Templates by Name ✅
**AC**: AC2
**Priority**: P0

**Steps**:
1. Use search box on template list
2. Type "ทำความสะอาด"
3. Clear search
4. Type "ซ่อม"

**Expected Results**:
- [ ] Search box visible and functional
- [ ] Search is case-insensitive
- [ ] Partial matches work (e.g., "ทำ" finds "ทำความสะอาด")
- [ ] Results update in real-time
- [ ] Clearing search shows all templates

---

### Test 1.8: Edit Existing Template ✅
**AC**: AC3
**Priority**: P0

**Steps**:
1. Click "Edit" button on "ทำความสะอาดบ้าน - Standard"
2. Change name to: "ทำความสะอาดบ้าน - Premium"
3. Add new item: "ทำความสะอาดระเบียง"
4. Remove item: "เช็คอุปกรณ์ครบถ้วน"
5. Click Save

**Expected Results**:
- [ ] Edit form loads with existing data
- [ ] All fields editable
- [ ] Items can be added/removed
- [ ] Template updates successfully
- [ ] Changes reflected in list

**Verification**:
- [ ] Name updated: "ทำความสะอาดบ้าน - Premium"
- [ ] New item added
- [ ] Removed item gone
- [ ] Item count correct

---

### Test 1.9: Delete Template - Not In Use ✅
**AC**: AC4
**Priority**: P0

**Steps**:
1. Create a new test template (not attached to any job)
2. Click "Delete" button
3. Confirm deletion in dialog

**Expected Results**:
- [ ] Confirmation dialog appears: "Are you sure you want to delete this template?"
- [ ] Dialog shows warning if template in use
- [ ] Click "Confirm" → Template deleted (HARD DELETE)
- [ ] Click "Cancel" → Template remains
- [ ] Success toast: "Template deleted successfully"
- [ ] Template removed from list

---

### Test 1.10: Delete Template - In Use (Smart Delete) ✅
**AC**: AC4
**Priority**: P0

**Steps**:
1. Select template that is attached to jobs
2. Click "Delete"
3. Confirm deletion

**Expected Results**:
- [ ] Confirmation dialog appears
- [ ] Warning message: "This template is being used by X job(s). It will be archived instead of deleted."
- [ ] Click "Confirm" → Template soft-deleted (isActive = false)
- [ ] Template hidden from default list
- [ ] Existing jobs still reference template
- [ ] Success toast: "Template archived successfully"

---

## GROUP 2: Admin Workflow - Attach Checklist to Job (AC 5-6)

### Test 2.1: Navigate to Job Details ✅
**AC**: AC5
**Priority**: P0

**Steps**:
1. As Admin, navigate to Jobs list
2. Click on a CLEANING job
3. Scroll to "Quality Control Checklist" section

**Expected Results**:
- [ ] Job details page loads
- [ ] Checklist section visible
- [ ] "Attach Checklist Template" button present (if no template attached)
- [ ] Or checklist executor visible (if template attached)

---

### Test 2.2: Attach Template to Job ✅
**AC**: AC5, AC6
**Priority**: P0

**Steps**:
1. On job details (CLEANING job, no checklist)
2. Click "Attach Checklist Template"
3. Template selector modal opens
4. Select "ทำความสะอาดบ้าน - Premium"
5. Click "Attach"

**Expected Results**:
- [ ] Modal shows ONLY templates matching job service type (CLEANING)
- [ ] PLUMBING/ELECTRICAL templates NOT shown
- [ ] Template attaches successfully
- [ ] Success toast: "Checklist template attached"
- [ ] Checklist executor appears with all items unchecked
- [ ] Progress: 0/5 (0%)

---

### Test 2.3: Service Type Validation ✅
**AC**: AC6
**Priority**: P0

**Steps**:
1. Open PLUMBING job
2. Try to attach CLEANING template (should not be possible via UI)
3. Verify template selector only shows PLUMBING templates

**Expected Results**:
- [ ] Template selector filtered by service type
- [ ] Only PLUMBING templates visible
- [ ] CLEANING templates NOT shown
- [ ] Service type mismatch prevented

---

### Test 2.4: Detach Template from Job ✅
**AC**: AC5
**Priority**: P1

**Steps**:
1. On job with attached checklist
2. Click "Detach Checklist" button
3. Confirm in dialog

**Expected Results**:
- [ ] Confirmation dialog: "This will remove the checklist. Progress will be lost."
- [ ] Click "Confirm" → Template detached
- [ ] Checklist executor hidden
- [ ] "Attach Checklist Template" button appears
- [ ] Job.checklistTemplateId = null
- [ ] Job.itemStatus cleared

---

### Test 2.5: Change Job Service Type (Auto-Detach) ✅
**AC**: AC6
**Priority**: P1

**Steps**:
1. Job with CLEANING template attached
2. Edit job and change service type to PLUMBING
3. Save job

**Expected Results**:
- [ ] Warning: "Changing service type will detach the current checklist"
- [ ] After save, checklist detached automatically
- [ ] No validation errors
- [ ] Job updates successfully

---

## GROUP 3: Operations Workflow - Execute Checklist (AC 7-9)

### Test 3.1: Login as Operations User ✅
**AC**: AC7
**Priority**: P0

**Steps**:
1. Logout as Admin
2. Login as Operations user
3. Navigate to assigned jobs
4. Open job with attached checklist

**Expected Results**:
- [ ] Operations user can login
- [ ] Can view assigned jobs
- [ ] Can access job details
- [ ] Checklist executor visible
- [ ] All checkboxes interactive

---

### Test 3.2: Execute Checklist - Toggle Checkboxes ✅
**AC**: AC8
**Priority**: P0

**Steps**:
1. As Operations, on job with checklist
2. Check first item: "เช็ดกระจกทุกบาน"
3. Wait 1 second (observe auto-save)
4. Check second item: "ดูดฝุ่นพรม"
5. Uncheck first item
6. Wait for auto-save

**Expected Results**:
- [ ] Checkboxes clickable and responsive
- [ ] Checked items turn green background
- [ ] Check icon appears on checked items
- [ ] "Changes pending..." appears immediately
- [ ] After 1 second, "Saving..." indicator shows
- [ ] After save, "All changes saved" appears
- [ ] Toast notification: "Saved"
- [ ] Progress updates in real-time

---

### Test 3.3: Verify Auto-Save Debounce (1 Second) ✅
**AC**: AC8
**Priority**: P0

**Steps**:
1. Rapidly toggle 3 checkboxes within 1 second
2. Stop clicking
3. Wait and observe

**Expected Results**:
- [ ] "Changes pending..." appears immediately
- [ ] NO API call during rapid clicking
- [ ] After 1 second of inactivity → "Saving..." appears
- [ ] Single API call made (not 3 separate calls)
- [ ] All changes saved together
- [ ] Toast notification appears once

**Verification** (Dev Tools):
- [ ] Open Network tab
- [ ] Count PATCH requests to `/api/jobs/[id]/checklist-status`
- [ ] Should be 1 request, not 3

---

### Test 3.4: Manual Save Button ✅
**AC**: AC8
**Priority**: P1

**Steps**:
1. Check one item
2. Before auto-save (within 1 second), click "Save Now" button

**Expected Results**:
- [ ] "Save Now" button visible when changes pending
- [ ] Button disabled when no changes or already saving
- [ ] Click triggers immediate save
- [ ] Auto-save timer cancelled
- [ ] Changes saved successfully
- [ ] Progress updates

---

### Test 3.5: Progress Tracking - Real-time Calculation ✅
**AC**: AC9
**Priority**: P0

**Steps**:
1. Start with 0/5 items checked (0%)
2. Check 1 item → verify progress
3. Check 2 more items → verify progress
4. Check all remaining → verify completion

**Expected Results**:
- [ ] Progress bar updates in real-time
- [ ] Percentage calculated correctly:
  - 1/5 = 20%
  - 3/5 = 60%
  - 5/5 = 100%
- [ ] Count shown: "X / Y completed"
- [ ] At 100%: Green "Completed" badge appears
- [ ] Completion timestamp set (checklistCompletedAt)

---

### Test 3.6: Refresh Page - Progress Persisted ✅
**AC**: AC8, AC9
**Priority**: P0

**Steps**:
1. Check 3 out of 5 items (60%)
2. Wait for "All changes saved"
3. Refresh browser page (F5)

**Expected Results**:
- [ ] Progress persisted: Still shows 3/5 (60%)
- [ ] Checked items remain checked
- [ ] Unchecked items remain unchecked
- [ ] No data loss
- [ ] Progress bar shows 60%

---

### Test 3.7: Rapid Toggle with Request Cancellation (PERF-001) ✅
**Priority**: P0

**Steps**:
1. Open DevTools → Network tab
2. Rapidly toggle same checkbox 5 times within 2 seconds
3. Observe network requests

**Expected Results**:
- [ ] Multiple requests initiated
- [ ] Previous requests cancelled (status: "cancelled" in DevTools)
- [ ] Only final request completes
- [ ] No race conditions
- [ ] Final state correct
- [ ] No duplicate saves

**Verification**:
- [ ] AbortController working
- [ ] No "Failed to save" errors
- [ ] State consistent

---

### Test 3.8: Error Handling - Network Failure ✅
**AC**: AC8
**Priority**: P1

**Steps**:
1. Open DevTools → Network tab
2. Set network to "Offline"
3. Try to check an item
4. Wait for auto-save attempt

**Expected Results**:
- [ ] "Saving..." indicator appears
- [ ] Save fails (network error)
- [ ] Error toast: "Failed to save checklist status"
- [ ] Checkbox remains checked (optimistic UI)
- [ ] Error logged to console
- [ ] User notified clearly

**Recovery**:
- [ ] Go back online
- [ ] Click "Save Now"
- [ ] Should save successfully

---

### Test 3.9: Authorization - Operations Cannot Manage Templates ✅
**AC**: AC1-4, AC7
**Priority**: P0

**Steps**:
1. As Operations user
2. Try to access Settings → Checklist Templates
3. Try direct URL: `/settings/checklist-templates`

**Expected Results**:
- [ ] Settings menu: "Checklist Templates" option NOT visible
- [ ] Direct URL: 403 Forbidden or redirect to dashboard
- [ ] Error message: "You don't have permission to access this page"
- [ ] Operations can ONLY execute checklists, not manage templates

---

### Test 3.10: Readonly Mode - Completed Checklist ✅
**AC**: AC7, AC9
**Priority**: P1

**Steps**:
1. Complete all checklist items (100%)
2. Mark job as "COMPLETED" status
3. Try to toggle checkboxes

**Expected Results**:
- [ ] Checkboxes disabled (readonly mode)
- [ ] Message: "View only - Contact admin to update checklist"
- [ ] "Save Now" button hidden
- [ ] Progress shows 100%
- [ ] Green "Completed" badge visible
- [ ] Completion date/time shown

---

## GROUP 4: Mobile Responsive Design

### Test 4.1: Template List on Mobile ✅
**Device**: iPhone Safari, Android Chrome
**Priority**: P1

**Steps**:
1. Login as Admin on mobile device
2. Navigate to Checklist Templates
3. Try all CRUD operations

**Expected Results**:
- [ ] Page layout responsive (no horizontal scroll)
- [ ] Template cards stack vertically
- [ ] Buttons sized for touch (min 44px)
- [ ] Forms usable on small screen
- [ ] Filters/search accessible
- [ ] No text truncation issues

---

### Test 4.2: Checklist Execution on Mobile ✅
**Device**: iPhone Safari, Android Chrome
**Priority**: P0

**Steps**:
1. Login as Operations on mobile
2. Open job with checklist
3. Execute checklist (check items)
4. Test auto-save
5. Test manual save

**Expected Results**:
- [ ] Checklist items readable (font size adequate)
- [ ] Checkboxes large enough to tap (min 44px)
- [ ] Progress bar visible
- [ ] Toast notifications appear
- [ ] Auto-save works on mobile
- [ ] No layout issues
- [ ] Smooth scrolling

---

### Test 4.3: Touch Interactions ✅
**Device**: iPhone/iPad, Android
**Priority**: P1

**Steps**:
1. Test all interactive elements:
   - Checkboxes
   - Buttons
   - Dropdowns
   - Search box
2. Test gestures:
   - Tap
   - Long press
   - Scroll

**Expected Results**:
- [ ] All elements respond to touch
- [ ] No accidental clicks
- [ ] Touch targets properly sized
- [ ] Gestures work smoothly
- [ ] No delay in response

---

## GROUP 5: Cross-Browser Compatibility

### Test 5.1: Chrome/Edge (Desktop) ✅
**Priority**: P0

**Steps**:
1. Run Tests 1.1-3.10 in Chrome
2. Run Tests 1.1-3.10 in Edge

**Expected Results**:
- [ ] All features work identically
- [ ] UI renders correctly
- [ ] No JavaScript errors
- [ ] Auto-save works
- [ ] Forms functional

---

### Test 5.2: Firefox (Desktop) ✅
**Priority**: P1

**Steps**:
1. Run Tests 1.1-3.10 in Firefox
2. Pay attention to fetch API, localStorage

**Expected Results**:
- [ ] All features work
- [ ] No Firefox-specific issues
- [ ] UI consistent with Chrome
- [ ] Auto-save works
- [ ] No console errors

---

### Test 5.3: Safari (macOS) ✅
**Priority**: P1

**Steps**:
1. Run Tests 1.1-3.10 in Safari
2. Test auto-save timing specifically

**Expected Results**:
- [ ] All features work
- [ ] Safari-specific CSS renders correctly
- [ ] fetch API works
- [ ] Auto-save timing correct
- [ ] No webkit-specific issues

---

### Test 5.4: iOS Safari (iPhone) ✅
**Priority**: P0

**Steps**:
1. Run mobile tests (Group 4)
2. Test auto-save on iOS specifically

**Expected Results**:
- [ ] All features work on iOS
- [ ] Auto-save works correctly
- [ ] Touch events work
- [ ] No iOS-specific bugs

---

### Test 5.5: Android Chrome ✅
**Priority**: P0

**Steps**:
1. Run mobile tests (Group 4)
2. Test on Samsung/Pixel devices

**Expected Results**:
- [ ] All features work on Android
- [ ] Performance acceptable
- [ ] Touch interactions smooth
- [ ] No Android-specific issues

---

## GROUP 6: Performance Testing

### Test 6.1: Template List Load Time ✅
**Priority**: P1

**Steps**:
1. Navigate to template list with 10+ templates
2. Measure page load time

**Expected Results**:
- [ ] Page loads < 2 seconds
- [ ] No noticeable lag
- [ ] Smooth scrolling
- [ ] Filters/search responsive

---

### Test 6.2: Checklist Auto-Save Performance ✅
**Priority**: P0

**Steps**:
1. Check item
2. Measure time from click to "All changes saved"

**Expected Results**:
- [ ] Total time < 1.5 seconds (1s debounce + 0.5s API)
- [ ] No UI freezing
- [ ] Smooth animation
- [ ] Consistent timing

---

### Test 6.3: Rapid Interactions - No Memory Leaks ✅
**Priority**: P1

**Steps**:
1. Open DevTools → Performance
2. Toggle checkboxes 50+ times rapidly
3. Check memory usage

**Expected Results**:
- [ ] Memory usage stable (no leaks)
- [ ] No performance degradation
- [ ] AbortController cleans up properly
- [ ] No zombie timers

---

## 📊 Test Results Summary

### Overall Statistics

**Total Tests**: _____ / 45
**Pass**: _____
**Fail**: _____
**Blocked**: _____
**Skipped**: _____

### Pass Rate

- **P0 Tests**: _____ %
- **P1 Tests**: _____ %
- **Overall**: _____ %

### Acceptance Criteria Results

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC1 | Create templates | [ ] PASS / [ ] FAIL | |
| AC2 | List/filter templates | [ ] PASS / [ ] FAIL | |
| AC3 | Edit templates | [ ] PASS / [ ] FAIL | |
| AC4 | Delete templates | [ ] PASS / [ ] FAIL | |
| AC5 | Attach to job | [ ] PASS / [ ] FAIL | |
| AC6 | Service type validation | [ ] PASS / [ ] FAIL | |
| AC7 | Operations view | [ ] PASS / [ ] FAIL | |
| AC8 | Update status | [ ] PASS / [ ] FAIL | |
| AC9 | Progress tracking | [ ] PASS / [ ] FAIL | |

---

## 🐛 Bug Report Template

When you find a bug, document it like this:

### Bug #001: [Short Title]

**Severity**: Critical / High / Medium / Low
**Priority**: P0 / P1 / P2
**Test Case**: [Test number, e.g., Test 1.2]
**AC**: [e.g., AC1]

**Environment**:
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Device: [e.g., Desktop]

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Videos**:
[Attach evidence]

**Console Errors**:
```
[Paste any console errors]
```

**Workaround** (if any):
[How to work around this issue]

---

## ✅ Sign-off

### QA Approval

**Tested By**: _____________________
**Date**: _____________________
**Test Duration**: _____ hours

**Result**: [ ] PASS / [ ] FAIL / [ ] PASS WITH ISSUES

**Comments**:
_____________________________________________________________________
_____________________________________________________________________

### Recommendation

[ ] **APPROVED FOR PRODUCTION** - No critical issues found
[ ] **APPROVED WITH MINOR ISSUES** - Non-blocking bugs, can be fixed in next release
[ ] **NOT APPROVED** - Critical bugs found, must be fixed before production

**Signature**: _____________________
**Date**: _____________________

---

## 📁 Attachments

- [ ] Test execution screenshots
- [ ] Bug reports (if any)
- [ ] Performance metrics
- [ ] Browser compatibility matrix
- [ ] Mobile device testing photos/videos

---

**Document Version**: 1.0
**Last Updated**: 2025-09-30
**Owner**: QA Team