# **Epic 4: ระบบอัตโนมัติและการเชื่อมต่อ (Automation & Integration)**

<!-- Powered by BMAD™ Core -->

## **สถานะ Epic (Epic Status)**
⏳ **READY FOR SPRINT** - Reviewed และปรับปรุงตาม SM recommendations

**Last Updated**: 2025-09-30 by Sarah (Product Owner)
**Scrum Master Review**: ✅ Approved with conditions (Score: 82/100 → 90/100 after actions)

---

## **ภาพรวม Epic (Epic Overview)**

### **เป้าหมายหลัก (Primary Goals)**
พัฒนาระบบอัตโนมัติและการเชื่อมต่อภายนอกเพื่อลดภาระงาน Manual และเพิ่มประสิทธิภาพการทำงาน โดยเน้นการรับงานใหม่จาก N8N อัตโนมัติ การ sync ข้อมูลกับระบบภายนอก และการแจ้งเตือนอัตโนมัติ

### **คำอธิบาย Epic (Epic Description)**
Epic นี้เน้นการสร้างความเชื่อมโยงระหว่าง Tinedy CRM กับระบบภายนอก โดยเฉพาะ N8N automation workflows และ LINE Official Account เพื่อให้ข้อมูลการจองจากลูกค้าไหลเข้าสู่ระบบ CRM โดยอัตโนมัติ รวมถึงการเพิ่ม notification system สำหรับแจ้งเตือนเหตุการณ์สำคัญ

### **ผู้มีส่วนได้ส่วนเสีย (Stakeholders)**
- **Admin**: ผู้ตั้งค่าและตรวจสอบการเชื่อมต่อ
- **N8N System**: ระบบส่งข้อมูลการจองอัตโนมัติ
- **Operations Team**: ผู้รับประโยชน์จากการแจ้งเตือนและงานอัตโนมัติ
- **ทีมทั้งหมด**: ได้รับ notifications สำหรับเหตุการณ์สำคัญ

---

## **Important Note: Quality Control Features**

### ✅ **Quality Control Already Implemented in Epic 2**

**Epic 2 Story 2.5** ได้ครอบคลุมฟีเจอร์ Quality Control แล้ว 100%:
- ✅ Checklist Template Management (Story 2.5)
- ✅ Attach Checklist to Jobs (Story 2.5)
- ✅ Operations Team Checklist Execution (Story 2.5)
- ✅ Real-time Progress Tracking (Story 2.5)

**Epic 4 จึงมุ่งเน้น Automation & Integration เท่านั้น** ไม่รวม Quality Control

**Reference**: `docs/stories/2.5.quality-control-checklist-management.md`

---

## **คุณค่าทางธุรกิจ (Business Value)**

### **ประโยชน์โดยตรง (Direct Benefits)**
1. **ลดเวลาการทำงาน Manual 70%**: งานจาก LINE OA เข้าสู่ระบบอัตโนมัติ
2. **ลดข้อผิดพลาด 80%**: ข้อมูลถูก sync โดยตรงจาก source
3. **เพิ่มความเร็วในการตอบสนอง 50%**: แจ้งเตือนทันทีเมื่อมีงานใหม่
4. **รองรับ Scalability**: รองรับการจองพร้อมกันได้มากขึ้น

### **ROI Analysis**
- **ประหยัดต้นทุน**: 20-25 ชั่วโมง/สัปดาห์ จากการลด Manual data entry
- **เพิ่มรายได้**: รองรับ booking ได้มากขึ้น 40% ด้วยระบบอัตโนมัติ
- **ลดความสูญเสีย**: ลดการพลาดการจอง 95%

---

## **ฟีเจอร์หลัก (Key Features)**

### **1. N8N Webhook Integration** 🎯
- **Secure Webhook Endpoint**: รับข้อมูลจาก N8N อย่างปลอดภัย
- **Auto Job Creation**: สร้างงานใหม่อัตโนมัติจากข้อมูล LINE OA
- **Customer Auto-creation**: สร้างลูกค้าใหม่ถ้ายังไม่มีในระบบ
- **Data Validation**: ตรวจสอบความถูกต้องของข้อมูลก่อนสร้างงาน
- **Error Handling**: จัดการกับข้อผิดพลาดและ retry mechanism

