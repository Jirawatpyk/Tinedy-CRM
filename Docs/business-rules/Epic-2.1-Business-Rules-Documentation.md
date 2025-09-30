# **Business Rules Documentation: Epic 2.1 - Admin Job Booking Management**

<!-- Powered by BMAD™ Core - Business Analysis Documentation -->

## **สถานะเอกสาร (Document Status)**
✅ **APPROVED** - พร้อมใช้สำหรับการพัฒนา

**เวอร์ชัน**: 1.0
**วันที่สร้าง**: 28 กันยายน 2025
**ผู้เขียน**: Morgan (Business Analyst)
**ผู้อนุมัติ**: [รอการอนุมัติ]

---

## **Table of Contents**

1. [ภาพรวมและวัตถุประสงค์](#overview)
2. [Job Creation Business Rules](#job-creation-rules)
3. [Assignment Logic Rules](#assignment-rules)
4. [Status Transition Rules](#status-transition-rules)
5. [Service Type Specific Rules](#service-type-rules)
6. [N8N Integration Business Rules](#n8n-integration-rules)
7. [User Permission Rules](#user-permission-rules)
8. [Data Integrity Rules](#data-integrity-rules)
9. [Workflow Automation Rules](#workflow-automation-rules)
10. [Error Handling and Edge Cases](#error-handling)
11. [Business Rule Validation Matrix](#validation-matrix)

---

## **1. ภาพรวมและวัตถุประสงค์** {#overview}

### **วัตถุประสงค์หลัก**
เอกสารนี้กำหนดกฎทางธุรกิจ (Business Rules) ที่ครอบคลุมสำหรับ Epic 2.1: Admin Job Booking Management เพื่อให้ทีมพัฒนาสามารถใช้เป็นแนวทางในการพัฒนาระบบที่สอดคล้องกับความต้องการทางธุรกิจและลดความคลุมเครือในการดำเนินงาน

### **ขอบเขตการใช้งาน**
- การสร้างและจัดการงาน (Job Management)
- การมอบหมายงานให้ทีมปฏิบัติการ (Job Assignment)
- การอัปเดตสถานะงาน (Status Management)
- การรับข้อมูลจาก N8N Integration
- การจัดการสิทธิ์ผู้ใช้งาน (Role-Based Access Control)

### **หลักการสำคัญ**
1. **Data Integrity**: ข้อมูลต้องถูกต้องและสมบูรณ์ตลอดเวลา
2. **Business Process Consistency**: กระบวนการต้องสอดคล้องกับการทำงานจริง
3. **User Experience**: กฎต้องรองรับการใช้งานที่สะดวกและมีประสิทธิภาพ
4. **Scalability**: กฎต้องรองรับการขยายระบบในอนาคต
5. **Security**: การจัดการสิทธิ์และความปลอดภัยข้อมูล

---

## **2. Job Creation Business Rules** {#job-creation-rules}

### **BR-JC-001: Job Creation Validation Rules**

#### **Mandatory Fields (ฟิลด์บังคับ)**
```typescript
interface JobCreationRules {
  customerId: string;        // บังคับ - ต้องมีลูกค้าที่มีอยู่จริง
  serviceType: ServiceType;  // บังคับ - CLEANING หรือ TRAINING
  scheduledAt: DateTime;     // บังคับ - วันที่นัดหมาย
  price: Decimal;           // บังคับ - ราคาต้อง > 0
}
```

#### **Business Validation Logic**
1. **Customer Validation**
   - Customer ID ต้องมีอยู่ในระบบและสถานะ ACTIVE
   - ถ้า Customer สถานะ INACTIVE หรือ BLOCKED ให้แสดง warning และขอยืนยัน
   - Edge Case: ถ้า Customer ถูกลบหลังจากเลือกแล้ว ให้แสดง error และไม่อนุญาตให้สร้างงาน

2. **Schedule Date Validation**
   - วันที่นัดหมายต้องไม่เป็นอดีต (เว้นแต่ Admin จะ override)
   - ไม่สามารถนัดหมายในวันที่ระบบปิดบริการ (วันหยุดนักขัตฤกษ์)
   - ต้องไม่เกิน 365 วันจากวันปัจจุบัน

   ```typescript
   // Business Rule Implementation
   const validateScheduleDate = (scheduledAt: Date): ValidationResult => {
     const now = new Date();
     const maxFutureDate = new Date();
     maxFutureDate.setDate(now.getDate() + 365);

     if (scheduledAt < now && !isAdminOverride) {
       return { valid: false, message: "ไม่สามารถนัดหมายในอดีตได้" };
     }

     if (scheduledAt > maxFutureDate) {
       return { valid: false, message: "ไม่สามารถนัดหมายเกิน 365 วันได้" };
     }

     if (isHoliday(scheduledAt)) {
       return { valid: false, message: "ไม่สามารถนัดหมายในวันหยุดได้" };
     }

     return { valid: true };
   };
   ```

3. **Price Validation**
   - ราคาต้องเป็นจำนวนบวก > 0
   - ราคาไม่เกิน 999,999.99 บาท
   - สำหรับ CLEANING: ราคาขั้นต่ำ 500 บาท
   - สำหรับ TRAINING: ราคาขั้นต่ำ 2,000 บาท

### **BR-JC-002: Default Values Assignment**

#### **Auto-Generated Fields**
- **ID**: Auto-generate โดยใช้ cuid()
- **Status**: Default = "NEW"
- **Priority**: Default = "MEDIUM"
- **createdAt**: Current timestamp
- **updatedAt**: Current timestamp

#### **Conditional Defaults**
```typescript
const setDefaultValues = (jobData: Partial<Job>): Job => {
  return {
    ...jobData,
    status: JobStatus.NEW,
    priority: jobData.priority || Priority.MEDIUM,
    notes: jobData.notes || "",
    description: jobData.description || generateDefaultDescription(jobData.serviceType),
    assignedToId: null, // งานใหม่ยังไม่ได้รับมอบหมาย
  };
};

const generateDefaultDescription = (serviceType: ServiceType): string => {
  switch (serviceType) {
    case ServiceType.CLEANING:
      return "งานทำความสะอาด - รอการประเมินรายละเอียด";
    case ServiceType.TRAINING:
      return "งานฝึกอบรม - รอการกำหนดหลักสูตร";
    default:
      return "งานทั่วไป - รอการกำหนดรายละเอียด";
  }
};
```

### **BR-JC-003: Business Constraints**

#### **Duplicate Prevention**
- ไม่อนุญาตให้ลูกค้าเดียวกันมีงานประเภทเดียวกันในวันเดียวกันมากกว่า 1 งาน
- Exception: TRAINING อนุญาตให้มีหลายงานในวันเดียวกันได้ (หลายหลักสูตร)

```sql
-- Database Constraint Check
SELECT COUNT(*) FROM jobs
WHERE customer_id = @customerId
  AND service_type = @serviceType
  AND DATE(scheduled_date) = DATE(@scheduledAt)
  AND service_type = 'CLEANING'
  AND status NOT IN ('CANCELLED', 'COMPLETED');
-- ต้องได้ผลลัพธ์ = 0 เท่านั้น
```

#### **Capacity Management**
- ระบบตรวจสอบ capacity ของทีมงานในวันที่นัดหมาย
- CLEANING: ทีมหนึ่งทำได้สูงสุด 3 งาน/วัน
- TRAINING: ทีมหนึ่งทำได้สูงสุด 2 งาน/วัน
- แสดง warning ถ้าใกล้เต็ม capacity

---

## **3. Assignment Logic Rules** {#assignment-rules}

### **BR-AL-001: Team Selection Criteria**

#### **Auto-Assignment Algorithm**
```typescript
interface AssignmentCriteria {
  workloadBalance: number;     // น้ำหนัก 40%
  skillMatch: number;         // น้ำหนัก 30%
  locationProximity: number;  // น้ำหนัก 20%
  availability: number;       // น้ำหนัก 10%
}

const calculateAssignmentScore = (user: User, job: Job): number => {
  const workloadScore = calculateWorkloadScore(user, job.scheduledAt);
  const skillScore = calculateSkillScore(user, job.serviceType);
  const locationScore = calculateLocationScore(user, job.customer.address);
  const availabilityScore = calculateAvailabilityScore(user, job.scheduledAt);

  return (workloadScore * 0.4) +
         (skillScore * 0.3) +
         (locationScore * 0.2) +
         (availabilityScore * 0.1);
};
```

#### **Workload Distribution Rules**
1. **Current Workload Calculation**
   - นับงานที่มีสถานะ NEW, ASSIGNED, IN_PROGRESS ในช่วง 7 วันข้างหน้า
   - คิดน้ำหนักตาม Priority: URGENT=3, HIGH=2, MEDIUM=1, LOW=0.5

2. **Fair Distribution**
   - ระบบต้องพยายามกระจายงานให้เท่าๆ กัน
   - ไม่อนุญาตให้คนหนึ่งมีงานมากกว่าคนอื่นเกิน 50%

3. **Skill-Based Assignment**
   ```typescript
   const skillMatrix = {
     CLEANING: {
       requiredSkills: ['cleaning_basic', 'equipment_usage'],
       preferredExperience: 6, // เดือน
     },
     TRAINING: {
       requiredSkills: ['training_delivery', 'curriculum_knowledge'],
       preferredExperience: 12, // เดือน
     }
   };
   ```

### **BR-AL-002: Assignment Validation**

#### **Pre-Assignment Checks**
1. **User Eligibility**
   - User ต้องมีสถานะ isActive = true
   - User ต้องมี role = OPERATIONS
   - User ต้องไม่อยู่ในช่วงลาหยุด

2. **Capacity Validation**
   - ตรวจสอบ capacity ของ user ในวันที่นัดหมาย
   - แสดง warning ถ้า user มีงานเกิน 80% ของ capacity สูงสุด

3. **Conflict Detection**
   - ตรวจสอบการทับซ้อนของเวลางาน
   - CLEANING: ประมาณ 3-4 ชั่วโมง/งาน
   - TRAINING: ประมาณ 6-8 ชั่วโมง/งาน

### **BR-AL-003: Bulk Assignment Rules**

#### **Multi-Job Assignment**
- Admin สามารถเลือกหลายงานและ assign ให้ user เดียวกันได้
- ระบบต้องตรวจสอบ capacity และ conflict สำหรับทุกงาน
- ถ้ามี conflict ให้แสดงรายละเอียดและให้เลือกจัดการ

#### **Assignment History**
- บันทึกประวัติการ assign ทุกครั้งใน audit_logs
- เก็บข้อมูล: วันเวลา, ผู้ assign, งานที่ assign, เหตุผล

---

## **4. Status Transition Rules** {#status-transition-rules}

### **BR-ST-001: Allowed Status Transitions**

#### **Status Flow Matrix**
```
NEW → ASSIGNED → IN_PROGRESS → COMPLETED → DONE
 ↓       ↓           ↓            ↓
CANCELLED ← ON_HOLD ←─────────────┘
```

#### **Transition Rules Table**
| From Status  | To Status    | Required Role | Additional Conditions |
|-------------|-------------|---------------|----------------------|
| NEW         | ASSIGNED    | ADMIN         | assignedToId ต้องไม่เป็น null |
| NEW         | CANCELLED   | ADMIN         | ต้องระบุเหตุผล |
| ASSIGNED    | IN_PROGRESS | OPERATIONS    | ต้องเป็น assignee |
| ASSIGNED    | ON_HOLD     | ADMIN/OPS     | ต้องระบุเหตุผล |
| IN_PROGRESS | COMPLETED   | OPERATIONS    | ต้องเป็น assignee |
| IN_PROGRESS | ON_HOLD     | ADMIN/OPS     | ต้องระบุเหตุผล |
| COMPLETED   | DONE        | ADMIN/QC      | QC approval required |
| ON_HOLD     | ASSIGNED    | ADMIN         | ต้องยังมี assignee |
| ON_HOLD     | CANCELLED   | ADMIN         | ต้องระบุเหตุผล |

#### **Invalid Transitions**
```typescript
const invalidTransitions = [
  { from: 'DONE', to: ['NEW', 'ASSIGNED', 'IN_PROGRESS'] },
  { from: 'CANCELLED', to: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] },
  { from: 'COMPLETED', to: ['NEW', 'ASSIGNED', 'IN_PROGRESS'] },
];
```

### **BR-ST-002: Status Change Validation**

#### **Role-Based Validation**
```typescript
const validateStatusChange = (
  currentStatus: JobStatus,
  newStatus: JobStatus,
  userRole: UserRole,
  userId: string,
  assignedToId: string
): ValidationResult => {

  // ตรวจสอบสิทธิ์พื้นฐาน
  if (!isValidTransition(currentStatus, newStatus)) {
    return { valid: false, message: "การเปลี่ยนสถานะนี้ไม่ได้รับอนุญาต" };
  }

  // ตรวจสอบสิทธิ์เฉพาะ role
  switch (newStatus) {
    case JobStatus.IN_PROGRESS:
      if (userRole !== UserRole.OPERATIONS || userId !== assignedToId) {
        return { valid: false, message: "เฉพาะผู้ที่ได้รับมอบหมายงานเท่านั้นที่สามารถเปลี่ยนเป็น IN_PROGRESS ได้" };
      }
      break;

    case JobStatus.DONE:
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.QC_MANAGER) {
        return { valid: false, message: "เฉพาะ Admin หรือ QC Manager เท่านั้นที่สามารถเปลี่ยนเป็น DONE ได้" };
      }
      break;
  }

  return { valid: true };
};
```

#### **Business Logic Validation**
1. **Completion Requirements**
   - งานที่เป็น COMPLETED ต้องมี completedAt timestamp
   - ถ้าเป็น TRAINING ต้องมี TrainingWorkflow status = COMPLETED
   - ถ้าเป็น CLEANING ต้องผ่าน QualityCheck (optional)

2. **Cancellation Rules**
   - งานที่ถูก CANCELLED ต้องมี notes อธิบายเหตุผล
   - งานที่ถูก CANCELLED ในวันเดียวกับนัดหมาย อาจมีค่าปรับ

---

## **5. Service Type Specific Rules** {#service-type-rules}

### **BR-SS-001: CLEANING Service Rules**

#### **Specific Attributes**
```typescript
interface CleaningJobRules {
  minPrice: 500;                    // ราคาขั้นต่ำ
  maxDurationHours: 4;              // ระยะเวลาสูงสุด
  requiredEquipment: string[];      // อุปกรณ์ที่ต้องใช้
  qualityCheckRequired: boolean;    // ต้องตรวจคุณภาพ
}
```

#### **CLEANING Specific Validations**
1. **Area Size Validation**
   - ถ้าระบุขนาดพื้นที่ ต้องมากกว่า 0 ตร.ม.
   - ราคาต้องสมเหตุสมผลกับขนาดพื้นที่ (50-200 บาท/ตร.ม.)

2. **Equipment Requirements**
   - ต้องระบุอุปกรณ์ที่ต้องใช้ใน notes
   - ตรวจสอบ availability ของอุปกรณ์ในวันนัดหมาย

3. **Time Slot Management**
   - CLEANING สามารถทำได้ในช่วง 08:00-18:00 เท่านั้น
   - แต่ละงาน CLEANING ใช้เวลา 3-4 ชั่วโมง

#### **Quality Control Integration**
```typescript
const createCleaningJob = (jobData: CleaningJobData): Job => {
  const job = createJob(jobData);

  // Auto-create QualityCheck if price > 2000
  if (job.price > 2000) {
    createQualityCheck({
      jobId: job.id,
      checklistId: 'standard_cleaning_checklist',
      status: QCStatus.PENDING
    });
  }

  return job;
};
```

### **BR-SS-002: TRAINING Service Rules**

#### **Specific Attributes**
```typescript
interface TrainingJobRules {
  minPrice: 2000;                   // ราคาขั้นต่ำ
  maxDurationHours: 8;              // ระยะเวลาสูงสุด
  requiredDocuments: string[];      // เอกสารที่ต้องใช้
  trainingWorkflowRequired: true;   // ต้องมี workflow
}
```

#### **TRAINING Specific Validations**
1. **Course Requirements**
   - ต้องระบุชื่อหลักสูตรใน description
   - ต้องระบุจำนวนผู้เข้าร่วม (1-50 คน)
   - ราคา per person ต้องมากกว่า 500 บาท

2. **Document Requirements**
   - ต้องสร้าง TrainingWorkflow พร้อมกับงาน
   - TrainingWorkflow เริ่มต้นด้วย status = AWAITING_DOCUMENTS

3. **Trainer Assignment**
   - ผู้ที่ได้รับมอบหมายต้องมี skill 'training_delivery'
   - ตรวจสอบ certification ของ trainer (future enhancement)

#### **Training Workflow Integration**
```typescript
const createTrainingJob = (jobData: TrainingJobData): Job => {
  const job = createJob(jobData);

  // Auto-create TrainingWorkflow
  createTrainingWorkflow({
    jobId: job.id,
    status: TrainingStatus.AWAITING_DOCUMENTS,
    documentsReceived: false,
    trainingCompleted: false
  });

  return job;
};
```

### **BR-SS-003: Cross-Service Rules**

#### **Common Validations**
1. **Customer Relationship**
   - ลูกค้าใหม่ต้องผ่าน KYC process ก่อน (future)
   - ลูกค้าที่มี outstanding payment ต้องได้รับ approval พิเศษ

2. **Scheduling Conflicts**
   - ตรวจสอบการทับซ้อนระหว่าง service types
   - TRAINING มี priority สูงกว่า CLEANING ในการจอง resource

---

## **6. N8N Integration Business Rules** {#n8n-integration-rules}

### **BR-N8N-001: Webhook Data Validation**

#### **Required Payload Structure**
```typescript
interface N8NWebhookPayload {
  workflowId: string;              // บังคับ
  executionId: string;             // บังคับ
  customerData: {
    name: string;                  // บังคับ
    phone: string;                 // บังคับ, รูปแบบ +66xxxxxxxxx
    address?: string;
    contactChannel: string;        // บังคับ
  };
  jobData: {
    serviceType: 'CLEANING' | 'TRAINING';  // บังคับ
    scheduledDate: string;         // บังคับ, ISO format
    price: number;                 // บังคับ, > 0
    notes?: string;
    description?: string;
  };
  metadata?: {
    source: string;                // เช่น 'LINE_OA', 'WEBSITE'
    campaignId?: string;
    referralCode?: string;
  };
}
```

#### **Data Validation Rules**
```typescript
const validateN8NPayload = (payload: unknown): ValidationResult => {
  // Schema validation
  const schemaResult = webhookSchema.safeParse(payload);
  if (!schemaResult.success) {
    return {
      valid: false,
      message: "Payload structure ไม่ถูกต้อง",
      details: schemaResult.error.issues
    };
  }

  const data = schemaResult.data;

  // Business validation
  const validations = [
    validatePhoneNumber(data.customerData.phone),
    validateScheduleDate(data.jobData.scheduledDate),
    validateServiceTypePrice(data.jobData.serviceType, data.jobData.price),
    validateContactChannel(data.customerData.contactChannel)
  ];

  const failures = validations.filter(v => !v.valid);
  if (failures.length > 0) {
    return {
      valid: false,
      message: "ข้อมูลธุรกิจไม่ถูกต้อง",
      details: failures
    };
  }

  return { valid: true };
};
```

### **BR-N8N-002: Customer Matching and Creation**

#### **Customer Matching Logic**
1. **Exact Match Priority**
   - ค้นหาด้วยหมายเลขโทรศัพท์ก่อน (primary key)
   - ถ้าพบ และชื่อตรงกัน 80% ขึ้นไป → ใช้ customer ที่มีอยู่
   - ถ้าพบ แต่ชื่อต่างกัน → สร้าง customer ใหม่ และ flag สำหรับ manual review

2. **Fuzzy Matching**
   ```typescript
   const findExistingCustomer = (customerData: CustomerData): Customer | null => {
     // หาด้วยเบอร์โทรก่อน
     let customer = findByPhone(customerData.phone);
     if (customer) {
       const nameMatch = calculateNameSimilarity(customer.name, customerData.name);
       if (nameMatch >= 0.8) {
         return customer;
       } else {
         // Mark for manual review
         flagForManualReview({
           type: 'NAME_MISMATCH',
           existingCustomer: customer,
           incomingData: customerData,
           similarity: nameMatch
         });
         return null; // สร้างใหม่
       }
     }

     return null;
   };
   ```

3. **Auto-Creation Rules**
   - สร้าง customer ใหม่ถ้าไม่พบที่ตรงกัน
   - Default status = ACTIVE
   - contactChannel ต้องตรงกับที่ระบุใน payload

### **BR-N8N-003: Error Handling and Retry Logic**

#### **Error Categories**
```typescript
enum WebhookErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',       // ข้อมูลไม่ถูกต้อง
  BUSINESS_RULE_ERROR = 'BUSINESS_RULE_ERROR', // ผิด business rules
  SYSTEM_ERROR = 'SYSTEM_ERROR',               // ปัญหาระบบ
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST'       // ข้อมูลซ้ำ
}
```

#### **Retry Strategy**
1. **Automatic Retry**
   - SYSTEM_ERROR: Retry 3 ครั้ง ด้วย exponential backoff (1s, 4s, 16s)
   - VALIDATION_ERROR: ไม่ retry, ส่งกลับไป N8N ทันที
   - BUSINESS_RULE_ERROR: Retry 1 ครั้งหลัง 30 วินาที

2. **Manual Review Queue**
   ```typescript
   const handleWebhookError = (payload: any, error: WebhookError): void => {
     switch (error.type) {
       case WebhookErrorType.VALIDATION_ERROR:
         logWebhookFailure(payload, error);
         sendErrorResponse(400, error.message);
         break;

       case WebhookErrorType.BUSINESS_RULE_ERROR:
         if (error.retryCount < 1) {
           scheduleRetry(payload, 30000); // 30 seconds
         } else {
           createManualReviewTask(payload, error);
         }
         break;

       case WebhookErrorType.SYSTEM_ERROR:
         if (error.retryCount < 3) {
           scheduleRetry(payload, calculateBackoff(error.retryCount));
         } else {
           createFailedWebhook(payload, error);
         }
         break;
     }
   };
   ```

#### **Duplicate Detection**
- ใช้ workflowId + executionId เป็น unique key
- ถ้าได้รับ payload ที่มี key ซ้ำใน 24 ชั่วโมง → return success แต่ไม่สร้างงานใหม่
- Log duplicate request สำหรับการวิเคราะห์

---

## **7. User Permission Rules** {#user-permission-rules}

### **BR-UP-001: Role-Based Access Control Matrix**

#### **Permission Matrix**
| Function | ADMIN | OPERATIONS | TRAINING | QC_MANAGER |
|----------|-------|------------|----------|------------|
| Create Job | ✅ | ❌ | ❌ | ❌ |
| View All Jobs | ✅ | ❌ | ❌ | ✅ |
| View Assigned Jobs | ✅ | ✅ | ✅ | ✅ |
| Edit Job Details | ✅ | ❌* | ❌* | ❌ |
| Assign Jobs | ✅ | ❌ | ❌ | ❌ |
| Update Job Status | ✅ | ✅* | ✅* | ✅* |
| Cancel Jobs | ✅ | ❌ | ❌ | ❌ |
| Delete Jobs | ✅ | ❌ | ❌ | ❌ |
| View Customer Details | ✅ | ✅* | ✅* | ✅ |
| Edit Customer Details | ✅ | ❌ | ❌ | ❌ |

**หมายเหตุ**: * = มีเงื่อนไขเพิ่มเติม

#### **Detailed Permission Rules**

1. **ADMIN Role (ผู้ดูแลระบบ)**
   ```typescript
   const adminPermissions = {
     jobs: {
       create: true,
       read: 'ALL',
       update: 'ALL',
       delete: true,
       assign: true,
       cancel: true,
       statusChange: 'ALL'
     },
     customers: {
       create: true,
       read: 'ALL',
       update: 'ALL',
       delete: false // Soft delete only
     },
     system: {
       viewReports: true,
       manageUsers: true,
       systemConfig: true
     }
   };
   ```

2. **OPERATIONS Role (ทีมปฏิบัติการ)**
   ```typescript
   const operationsPermissions = {
     jobs: {
       create: false,
       read: 'ASSIGNED_ONLY', // เฉพาะงานที่ได้รับมอบหมาย
       update: 'LIMITED',     // เฉพาะ notes, และ status
       delete: false,
       assign: false,
       cancel: false,
       statusChange: ['ASSIGNED → IN_PROGRESS', 'IN_PROGRESS → COMPLETED', 'ANY → ON_HOLD']
     },
     customers: {
       create: false,
       read: 'JOB_RELATED',   // เฉพาะลูกค้าที่เกี่ยวข้องกับงานที่ได้รับมอบหมาย
       update: false,
       delete: false
     }
   };
   ```

3. **TRAINING Role (ทีมฝึกอบรม)**
   ```typescript
   const trainingPermissions = {
     jobs: {
       create: false,
       read: 'TRAINING_ASSIGNED', // เฉพาะงาน TRAINING ที่ได้รับมอบหมาย
       update: 'TRAINING_WORKFLOW', // เฉพาะ TrainingWorkflow
       statusChange: ['IN_PROGRESS → COMPLETED'] // เฉพาะงาน training
     },
     trainingWorkflow: {
       read: 'ASSIGNED',
       update: 'ASSIGNED',
       statusChange: 'ALL'
     }
   };
   ```

4. **QC_MANAGER Role (ผู้จัดการควบคุมคุณภาพ)**
   ```typescript
   const qcManagerPermissions = {
     jobs: {
       read: 'ALL',
       update: 'QC_RELATED',    // เฉพาะ QC fields
       statusChange: ['COMPLETED → DONE', 'ANY → ON_HOLD']
     },
     qualityChecks: {
       create: true,
       read: 'ALL',
       update: 'ALL',
       approve: true
     }
   };
   ```

### **BR-UP-002: Dynamic Permission Validation**

#### **Context-Aware Permissions**
```typescript
interface PermissionContext {
  user: User;
  resource: 'job' | 'customer' | 'qualityCheck';
  action: 'create' | 'read' | 'update' | 'delete';
  resourceId?: string;
  targetData?: any;
}

const checkPermission = async (context: PermissionContext): Promise<boolean> => {
  const { user, resource, action, resourceId } = context;

  // Basic role check
  const basePermission = rolePermissions[user.role][resource][action];
  if (basePermission === false) return false;
  if (basePermission === true) return true;

  // Conditional permission check
  switch (basePermission) {
    case 'ASSIGNED_ONLY':
      if (resource === 'job' && resourceId) {
        const job = await getJob(resourceId);
        return job.assignedToId === user.id;
      }
      return false;

    case 'JOB_RELATED':
      if (resource === 'customer' && resourceId) {
        const userJobs = await getUserAssignedJobs(user.id);
        return userJobs.some(job => job.customerId === resourceId);
      }
      return false;

    default:
      return false;
  }
};
```

#### **Field-Level Permissions**
```typescript
const getEditableFields = (user: User, resource: string): string[] => {
  switch (user.role) {
    case UserRole.ADMIN:
      return getAllFields(resource);

    case UserRole.OPERATIONS:
      if (resource === 'job') {
        return ['notes', 'status']; // เฉพาะฟิลด์ที่ OPERATIONS แก้ไขได้
      }
      return [];

    case UserRole.QC_MANAGER:
      if (resource === 'job') {
        return ['status', 'notes']; // เฉพาะการอนุมัติ QC
      }
      return getAllFields('qualityCheck');

    default:
      return [];
  }
};
```

### **BR-UP-003: Security and Audit Rules**

#### **Authentication Requirements**
- ผู้ใช้ต้อง login และมี valid JWT token
- Token expires ทุก 8 ชั่วโมง
- Refresh token expires ทุก 30 วัน

#### **Audit Logging**
```typescript
const auditableActions = [
  'CREATE_JOB',
  'UPDATE_JOB_STATUS',
  'ASSIGN_JOB',
  'CANCEL_JOB',
  'DELETE_JOB',
  'UPDATE_CUSTOMER',
  'APPROVE_QC'
];

const logUserAction = async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  oldValues?: any,
  newValues?: any
): Promise<void> => {
  await createAuditLog({
    entityType: resourceType,
    entityId: resourceId,
    action: action,
    oldValues: oldValues,
    newValues: newValues,
    userId: userId,
    timestamp: new Date()
  });
};
```

---

## **8. Data Integrity Rules** {#data-integrity-rules}

### **BR-DI-001: Database Constraints**

#### **Primary Key and Foreign Key Rules**
```sql
-- Customer Table Constraints
ALTER TABLE customers
ADD CONSTRAINT pk_customers PRIMARY KEY (id),
ADD CONSTRAINT uk_customers_phone UNIQUE (phone),
ADD CONSTRAINT ck_customers_phone_format CHECK (phone ~ '^\+66[0-9]{9}$');

-- Job Table Constraints
ALTER TABLE jobs
ADD CONSTRAINT pk_jobs PRIMARY KEY (id),
ADD CONSTRAINT fk_jobs_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
ADD CONSTRAINT fk_jobs_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES users(id),
ADD CONSTRAINT ck_jobs_price_positive CHECK (price > 0),
ADD CONSTRAINT ck_jobs_scheduled_date_future CHECK (scheduled_date >= CURRENT_DATE - INTERVAL '1 day');
```

#### **Enum Value Constraints**
```sql
-- สร้าง enum types
CREATE TYPE job_status AS ENUM ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DONE', 'ON_HOLD', 'CANCELLED');
CREATE TYPE service_type AS ENUM ('CLEANING', 'TRAINING');
CREATE TYPE priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Apply to tables
ALTER TABLE jobs
ALTER COLUMN status TYPE job_status USING status::job_status,
ALTER COLUMN service_type TYPE service_type USING service_type::service_type,
ALTER COLUMN priority TYPE priority USING priority::priority;
```

### **BR-DI-002: Data Validation Rules**

#### **Input Sanitization**
```typescript
const sanitizeInput = {
  customerName: (name: string): string => {
    return name
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 100);   // Max length 100 chars
  },

  phoneNumber: (phone: string): string => {
    // Normalize phone number format
    let clean = phone.replace(/[^0-9+]/g, '');
    if (clean.startsWith('0')) {
      clean = '+66' + clean.substring(1);
    }
    return clean;
  },

  notes: (notes: string): string => {
    return notes
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .substring(0, 1000); // Max length 1000 chars
  }
};
```

#### **Business Logic Validation**
```typescript
const validateJobData = (jobData: Partial<Job>): ValidationResult[] => {
  const validations: ValidationResult[] = [];

  // Price validation by service type
  if (jobData.serviceType === ServiceType.CLEANING && jobData.price < 500) {
    validations.push({
      field: 'price',
      valid: false,
      message: 'ราคางาน CLEANING ต้องไม่ต่ำกว่า 500 บาท'
    });
  }

  if (jobData.serviceType === ServiceType.TRAINING && jobData.price < 2000) {
    validations.push({
      field: 'price',
      valid: false,
      message: 'ราคางาน TRAINING ต้องไม่ต่ำกว่า 2000 บาท'
    });
  }

  // Scheduled date validation
  if (jobData.scheduledAt && jobData.scheduledAt < new Date()) {
    const hoursDiff = (new Date().getTime() - jobData.scheduledAt.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      validations.push({
        field: 'scheduledAt',
        valid: false,
        message: 'ไม่สามารถสร้างงานที่นัดหมายเกิน 24 ชั่วโมงที่ผ่านมาได้'
      });
    }
  }

  return validations;
};
```

### **BR-DI-003: Referential Integrity**

#### **Cascade Rules**
```typescript
const cascadeRules = {
  // เมื่อลบ Customer
  onCustomerDelete: {
    jobs: 'RESTRICT',           // ห้ามลบถ้ามีงาน
    auditLogs: 'CASCADE'        // ลบ audit logs ตาม
  },

  // เมื่อลบ User
  onUserDelete: {
    assignedJobs: 'SET_NULL',   // เซ็ต assignedToId เป็น null
    auditLogs: 'RESTRICT'       // ห้ามลบถ้ามี audit logs
  },

  // เมื่อลบ Job
  onJobDelete: {
    qualityChecks: 'CASCADE',   // ลบ quality checks ตาม
    trainingWorkflow: 'CASCADE', // ลบ training workflow ตาม
    webhookLogs: 'SET_NULL',    // เซ็ต createdJobId เป็น null
    auditLogs: 'CASCADE'        // ลบ audit logs ตาม
  }
};
```

#### **Consistency Checks**
```typescript
const performConsistencyChecks = async (): Promise<IntegrityReport> => {
  const issues: IntegrityIssue[] = [];

  // Check orphaned assignments
  const orphanedJobs = await db.job.findMany({
    where: {
      assignedToId: { not: null },
      assignedTo: null
    }
  });

  if (orphanedJobs.length > 0) {
    issues.push({
      type: 'ORPHANED_ASSIGNMENT',
      count: orphanedJobs.length,
      severity: 'HIGH',
      affectedIds: orphanedJobs.map(j => j.id)
    });
  }

  // Check invalid status combinations
  const invalidStatusJobs = await db.job.findMany({
    where: {
      AND: [
        { status: JobStatus.IN_PROGRESS },
        { assignedToId: null }
      ]
    }
  });

  if (invalidStatusJobs.length > 0) {
    issues.push({
      type: 'INVALID_STATUS_ASSIGNMENT',
      count: invalidStatusJobs.length,
      severity: 'MEDIUM',
      affectedIds: invalidStatusJobs.map(j => j.id)
    });
  }

  return {
    timestamp: new Date(),
    totalIssues: issues.length,
    issues: issues
  };
};
```

---

## **9. Workflow Automation Rules** {#workflow-automation-rules}

### **BR-WA-001: Automatic Status Updates**

#### **Time-Based Automation**
```typescript
const automationRules = [
  {
    name: 'AUTO_ASSIGN_TIMEOUT',
    condition: {
      status: JobStatus.NEW,
      createdAt: { olderThan: '2 hours' },
      assignedToId: null
    },
    action: 'NOTIFY_ADMIN',
    message: 'งานใหม่ยังไม่ได้รับการมอบหมายเกิน 2 ชั่วโมง'
  },

  {
    name: 'AUTO_ESCALATE_OVERDUE',
    condition: {
      status: JobStatus.ASSIGNED,
      scheduledAt: { pastDue: '1 day' }
    },
    action: 'ESCALATE_TO_MANAGER',
    message: 'งานที่ได้รับมอบหมายเลยกำหนดแล้ว'
  },

  {
    name: 'AUTO_COMPLETE_REMINDER',
    condition: {
      status: JobStatus.COMPLETED,
      completedAt: { olderThan: '24 hours' }
    },
    action: 'REMIND_QC_APPROVAL',
    message: 'งานที่เสร็จแล้วรอการอนุมัติ QC เกิน 24 ชั่วโมง'
  }
];
```

#### **Event-Driven Automation**
```typescript
const eventTriggers = {
  onJobCreate: async (job: Job): Promise<void> => {
    // Auto-create related workflows
    if (job.serviceType === ServiceType.TRAINING) {
      await createTrainingWorkflow({
        jobId: job.id,
        status: TrainingStatus.AWAITING_DOCUMENTS
      });
    }

    // Auto-assign if criteria met
    if (job.priority === Priority.URGENT) {
      const bestUser = await findBestAvailableUser(job);
      if (bestUser) {
        await assignJob(job.id, bestUser.id);
      }
    }
  },

  onStatusChange: async (job: Job, oldStatus: JobStatus, newStatus: JobStatus): Promise<void> => {
    // Auto-create quality check for high-value cleaning jobs
    if (newStatus === JobStatus.COMPLETED &&
        job.serviceType === ServiceType.CLEANING &&
        job.price >= 2000) {
      await createQualityCheck({
        jobId: job.id,
        checklistId: 'standard_cleaning_checklist',
        status: QCStatus.PENDING
      });
    }

    // Update training workflow
    if (job.serviceType === ServiceType.TRAINING && newStatus === JobStatus.COMPLETED) {
      await updateTrainingWorkflow(job.id, {
        status: TrainingStatus.TRAINING_COMPLETED,
        trainingCompleted: true
      });
    }
  },

  onAssignment: async (job: Job, assignedUser: User): Promise<void> => {
    // Send notification to assigned user
    await notifyUser(assignedUser.id, {
      type: 'JOB_ASSIGNED',
      message: `คุณได้รับมอบหมายงาน: ${job.description}`,
      jobId: job.id
    });

    // Update workload metrics
    await updateUserWorkload(assignedUser.id);
  }
};
```

### **BR-WA-002: Notification Rules**

#### **Notification Triggers**
```typescript
const notificationMatrix = {
  [JobStatus.NEW]: {
    recipients: ['ADMIN'],
    template: 'new_job_created',
    urgency: 'NORMAL'
  },

  [JobStatus.ASSIGNED]: {
    recipients: ['ASSIGNED_USER'],
    template: 'job_assigned',
    urgency: 'NORMAL'
  },

  [JobStatus.IN_PROGRESS]: {
    recipients: ['ADMIN', 'QC_MANAGER'],
    template: 'job_started',
    urgency: 'LOW'
  },

  [JobStatus.COMPLETED]: {
    recipients: ['ADMIN', 'QC_MANAGER'],
    template: 'job_completed',
    urgency: 'NORMAL'
  },

  [JobStatus.ON_HOLD]: {
    recipients: ['ADMIN', 'ASSIGNED_USER'],
    template: 'job_on_hold',
    urgency: 'HIGH'
  },

  [JobStatus.CANCELLED]: {
    recipients: ['ADMIN', 'ASSIGNED_USER'],
    template: 'job_cancelled',
    urgency: 'HIGH'
  }
};
```

#### **Escalation Rules**
```typescript
const escalationRules = [
  {
    name: 'UNASSIGNED_JOB_ESCALATION',
    trigger: {
      condition: 'job.status === NEW && hoursOld(job.createdAt) >= 4',
      frequency: 'ONCE'
    },
    action: {
      type: 'NOTIFY',
      recipients: ['ADMIN', 'MANAGER'],
      urgency: 'HIGH'
    }
  },

  {
    name: 'OVERDUE_JOB_ESCALATION',
    trigger: {
      condition: 'job.status === ASSIGNED && daysPast(job.scheduledAt) >= 1',
      frequency: 'DAILY'
    },
    action: {
      type: 'ESCALATE',
      recipients: ['MANAGER', 'ASSIGNED_USER'],
      urgency: 'URGENT'
    }
  },

  {
    name: 'PENDING_QC_ESCALATION',
    trigger: {
      condition: 'job.status === COMPLETED && hoursOld(job.completedAt) >= 48',
      frequency: 'DAILY'
    },
    action: {
      type: 'REMIND',
      recipients: ['QC_MANAGER'],
      urgency: 'HIGH'
    }
  }
];
```

### **BR-WA-003: Batch Processing Rules**

#### **Scheduled Jobs**
```typescript
const scheduledJobs = {
  dailyCleanup: {
    schedule: '0 2 * * *', // 2 AM daily
    tasks: [
      'cleanupExpiredWebhookLogs',
      'archiveOldAuditLogs',
      'generateDailyReports',
      'runConsistencyChecks'
    ]
  },

  weeklyMaintenance: {
    schedule: '0 3 * * 0', // 3 AM Sunday
    tasks: [
      'optimizeDatabaseIndexes',
      'generateWeeklyAnalytics',
      'cleanupTempFiles'
    ]
  },

  monthlyArchive: {
    schedule: '0 1 1 * *', // 1 AM first day of month
    tasks: [
      'archiveCompletedJobs',
      'generateMonthlyReports',
      'reviewSystemPerformance'
    ]
  }
};
```

#### **Bulk Operations**
```typescript
const bulkOperationRules = {
  maxBatchSize: 100,

  bulkAssignment: {
    validation: [
      'checkUserCapacity',
      'validateJobCompatibility',
      'checkScheduleConflicts'
    ],
    rollbackOnFailure: true
  },

  bulkStatusUpdate: {
    allowedTransitions: [
      'NEW → CANCELLED',
      'ASSIGNED → ON_HOLD',
      'COMPLETED → DONE'
    ],
    requiresApproval: ['BULK_CANCEL', 'BULK_APPROVE']
  },

  bulkNotification: {
    maxRecipients: 50,
    rateLimiting: '10 per minute',
    templateValidation: true
  }
};
```

---

## **10. Error Handling and Edge Cases** {#error-handling}

### **BR-EH-001: System Error Scenarios**

#### **Database Connection Errors**
```typescript
const handleDatabaseError = (error: DatabaseError, operation: string): ErrorResponse => {
  switch (error.code) {
    case 'CONNECTION_TIMEOUT':
      return {
        status: 503,
        message: 'ระบบไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้',
        userAction: 'กรุณาลองใหม่อีกครั้งในอีกสักครู่',
        retryAfter: 30 // seconds
      };

    case 'DEADLOCK_DETECTED':
      return {
        status: 409,
        message: 'ระบบกำลังประมวลผลข้อมูลชุดเดียวกัน',
        userAction: 'กรุณาลองใหม่อีกครั้ง',
        retryAfter: 5
      };

    case 'CONSTRAINT_VIOLATION':
      return {
        status: 400,
        message: 'ข้อมูลที่ส่งมาไม่ถูกต้องตามกฎของระบบ',
        userAction: 'กรุณาตรวจสอบข้อมูลและแก้ไข',
        details: parseConstraintError(error)
      };

    default:
      logCriticalError(error, operation);
      return {
        status: 500,
        message: 'เกิดข้อผิดพลาดของระบบ',
        userAction: 'กรุณาติดต่อผู้ดูแลระบบ',
        errorId: generateErrorId()
      };
  }
};
```

#### **Business Logic Conflicts**
```typescript
const businessConflictScenarios = [
  {
    scenario: 'DOUBLE_BOOKING',
    detection: 'ลูกค้าเดียวกันมีงาน CLEANING ในวันเดียวกัน',
    resolution: 'แสดง warning และให้ Admin ยืนยัน',
    autoAction: 'NONE'
  },

  {
    scenario: 'OVERLOAD_ASSIGNMENT',
    detection: 'User มีงานเกิน capacity ในวันนั้น',
    resolution: 'ปฏิเสธการ assign และแสดงทางเลือกอื่น',
    autoAction: 'SUGGEST_ALTERNATIVES'
  },

  {
    scenario: 'PAST_DATE_BOOKING',
    detection: 'สร้างงานที่นัดหมายในอดีต',
    resolution: 'อนุญาตเฉพาะ Admin และต้องระบุเหตุผล',
    autoAction: 'REQUIRE_JUSTIFICATION'
  },

  {
    scenario: 'INACTIVE_CUSTOMER_BOOKING',
    detection: 'สร้างงานให้ลูกค้าสถานะ INACTIVE',
    resolution: 'แสดง warning และให้เลือกเปลี่ยนสถานะลูกค้า',
    autoAction: 'PROMPT_CUSTOMER_ACTIVATION'
  }
];
```

### **BR-EH-002: Data Corruption Prevention**

#### **Transaction Management**
```typescript
const criticalOperations = [
  'CREATE_JOB_WITH_CUSTOMER',
  'ASSIGN_JOB_WITH_NOTIFICATION',
  'COMPLETE_JOB_WITH_QC',
  'CANCEL_JOB_WITH_REFUND',
  'BULK_STATUS_UPDATE'
];

const executeWithTransaction = async <T>(
  operation: () => Promise<T>,
  operationType: string
): Promise<T> => {
  const transaction = await db.$transaction(async (tx) => {
    try {
      // Pre-operation validation
      await validateOperationPreconditions(operationType, tx);

      // Execute operation
      const result = await operation();

      // Post-operation validation
      await validateOperationResult(operationType, result, tx);

      return result;
    } catch (error) {
      // Transaction will auto-rollback
      await logTransactionFailure(operationType, error);
      throw error;
    }
  });

  return transaction;
};
```

#### **Data Validation Checkpoints**
```typescript
const validationCheckpoints = {
  beforeSave: [
    'validateRequiredFields',
    'validateBusinessRules',
    'checkReferentialIntegrity',
    'validatePermissions'
  ],

  afterSave: [
    'verifyDataConsistency',
    'checkCascadeEffects',
    'validateFinalState'
  ],

  periodic: [
    'detectOrphanedRecords',
    'validateForeignKeyConstraints',
    'checkBusinessRuleCompliance',
    'verifyAuditTrailIntegrity'
  ]
};
```

### **BR-EH-003: Recovery Procedures**

#### **Data Recovery Scenarios**
```typescript
const recoveryProcedures = {
  CORRUPTED_JOB_DATA: {
    detection: 'Job record มี invalid status หรือ missing required fields',
    recovery: [
      'ถ้าใน 24 ชั่วโมง: restore จาก audit log',
      'ถ้าเกิน 24 ชั่วโมง: สร้าง manual review task',
      'notify Admin ให้ตรวจสอบและแก้ไข'
    ],
    prevention: 'เพิ่ม validation ที่ application layer'
  },

  MISSING_CUSTOMER_REFERENCE: {
    detection: 'Job มี customerId แต่ Customer record หายไป',
    recovery: [
      'ค้นหาใน audit log ว่า Customer ถูกลบเมื่อไหร่',
      'ถ้าลบผิดพลาด: restore Customer record',
      'ถ้าลบถูกต้อง: เปลี่ยน Job status เป็น CANCELLED'
    ],
    prevention: 'ใช้ RESTRICT foreign key constraint'
  },

  WEBHOOK_DATA_LOSS: {
    detection: 'WebhookLog record หายไปแต่ Job ยังอ้างอิง',
    recovery: [
      'ตรวจสอบ backup webhook logs',
      'ถ้าหาไม่เจอ: clear webhook reference ใน Job',
      'log incident สำหรับการติดตาม'
    ],
    prevention: 'เพิ่ม webhook log retention policy'
  }
};
```

#### **Failover Procedures**
```typescript
const failoverProcedures = {
  DATABASE_FAILURE: {
    immediate: [
      'Switch to read-only mode',
      'Display maintenance message',
      'Queue incoming webhook requests'
    ],
    recovery: [
      'Restore from latest backup',
      'Replay queued webhook requests',
      'Validate data integrity',
      'Resume normal operation'
    ]
  },

  API_SERVICE_FAILURE: {
    immediate: [
      'Route traffic to backup service',
      'Enable circuit breaker pattern',
      'Log all failed requests'
    ],
    recovery: [
      'Restart failed service',
      'Replay logged requests',
      'Gradually restore traffic'
    ]
  }
};
```

---

## **11. Business Rule Validation Matrix** {#validation-matrix}

### **BR-VM-001: Validation Summary Table**

| Rule Category | Rule ID | Validation Point | Criticality | Auto-Fix | Manual Review |
|--------------|---------|------------------|-------------|----------|---------------|
| **Job Creation** | BR-JC-001 | API Input | HIGH | ❌ | ✅ |
| | BR-JC-002 | Default Values | MEDIUM | ✅ | ❌ |
| | BR-JC-003 | Business Constraints | HIGH | ❌ | ✅ |
| **Assignment** | BR-AL-001 | Team Selection | MEDIUM | ✅ | ❌ |
| | BR-AL-002 | Assignment Validation | HIGH | ❌ | ✅ |
| | BR-AL-003 | Bulk Operations | HIGH | ❌ | ✅ |
| **Status** | BR-ST-001 | Transition Rules | HIGH | ❌ | ❌ |
| | BR-ST-002 | Change Validation | HIGH | ❌ | ❌ |
| **Service Types** | BR-SS-001 | CLEANING Rules | MEDIUM | ✅ | ❌ |
| | BR-SS-002 | TRAINING Rules | MEDIUM | ✅ | ❌ |
| | BR-SS-003 | Cross-Service | MEDIUM | ❌ | ✅ |
| **N8N Integration** | BR-N8N-001 | Webhook Validation | HIGH | ❌ | ✅ |
| | BR-N8N-002 | Customer Matching | MEDIUM | ✅ | ✅ |
| | BR-N8N-003 | Error Handling | HIGH | ✅ | ✅ |
| **Permissions** | BR-UP-001 | Role Validation | CRITICAL | ❌ | ❌ |
| | BR-UP-002 | Dynamic Permissions | HIGH | ❌ | ❌ |
| | BR-UP-003 | Security Audit | CRITICAL | ❌ | ✅ |
| **Data Integrity** | BR-DI-001 | Database Constraints | CRITICAL | ❌ | ✅ |
| | BR-DI-002 | Data Validation | HIGH | ✅ | ❌ |
| | BR-DI-003 | Referential Integrity | CRITICAL | ❌ | ✅ |
| **Automation** | BR-WA-001 | Status Updates | MEDIUM | ✅ | ❌ |
| | BR-WA-002 | Notifications | LOW | ✅ | ❌ |
| | BR-WA-003 | Batch Processing | MEDIUM | ✅ | ✅ |

### **BR-VM-002: Testing Requirements**

#### **Unit Test Coverage**
```typescript
const testRequirements = {
  validationFunctions: {
    coverage: '100%',
    scenarios: ['valid input', 'invalid input', 'edge cases', 'null values']
  },

  businessRules: {
    coverage: '95%',
    scenarios: ['happy path', 'business violations', 'permission denials']
  },

  errorHandling: {
    coverage: '90%',
    scenarios: ['expected errors', 'unexpected errors', 'recovery procedures']
  }
};
```

#### **Integration Test Scenarios**
```typescript
const integrationTests = [
  {
    name: 'End-to-End Job Creation',
    scenario: 'Admin creates job → Auto-assignment → Status updates → Completion',
    validates: ['BR-JC-001', 'BR-AL-001', 'BR-ST-001', 'BR-WA-001']
  },

  {
    name: 'N8N Webhook Processing',
    scenario: 'N8N sends webhook → Customer matching → Job creation → Notification',
    validates: ['BR-N8N-001', 'BR-N8N-002', 'BR-JC-001', 'BR-WA-002']
  },

  {
    name: 'Permission Enforcement',
    scenario: 'Different roles attempt various operations',
    validates: ['BR-UP-001', 'BR-UP-002', 'BR-UP-003']
  },

  {
    name: 'Data Integrity Protection',
    scenario: 'Concurrent operations on same data',
    validates: ['BR-DI-001', 'BR-DI-002', 'BR-DI-003']
  }
];
```

### **BR-VM-003: Monitoring and Alerting**

#### **Rule Violation Monitoring**
```typescript
const monitoringRules = [
  {
    rule: 'BR-JC-001_VIOLATIONS',
    metric: 'validation_failures_per_hour',
    threshold: 10,
    action: 'ALERT_ADMIN',
    escalation: 'ALERT_MANAGER_AFTER_1_HOUR'
  },

  {
    rule: 'BR-UP-001_PERMISSION_DENIALS',
    metric: 'permission_denials_per_user_per_day',
    threshold: 5,
    action: 'LOG_SECURITY_EVENT',
    escalation: 'REVIEW_USER_PERMISSIONS'
  },

  {
    rule: 'BR-N8N-003_ERROR_RATE',
    metric: 'webhook_error_rate_percentage',
    threshold: 5,
    action: 'ALERT_INTEGRATION_TEAM',
    escalation: 'ESCALATE_TO_N8N_TEAM'
  }
];
```

#### **Performance Impact Monitoring**
```typescript
const performanceMetrics = {
  validationLatency: {
    target: '< 100ms for 95th percentile',
    alert: '> 200ms for 90th percentile'
  },

  ruleEvaluationTime: {
    target: '< 50ms per rule',
    alert: '> 100ms per rule'
  },

  databaseConstraintTime: {
    target: '< 10ms per constraint',
    alert: '> 50ms per constraint'
  }
};
```

---

## **สรุปและข้อแนะนำ**

### **ความสำคัญของ Business Rules**
เอกสารนี้กำหนดกฎทางธุรกิจที่ครอบคลุมสำหรับ Epic 2.1 เพื่อให้การพัฒนาระบบสอดคล้องกับความต้องการทางธุรกิจและลดความคลุมเครือ

### **การนำไปใช้**
1. **ทีมพัฒนา**: ใช้เป็นแนวทางในการเขียนโค้ดและ validation logic
2. **ทีม QA**: ใช้เป็นพื้นฐานในการสร้าง test cases และ validation scenarios
3. **ทีม Business**: ใช้เป็นเอกสารอ้างอิงสำหรับการตรวจสอบความถูกต้องของระบบ

### **การบำรุงรักษา**
- ทบทวนและปรับปรุงกฎทุก 3 เดือน
- เพิ่มเติมกฎใหม่เมื่อมีความต้องการเปลี่ยนแปลง
- ติดตามและวัดผลการปฏิบัติตามกฎ

### **การติดต่อ**
หากมีคำถามหรือต้องการปรับปรุงกฎทางธุรกิจ กรุณาติดต่อ:
- **Business Analyst**: Morgan
- **Technical Lead**: [ระบุชื่อ]
- **Product Owner**: [ระบุชื่อ]

---

**เอกสารนี้เป็นเอกสารสำคัญที่ต้องปฏิบัติตามอย่างเคร่งครัด เพื่อให้ระบบ Tinedy CRM ทำงานได้อย่างมีประสิทธิภาพและเป็นไปตามมาตรฐานทางธุรกิจ**