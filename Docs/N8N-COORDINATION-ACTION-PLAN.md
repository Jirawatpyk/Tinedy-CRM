# N8N Webhook Coordination Action Plan

**Priority**: 🔴 **P0 - CRITICAL BLOCKER**
**Owner**: Sarah (Product Owner)
**Created**: 2025-09-30
**Due Date**: 3 days before Epic 4 Sprint Start

---

## 🎯 Objective

Confirm and finalize the N8N webhook payload structure for Story 4.1 (N8N Webhook Integration) to ensure seamless integration between LINE OA bookings and Tinedy CRM.

**Risk if not completed**: Epic 4 Story 4.1 cannot proceed → Sprint blocked

---

## 📋 Action Items

### 1. Initial Contact with N8N Team
**Owner**: Sarah (PO)
**Deadline**: ASAP (before Epic 2 completion)

- [ ] Identify N8N team contact person
- [ ] Schedule coordination meeting
- [ ] Share Story 4.1 requirements document
- [ ] Explain webhook endpoint expectations

**Context to Share**:
- Tinedy CRM will receive booking data from LINE OA via N8N
- Need to auto-create Customer + Job records
- Endpoint: `POST /api/webhook/n8n/new-job`
- Security: API Key authentication required

---

### 2. Webhook Payload Confirmation
**Owner**: N8N Team + Sarah (PO)
**Deadline**: 3 days before Epic 4 sprint

#### Required Information from N8N:

**A. Payload Structure** (JSON format)
```json
{
  "idempotencyKey": "string", // Required - for duplicate prevention
  "customer": {
    "name": "string",          // Required
    "phone": "string",         // Required - Thai format 0812345678
    "email": "string",         // Optional
    "address": "string",       // Optional
    "contactChannel": "LINE"   // Required - enum: LINE, PHONE, EMAIL, WALK_IN
  },
  "job": {
    "serviceType": "string",   // Required - enum: CLEANING, TRAINING
    "scheduledDate": "ISO8601", // Required - ISO 8601 datetime
    "price": number,           // Required - decimal
    "notes": "string"          // Optional
  }
}
```

**B. Validation Questions**:
- [ ] Are all required fields available from LINE OA workflow?
- [ ] What is the idempotency key format? (e.g., `LINE-{userId}-{timestamp}`)
- [ ] Is phone number always Thai format (0812345678)?
- [ ] What date/time format is used? (Prefer ISO 8601)
- [ ] What happens if customer email is not provided?
- [ ] How is service type determined from LINE OA messages?

**C. Error Handling**:
- [ ] What HTTP status codes should CRM return?
  - 200: Success (customer + job created)
  - 400: Bad request (validation failed)
  - 401: Unauthorized (invalid API key)
  - 409: Conflict (duplicate idempotencyKey)
  - 500: Server error
- [ ] Does N8N retry on failure? How many times?
- [ ] Should CRM send error details in response body?

**D. Security**:
- [ ] Confirm API Key authentication method
- [ ] Will API Key be in header? `Authorization: Bearer {API_KEY}`
- [ ] Who generates the API Key? (CRM or N8N team)
- [ ] How to securely share the API Key?

---

### 3. Test Environment Setup
**Owner**: N8N Team + DevOps
**Deadline**: Before Epic 4 sprint start

- [ ] N8N provides test webhook endpoint URL
- [ ] CRM creates staging webhook endpoint
- [ ] Test API Key generated and shared securely
- [ ] Run 10 test webhook calls with sample payloads
- [ ] Verify:
  - ✅ Customer created successfully
  - ✅ Job created and linked to customer
  - ✅ Idempotency works (duplicate requests handled)
  - ✅ Error responses properly formatted
  - ✅ Logs captured in WebhookLog table

---

### 4. API Contract Documentation
**Owner**: Sarah (PO) + Technical Writer
**Deadline**: Before Epic 4 sprint start

Create formal API contract document:
- [ ] Endpoint specification (URL, method, headers)
- [ ] Request payload schema (JSON with examples)
- [ ] Response payload schema (success + error cases)
- [ ] Authentication requirements
- [ ] Rate limiting specifications (100 req/min)
- [ ] Error codes and descriptions
- [ ] Retry policy
- [ ] Idempotency behavior

**Template**: Use OpenAPI 3.0 specification format

---

### 5. Sprint Readiness Checklist
**Owner**: Bob (Scrum Master)
**Deadline**: Sprint Planning Meeting