### **2. Notification System** 🔔
- **Job Assignment Notifications**: แจ้งเตือนเมื่อได้รับมอบหมายงาน
- **Job Status Updates**: แจ้งเตือนเมื่อสถานะงานเปลี่ยน
- **Checklist Completion**: แจ้งเตือนเมื่อทำ checklist ครบ
- **Overdue Alerts**: แจ้งเตือนงานที่เลยกำหนด

### **3. Integration Monitoring** 📊
- **Webhook Health Check**: ตรวจสอบสถานะการเชื่อมต่อ N8N
- **Integration Logs**: บันทึกการรับส่งข้อมูลทั้งหมด
- **Error Tracking**: ติดตามและแจ้งเตือนข้อผิดพลาด
- **Success Metrics**: Dashboard สำหรับดูสถิติการ sync

---

## **เกณฑ์วัดความสำเร็จ (Success Metrics)**

### **KPIs หลัก (Primary KPIs)**
1. **Webhook Success Rate**: อัตราความสำเร็จ > 99%
2. **Auto-creation Accuracy**: ความถูกต้องของข้อมูล > 98%
3. **Response Time**: ตอบสนอง webhook < 500ms
4. **Notification Delivery**: แจ้งเตือนสำเร็จ > 99.5%

### **เกณฑ์วัดเชิงคุณภาพ (Quality Metrics)**
- **Data Integrity**: ข้อมูลถูกต้องครบถ้วน 100%
- **Error Recovery**: กู้คืนจากข้อผิดพลาดอัตโนมัติ 90%
- **Integration Uptime**: ระบบทำงาน > 99.9%

---

## **ขอบเขตและข้อกำหนด (Scope & Requirements)**

### **In Scope - สิ่งที่รวมอยู่ใน Epic นี้**
✅ **N8N Webhook Integration**: การรับข้อมูลการจองอัตโนมัติ
✅ **Auto Job & Customer Creation**: สร้างงานและลูกค้าอัตโนมัติ
~~✅ **Notification System**: ระบบแจ้งเตือนพื้นฐาน~~ → **Moved to Backlog**
✅ **Integration Monitoring**: ติดตามสถานะการเชื่อมต่อ
✅ **Error Handling & Logging**: จัดการข้อผิดพลาดและบันทึก
✅ **API Key Authentication**: ความปลอดภัยของ webhook

### **Out of Scope - สิ่งที่ไม่รวมอยู่ใน Epic นี้**
❌ **Quality Control Checklist**: ทำเสร็จแล้วใน Epic 2 Story 2.5 ✅
❌ **Email/SMS Notifications**: จะพัฒนาในอนาคต
❌ **Real-time Sync with LINE OA**: ไม่รองรับในเฟสนี้
❌ **Payment Processing Integration**: นอกขอบเขต
❌ **Advanced Analytics**: จะพัฒนาใน Epic 5

### **Functional Requirements Coverage**
Epic นี้ครอบคลุม PRD:
- **FR5**: Webhook endpoint สำหรับ N8N integration ✅
- **FR11-FR13**: Quality Control - ทำแล้วใน Epic 2 Story 2.5 ✅

---

## **User Stories รวม (Included User Stories)**

### **Story 4.1: N8N Webhook Integration for Auto Job Creation** 🎯
**Priority**: 🔴 **Critical**
**Complexity**: ⚠️ **High**
**Duration**: **7-8 days** (Revised from 5 days per SM review)

**As a** System,
**I want** to have a secure webhook endpoint that N8N can call,
**so that** new bookings from LINE OA can be automatically created as jobs in the CRM without manual data entry.

