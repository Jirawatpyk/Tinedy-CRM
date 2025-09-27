# Design CRM Schema Task

## Objective
Design comprehensive database schema for Tinedy CRM system with focus on customer management, job tracking, and quality control workflows.

## Prerequisites
- [ ] Core project requirements understood
- [ ] Integration points with N8N and LINE OA mapped
- [ ] Performance requirements identified

## Task Steps

### 1. Analyze Business Requirements
**Input Required**: Business requirements document or user stories
**Action**:
- Identify all entities and their relationships
- Map business processes to data flows
- Document data volume estimates

### 2. Design Core Entities

#### Customer Entity
```prisma
model Customer {
  id          String   @id @default(cuid())
  lineUserId  String?  @unique // LINE OA integration
  name        String
  phone       String?
  email       String?
  address     String?
  notes       String?
  status      CustomerStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  jobs        Job[]

  @@map("customers")
}
```

#### Job/Booking Entity
```prisma
model Job {
  id            String      @id @default(cuid())
  customerId    String
  serviceType   String
  description   String?
  status        JobStatus   @default(NEW)
  priority      Priority    @default(MEDIUM)
  scheduledAt   DateTime?
  completedAt   DateTime?
  assignedToId  String?
  n8nWorkflowId String?     // N8N integration reference
  webhookData   Json?       // Raw webhook data from N8N
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  customer      Customer    @relation(fields: [customerId], references: [id])
  assignedTo    User?       @relation(fields: [assignedToId], references: [id])
  qualityChecks QualityCheck[]
  training      TrainingWorkflow?

  @@map("jobs")
}
```

### 3. Design Supporting Entities

#### User & Roles
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      UserRole @default(OPERATIONS)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  assignedJobs Job[]

  @@map("users")
}

enum UserRole {
  ADMIN
  OPERATIONS
  TRAINING
  QC_MANAGER
}
```

#### Quality Control
```prisma
model QualityCheck {
  id          String           @id @default(cuid())
  jobId       String
  checklistId String
  status      QCStatus         @default(PENDING)
  completedBy String?
  completedAt DateTime?
  notes       String?
  createdAt   DateTime         @default(now())

  // Relations
  job         Job              @relation(fields: [jobId], references: [id])
  checklist   QualityChecklist @relation(fields: [checklistId], references: [id])

  @@map("quality_checks")
}

model QualityChecklist {
  id          String         @id @default(cuid())
  name        String
  description String?
  items       Json           // Checklist items as JSON
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())

  // Relations
  qualityChecks QualityCheck[]

  @@map("quality_checklists")
}
```

#### Training Workflow
```prisma
model TrainingWorkflow {
  id                String          @id @default(cuid())
  jobId             String          @unique
  status            TrainingStatus  @default(AWAITING_DOCUMENTS)
  documentsReceived Boolean         @default(false)
  trainingCompleted Boolean         @default(false)
  notes             String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  job               Job             @relation(fields: [jobId], references: [id])

  @@map("training_workflows")
}
```

### 4. Define Enums
```prisma
enum CustomerStatus {
  ACTIVE
  INACTIVE
  BLOCKED
}

enum JobStatus {
  NEW
  IN_PROGRESS
  COMPLETED
  CANCELLED
  ON_HOLD
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum QCStatus {
  PENDING
  IN_PROGRESS
  PASSED
  FAILED
  NEEDS_REVIEW
}

enum TrainingStatus {
  AWAITING_DOCUMENTS
  DOCUMENTS_RECEIVED
  TRAINING_IN_PROGRESS
  TRAINING_COMPLETED
  COMPLETED
}
```

### 5. Add Indexes for Performance
```prisma
// Add these to respective models
@@index([status])
@@index([createdAt])
@@index([customerId, status])
@@index([assignedToId, status])
@@index([lineUserId]) // For LINE integration lookups
```

### 6. Design Audit Trail (Optional)
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  entityType String  // 'Customer', 'Job', etc.
  entityId   String
  action     String  // 'CREATE', 'UPDATE', 'DELETE'
  oldValues  Json?
  newValues  Json?
  userId     String?
  timestamp  DateTime @default(now())

  @@map("audit_logs")
}
```

## Validation Steps
- [ ] Review schema against all user stories
- [ ] Validate foreign key relationships
- [ ] Check index strategy for performance
- [ ] Ensure data types support business requirements
- [ ] Verify enum values cover all business cases

## Deliverables
1. Complete Prisma schema file
2. Entity Relationship Diagram
3. Index strategy documentation
4. Migration plan outline

## Success Criteria
- All business entities represented
- Relationships properly defined
- Performance considerations addressed
- Security and audit requirements met
- Compatible with Vercel Postgres and Prisma ORM