Before Epic 4 Story 4.1 can start:
- [ ] ✅ N8N webhook payload structure confirmed
- [ ] ✅ API contract document signed off by N8N team
- [ ] ✅ Test environment available
- [ ] ✅ API Key generated and shared securely
- [ ] ✅ Sample webhook payloads provided (minimum 5 examples)
- [ ] ✅ Error scenarios documented
- [ ] ✅ Retry policy agreed upon

**If any item is NOT checked**: Story 4.1 is BLOCKED → Cannot start Epic 4

---

## 📞 Communication Plan

### Meeting Schedule
1. **Initial Kickoff Meeting** (1 hour)
   - Attendees: Sarah (PO), N8N Team Lead, Backend Dev
   - Agenda: Review requirements, discuss payload structure
   - Outcome: Draft payload structure

2. **Technical Deep Dive** (2 hours)
   - Attendees: Backend Dev, N8N Developer, DevOps
   - Agenda: Finalize API contract, test environment setup
   - Outcome: API contract document v1.0

3. **Test & Validation** (1 hour)
   - Attendees: Backend Dev, N8N Developer, QA
   - Agenda: Run test scenarios, verify responses
   - Outcome: Test report with pass/fail results

### Communication Channels
- **Primary**: Email thread (include all stakeholders)
- **Quick Questions**: Slack/LINE group chat
- **Urgent Issues**: Phone call to N8N Team Lead

---

## 📊 Success Criteria

Epic 4 Story 4.1 is **unblocked** when:
1. ✅ N8N webhook payload structure is documented and agreed upon
2. ✅ API contract signed off by both teams
3. ✅ Test environment successfully sends 10 test webhooks
4. ✅ All 10 test webhooks processed correctly by CRM
5. ✅ Error handling verified (invalid payload, duplicate key)
6. ✅ Performance acceptable (response time < 500ms)
7. ✅ API Key authentication working

---

## ⚠️ Risks & Mitigation

### Risk 1: N8N Team Not Available
**Impact**: High - Story 4.1 blocked
**Mitigation**:
- Start coordination early (now, not 3 days before sprint)
- Escalate to management if no response in 2 days
- Fallback: Use mock N8N endpoint for development

### Risk 2: Payload Structure Incompatible
**Impact**: Medium - Requires CRM schema changes
**Mitigation**:
- Share CRM data models early with N8N team
- Be flexible with field names/formats
- Use data transformation layer if needed

### Risk 3: Test Environment Delays
**Impact**: Medium - Cannot validate before sprint
**Mitigation**:
- Create mock N8N webhook in CRM for local testing
- Use Postman collection with sample payloads
- DevOps priority: Test env setup ASAP

---

## 📝 Related Documents

- [Epic 4 Automation & Integration.md](./Epic%204%20Automation%20&%20Integration.md)
- [Story 4.1: N8N Webhook Integration](./stories/4.1.n8n-webhook-integration.md)
- [PROJECT-ROADMAP.md](./PROJECT-ROADMAP.md) - Epic 4 section

---

## 📈 Progress Tracking

| Action Item | Owner | Status | Completion Date |
|-------------|-------|--------|-----------------|
| 1. Contact N8N Team | Sarah | ⏳ Pending | - |
| 2. Draft Payload Structure | N8N + Sarah | ⏳ Pending | - |
| 3. API Contract v1.0 | Sarah + Tech Writer | ⏳ Pending | - |
| 4. Test Environment Setup | N8N + DevOps | ⏳ Pending | - |
| 5. Test Validation (10 calls) | QA + Backend Dev | ⏳ Pending | - |
| 6. API Contract Sign-off | Sarah + N8N Lead | ⏳ Pending | - |
| 7. Sprint Readiness Check | Bob (SM) | ⏳ Pending | - |

**Overall Status**: 🔴 **NOT STARTED - URGENT ACTION REQUIRED**

---

## 🎯 Next Steps (Immediate)

**Sarah (PO) to do NOW**:
1. Identify N8N team contact → Send email with meeting request
2. Attach Story 4.1 document → Explain webhook requirements
3. Propose meeting dates → This week if possible
4. Flag this as P0 blocker → Escalate if no response in 48 hours

**Target**: Have first meeting scheduled within 3 days

---

**Last Updated**: 2025-09-30 by Sarah (Product Owner)
**Next Review**: Every 2 days until resolved