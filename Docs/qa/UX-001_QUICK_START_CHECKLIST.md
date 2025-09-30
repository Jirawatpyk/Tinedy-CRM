# ⚡ UX-001: Quick Start Testing Checklist
## 30-Minute Smoke Test for Story 2.5

**Purpose**: Fast validation of critical paths before comprehensive testing
**Duration**: 30 minutes
**When to Use**: First deployment to staging

---

## 🚀 Pre-Test Setup (5 minutes)

### 1. Verify Staging Environment
```bash
# Check staging is live
curl -I https://[staging-url]

# Should return: HTTP 200 OK
```

### 2. Login Credentials Ready
- [ ] Admin: `admin@tinedy.com` / [password]
- [ ] Operations: `operations@tinedy.com` / [password]

### 3. Test Data Ready
- [ ] At least 1 CLEANING job exists
- [ ] At least 1 PLUMBING job exists

---

## ✅ Critical Path Tests (25 minutes)

### Path 1: Admin Creates Template (5 min)

**Steps**:
1. Login as Admin
2. Go to Settings → Checklist Templates
3. Click "Create New Template"
4. Fill:
   - Name: "Test Template - CLEANING"
   - Service: CLEANING
   - Items: Add 3 items
5. Save

**PASS Criteria**:
- [ ] Template saves successfully
- [ ] Appears in list
- [ ] Can see 3 items

**If FAIL**: ❌ Stop testing, report bug

---

### Path 2: Admin Attaches to Job (3 min)

**Steps**:
1. Go to Jobs → Select CLEANING job
2. Click "Attach Checklist Template"
3. Select "Test Template - CLEANING"
4. Attach

**PASS Criteria**:
- [ ] Template selector shows only CLEANING templates
- [ ] Template attaches successfully
- [ ] Checklist appears with 3 unchecked items
- [ ] Progress: 0/3 (0%)

**If FAIL**: ❌ Stop testing, report bug

---

### Path 3: Operations Executes Checklist (7 min)

**Steps**:
1. Logout, login as Operations
2. Go to same job
3. Check first item
4. Wait 2 seconds (observe auto-save)
5. Check second item
6. Refresh page
7. Verify state persisted

**PASS Criteria**:
- [ ] Can check items
- [ ] "Changes pending..." appears
- [ ] "Saving..." appears after 1 second
- [ ] "All changes saved" appears
- [ ] Toast notification shows
- [ ] Progress updates: 2/3 (67%)
- [ ] After refresh: State persisted

**If FAIL**: ❌ Stop testing, report bug

---

### Path 4: Mobile Quick Check (5 min)

**Steps**:
1. Open staging on mobile device
2. Login as Operations
3. Open job with checklist
4. Try to check one item

**PASS Criteria**:
- [ ] Page renders on mobile
- [ ] Checkbox is tappable
- [ ] Auto-save works

**If FAIL**: ⚠️ Note issue, continue testing

---

### Path 5: Complete Checklist (5 min)

**Steps**:
1. As Operations, check remaining item
2. Verify progress: 3/3 (100%)
3. Verify "Completed" badge appears

**PASS Criteria**:
- [ ] Progress: 3/3 (100%)
- [ ] Green "Completed" badge visible
- [ ] Completion timestamp set

**If FAIL**: ❌ Stop testing, report bug

---

## 📊 Quick Test Results

### Overall Status

**All Critical Paths**: [ ] PASS / [ ] FAIL

**Critical Bugs Found**: _____ (If > 0, DO NOT PROCEED to full testing)

### Next Steps

**If ALL PASS** ✅:
- Proceed to comprehensive testing
- Use full guide: `UX-001_MANUAL_TESTING_GUIDE.md`
- Estimated time: 6-8 hours

**If ANY FAIL** ❌:
- Stop testing immediately
- Report bugs to dev team
- Wait for fixes
- Re-run this quick test

---

## 🐛 Quick Bug Report

**Bug Found?** Use this template:

```
BUG: [Short description]
Test: [Path number]
Severity: Critical
Steps:
1.
2.
Expected: [what should happen]
Actual: [what happened]
Screenshot: [attach]
```

---

## ✅ Sign-off

**Tester**: _____________________
**Date**: _____________________
**Duration**: _____ minutes
**Result**: [ ] PASS / [ ] FAIL

**Ready for Full Testing?**: [ ] YES / [ ] NO

---

**Next Document**: `UX-001_MANUAL_TESTING_GUIDE.md` (45 test scenarios)