**Acceptance Criteria:**
1. Secure webhook endpoint created at `/api/webhook/n8n/new-job`
2. API Key authentication required in request headers
3. Accepts JSON payload with customer and job information
4. Creates new customer if not exists (by phone or email)
5. Creates new job with status "NEW" linked to customer
6. Returns 202 Accepted on success with job ID
7. Returns appropriate error codes (400, 401, 500) with descriptive messages
8. Logs all webhook requests for audit trail
9. Handles duplicate requests gracefully (idempotency)
10. Validates all required fields before processing

**Technical Details:**
- Endpoint: `POST /api/webhook/n8n/new-job`
- Auth: API Key in header `X-API-Key`
- Payload validation: Zod schema
- Database: Prisma transaction for customer + job creation
- Error handling: Try-catch with detailed logging

---

### **Story 4.2: Integration Monitoring Dashboard** 📊
**Priority**: 🟡 **Medium**
**Complexity**: 🟢 **Medium**
**Duration**: 3 days

**As an** Admin,
**I want** to see integration status and logs,
**so that** I can monitor webhook health and troubleshoot issues quickly.

**Acceptance Criteria:**
1. Dashboard page at `/settings/integrations` showing N8N status
2. Display webhook health metrics (success rate, average response time)
3. Show recent webhook requests log (last 100 requests)
4. Filter logs by status (success, error), date range
5. View detailed request/response payload for each log entry
6. Manual webhook health check button
7. Display last successful sync timestamp
8. Show error rate chart (last 24 hours, 7 days, 30 days)
9. Admin-only access with role-based authorization

**Technical Details:**
- Create `WebhookLog` model for audit trail
- API endpoint: `GET /api/integrations/webhook-logs`
- Dashboard charts: Recharts or similar library
- Real-time updates: Optional polling every 30 seconds

---

### **~~Story 4.3: Basic Notification System~~** 📦 **Moved to Product Backlog**

**Status**: ⏸️ **MOVED TO BACKLOG** (Per SM Review 2025-09-30)

**Reason**: This story is a **UX Enhancement**, not Automation/Integration. Better fit for Epic 5 or future UX-focused epic.

**SM Review Findings**:
- Does not contribute to Epic 4's core automation goal
- Low priority (Nice to have) vs Critical/Medium priorities of Stories 4.1-4.2
- Should be bundled with other notification features in a dedicated UX epic

**Documentation**: See `docs/stories/STORY-4.3-MOVED-TO-BACKLOG.md` for complete details

---

## **การพึ่งพาและสมมติฐาน (Dependencies & Assumptions)**

### **ความต้องการด้านเทคนิค (Technical Dependencies)**
1. ✅ **Epic 1 Complete**: Authentication system ready
2. ✅ **Epic 2 Complete**: Customer & Job models exist
3. 🔄 **Epic 2 Stories 2.7-2.9**: User management complete
4. ⏳ **N8N Workflows**: N8N team must provide webhook format
5. ⏳ **API Key Management**: Need secure storage for webhook API keys

### **ความต้องการด้านธุรกิจ (Business Dependencies)**
1. **LINE OA Data Format**: N8N must send consistent JSON structure
2. **Business Rules**: Define logic for duplicate detection
3. **Error Handling SOP**: Process for handling failed webhook requests

### **สมมติฐานหลัก (Key Assumptions)**
- N8N workflows จะส่งข้อมูลในรูปแบบ JSON ที่กำหนด
- มี API Key management system สำหรับ webhook security
- Operations team จะได้รับ notification ผ่าน in-app notifications
- Webhook จะถูกเรียกจาก N8N ภายใน 5 นาทีหลังลูกค้าจอง

---

## **ความเสี่ยงและการบรรเทา (Risks & Mitigation)**

### **ความเสี่ยงระดับสูง (High Risk)**

#### **R1: N8N Downtime หรือ Network Issues**
- **ความเสี่ยง**: N8N อาจล่มหรือ network ขัดข้อง
- **ผลกระทบ**: งานไม่เข้าระบบอัตโนมัติ
- **การบรรเทา**:
  - สร้าง manual entry fallback (ใช้ Story 2.3)
  - Implement retry mechanism กับ exponential backoff
  - Alert system แจ้งเมื่อ webhook fails liên tiếp

#### **R2: Data Format Changes from N8N**
- **ความเสี่ยง**: N8N เปลี่ยน payload format โดยไม่แจ้ง
- **ผลกระทบ**: Webhook validation fails
- **การบรรเทา**:
  - Version webhook endpoint (v1, v2)
  - Comprehensive payload validation with Zod
  - Detailed error logging with payload dump

### **ความเสี่ยงระดับกลาง (Medium Risk)**

#### **R3: High Volume Webhook Calls**
- **ความเสี่ยง**: Webhook ถูกเรียกพร้อมกันจำนวนมาก
- **ผลกระทบ**: ระบบช้าหรือ timeout
- **การบรรเทา**:
  - Implement request queue (Bull/BullMQ)
  - Rate limiting per API key
  - Database connection pooling

#### **R4: Duplicate Job Creation**
- **ความเสี่ยง**: N8N ส่ง webhook ซ้ำ
- **ผลกระทบ**: มีงานซ้ำในระบบ
- **การบรรเทา**:
  - Idempotency key ใน webhook request
  - Check duplicate based on customer + date + service type
  - Unique constraint ใน database

---

## **การประมาณเวลา (Timeline Estimation)**

### **Overview การพัฒนา**
**ระยะเวลารวม**: 2-3 สัปดาห์ (11 วันทำการ)

### **Phase 1: N8N Webhook (1 สัปดาห์)**
- **Day 1-2**: Webhook endpoint development and API key auth
- **Day 3**: Customer auto-creation logic
- **Day 4**: Job auto-creation with validation
- **Day 5**: Testing and error handling

### **Phase 2: Monitoring (3 วัน)**
- **Day 6-7**: Integration dashboard development
- **Day 8**: Webhook logs and metrics

### **Phase 3: Notifications (3 วัน) - Optional**
- **Day 9**: Notification model and API
- **Day 10**: UI components (bell icon, panel)
- **Day 11**: Testing and polish

### **Milestones สำคัญ**
- **End of Week 1**: N8N webhook operational
- **End of Week 2**: Monitoring dashboard complete
- **End of Week 3**: Notifications ready (if included)

### **Resource Requirements**
- **Backend Developer**: 1 คน, 2 สัปดาห์
- **Frontend Developer**: 1 คน, 1 สัปดาห์
- **QA Tester**: 1 คน, 3 วัน
- **DevOps**: 0.5 คน (webhook deployment)

---

## **เกณฑ์การยอมรับ Epic (Epic Acceptance Criteria)**

### **Technical Acceptance**
1. ✅ N8N webhook endpoint ทำงานได้ถูกต้อง
2. ✅ Auto-creation success rate > 98%
3. ✅ Webhook response time < 500ms
4. ✅ API Key authentication working
5. ✅ Comprehensive error logging in place
6. ✅ Integration monitoring dashboard functional
7. ✅ All tests passing (unit + integration + E2E)

### **Business Acceptance**
1. ✅ Jobs from LINE OA automatically appear in CRM
2. ✅ No manual data entry required for LINE bookings
3. ✅ Admin can monitor webhook status easily
4. ✅ Errors are logged and trackable
5. ✅ Operations team receives notifications (if included)

### **User Experience Acceptance**
1. ✅ Zero additional steps for operations team
2. ✅ Admin dashboard is intuitive
3. ✅ Error messages are clear and actionable
4. ✅ System feels faster with automation

---

## **ผลกระทบต่อระบบปัจจุบัน (System Impact)**

### **การเปลี่ยนแปลงระบบ (System Changes)**
- **API**: เพิ่ม webhook endpoints ใหม่
- **Database**: เพิ่ม WebhookLog model (optional Notification model)
- **Environment Variables**: เพิ่ม N8N_WEBHOOK_API_KEY
- **Security**: ต้องจัดการ API key securely

### **ผลกระทบต่อผู้ใช้ (User Impact)**
- **Admin**: เครื่องมือใหม่สำหรับตรวจสอบ integration
- **Operations**: รับงานใหม่อัตโนมัติ (ไม่ต้องรอ Admin สร้าง)
- **ลูกค้า**: ประสบการณ์ดีขึ้น (ตอบสนองเร็วขึ้น)

---

## **การปรับใช้และการฝึกอบรม (Deployment & Training)**

### **แผนการปรับใช้ (Deployment Plan)**
1. **Staging Test**: ทดสอบ webhook กับ N8N staging
2. **API Key Setup**: สร้าง production API key
3. **Soft Launch**: เปิด webhook ให้ N8N production
4. **Monitoring**: ติดตามการทำงาน 24-48 ชั่วโมงแรก
5. **Full Rollout**: ใช้งานเต็มรูปแบบ

### **การฝึกอบรม (Training Requirements)**
- **Admin Training**: 1 ชั่วโมง - การใช้ monitoring dashboard
- **Operations**: ไม่ต้องฝึกอบรม (automatic)

### **เอกสารสนับสนุน (Support Documentation)**
- Webhook API documentation
- Integration monitoring guide
- Troubleshooting guide for common webhook errors

---

## **การติดตามและประเมินผล (Monitoring & Evaluation)**

### **Metrics Dashboard**
- Webhook success/failure rates
- Average response time
- Job creation count (auto vs manual)
- Error types and frequency

### **Post-Launch Review**
- ประเมินผลหลังเปิดใช้ 1 สัปดาห์
- วิเคราะห์ metrics และ error logs
- รวบรวม feedback จาก operations team
- วางแผนปรับปรุง (ถ้ามี issues)

---

## **บันทึกการเปลี่ยนแปลง (Change Log)**

| วันที่ | เวอร์ชัน | คำอธิบาย | ผู้เขียน |
|--------|----------|----------|---------|
| 2025-09-30 | 2.0 | ปรับปรุง Epic 4 - ลบ Stories 4.2, 4.3 ที่ซ้ำกับ Epic 2 Story 2.5 | Sarah (Product Owner) |
| 2025-09-30 | 2.0 | เน้น Automation & Integration เท่านั้น | Sarah (Product Owner) |
| 2025-09-30 | 2.0 | เพิ่ม Integration Monitoring และ Notification System | Sarah (Product Owner) |
| 2025-09-28 | 1.0 | Epic 4 เดิม (รวม Checklist management) | John (PM) |

---

## **การอนุมัติ Epic (Epic Approval)**

### **ผู้อนุมัติ (Approvers)**
- ⏳ **Product Owner**: Sarah - [รอการอนุมัติ]
- ⏳ **Technical Lead**: [รอการอนุมัติ]
- ⏳ **Business Stakeholder**: [รอการอนุมัติ]
- ⏳ **N8N Integration Team**: [รอยืนยัน webhook format]

### **เงื่อนไขการอนุมัติ (Approval Conditions)**
1. ✅ Epic 2 Stories 2.7-2.9 เสร็จสิ้น
2. ✅ N8N team ยืนยัน webhook payload format
3. ✅ API key management strategy อนุมัติแล้ว
4. ✅ Risk mitigation plans ยอมรับได้

---

## **Summary: Epic 4 Revised Scope**

### ✅ **What's Included**
1. ✅ **Story 4.1**: N8N Webhook Integration (7-8 days) - 🔴 Critical
2. ✅ **Story 4.2**: Integration Monitoring Dashboard (3-4 days) - 🟡 Medium

**Total**: 10-12 days (2-3 weeks)

### ❌ **What's Removed (Already in Epic 2 Story 2.5)**
- ❌ Checklist Template Management → Epic 2 Story 2.5 ✅
- ❌ Attach and Use Checklist in Job → Epic 2 Story 2.5 ✅

### 🎯 **Focus**
Epic 4 มุ่งเน้น **Automation & Integration** เพื่อลดงาน Manual และเชื่อมต่อกับระบบภายนอก

---

**Epic 4** เป็นเสาหลักสำคัญของ automation ที่จะเปลี่ยน Tinedy CRM จากระบบ Manual เป็นระบบอัตโนมัติที่เชื่อมต่อกับ LINE OA seamlessly ผ่าน N8N workflows! 🚀