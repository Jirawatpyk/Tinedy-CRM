# 🗄️ Tinedy CRM Database Documentation

คู่มือการใช้งานฐานข้อมูลสำหรับระบบ Tinedy CRM

## 📋 สารบัญ

- [🚀 การตั้งค่าเริ่มต้น](#-การตั้งค่าเริ่มต้น)
- [📊 Database Schema](#-database-schema)
- [🔧 Prisma Commands](#-prisma-commands)
- [🌱 การ Seed ข้อมูล](#-การ-seed-ข้อมูล)
- [🔍 การ Query ข้อมูล](#-การ-query-ข้อมูล)
- [⚡ Performance Tips](#-performance-tips)
- [🛠️ Troubleshooting](#️-troubleshooting)

## 🚀 การตั้งค่าเริ่มต้น

### 1. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` และกรอกข้อมูล:

```bash
# คัดลอกจาก .env.example
cp .env.example .env.local

# แก้ไข DATABASE_URL ให้ตรงกับฐานข้อมูลของคุณ
DATABASE_URL="postgres://username:password@host:port/database?sslmode=require"
```

### 2. ตั้งค่าฐานข้อมูลครั้งแรก

```bash
# รันการตั้งค่าอัตโนมัติ (แนะนำ)
npm run db:setup

# หรือรันทีละขั้นตอน
npm run db:generate    # สร้าง Prisma Client
npm run db:migrate     # รัน migrations
npm run db:seed        # สร้างข้อมูลเริ่มต้น
```

### 3. ตรวจสอบการเชื่อมต่อ

```bash
# ตรวจสอบสถานะฐานข้อมูล
curl http://localhost:3000/api/health

# เปิด Prisma Studio
npm run db:studio
```

## 📊 Database Schema

### Core Entities (หน่วยงานหลัก)

#### 👥 Customer (ลูกค้า)

```sql
customers
├── id (UUID, Primary Key)
├── name (String, Required)
├── phone (String, Unique, Required)
├── address (String, Optional)
├── contactChannel (String, Required)
├── status (CustomerStatus, Default: ACTIVE)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 📋 Job (งาน/บุ๊คกิ้ง)

```sql
jobs
├── id (CUID, Primary Key)
├── customerId (String, Foreign Key)
├── serviceType (String, Required)
├── description (String, Optional)
├── status (JobStatus, Default: NEW)
├── priority (Priority, Default: MEDIUM)
├── scheduledAt (DateTime, Optional)
├── completedAt (DateTime, Optional)
├── assignedToId (String, Foreign Key, Optional)
├── n8nWorkflowId (String, Optional)
├── webhookData (JSON, Optional)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

#### 👤 User (ผู้ใช้งาน)

```sql
users
├── id (CUID, Primary Key)
├── email (String, Unique, Required)
├── password (String, Required, bcrypt hashed)
├── name (String, Required)
├── role (UserRole, Default: OPERATIONS)
├── isActive (Boolean, Default: true)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

### Quality Control System

#### ✅ QualityCheck & QualityChecklist

- `quality_checks`: การตรวจสอบคุณภาพแต่ละงาน
- `quality_checklists`: เทมเพลตเช็คลิสต์มาตรฐาน

### Training System

#### 📚 TrainingWorkflow

- ติดตามสถานะการฝึกอบรมของแต่ละงาน

### Integration System

#### 🔗 WebhookLog & FailedWebhook

- บันทึกข้อมูลจาก N8N และ LINE OA
- จัดการ webhook ที่ล้มเหลว

#### 📝 AuditLog

- บันทึกการเปลี่ยนแปลงข้อมูลสำคัญ

## 🔧 Prisma Commands

### Development Commands

```bash
# สร้าง Prisma Client
npm run db:generate

# รัน migrations (development)
npm run db:migrate

# Push schema โดยไม่สร้าง migration file
npm run db:push

# ดึง schema จากฐานข้อมูล
npm run db:pull

# จัดรูปแบบ schema.prisma
npm run db:format

# ตรวจสอบ schema
npm run db:validate

# เปิด Prisma Studio
npm run db:studio
```

### Production Commands

```bash
# รัน migrations (production)
npm run db:migrate:deploy

# รีเซ็ตฐานข้อมูล (ระวัง!)
npm run db:migrate:reset

# รีเซ็ต + seed ข้อมูลใหม่
npm run db:fresh
```

### Data Management

```bash
# Seed ข้อมูลเริ่มต้น
npm run db:seed

# ตั้งค่าฐานข้อมูลครั้งแรก
npm run db:setup
```

## 🌱 การ Seed ข้อมูล

ระบบจะสร้างข้อมูลเริ่มต้นดังนี้:

### 👥 ผู้ใช้งาน (Users)

- **Admin**: admin@tinedy.com / admin123
- **Operations**: operations1@tinedy.com / ops123
- **Training**: training@tinedy.com / training123
- **QC Manager**: qc@tinedy.com / qc123

### 🏠 ลูกค้าตัวอย่าง (Sample Customers)

- คุณสมชาย ใจดี (LINE OA)
- คุณมาลี รักงาน (LINE OA)
- บริษัท ABC จำกัด (PHONE)

### 📋 งานตัวอย่าง (Sample Jobs)

- ทำความสะอาดบ้าน (NEW)
- บริการซ่อมแซม (IN_PROGRESS)
- บริการดูแลสวน (COMPLETED)

### ✅ Quality Checklists

- เช็คลิสต์บริการทั่วไป
- เช็คลิสต์บริการทำความสะอาด

## 🔍 การ Query ข้อมูล

### ตัวอย่าง Prisma Queries

```typescript
import { prisma } from '@/lib/db'

// ค้นหาลูกค้าตามชื่อ (case-insensitive)
const customers = await prisma.customer.findMany({
  where: {
    name: {
      contains: 'สมชาย',
      mode: 'insensitive',
    },
    status: 'ACTIVE',
  },
})

// ค้นหางานพร้อมข้อมูลลูกค้า
const jobs = await prisma.job.findMany({
  include: {
    customer: true,
    assignedTo: true,
  },
  where: {
    status: {
      in: ['NEW', 'IN_PROGRESS'],
    },
  },
  orderBy: {
    priority: 'desc',
  },
})

// อัปเดตสถานะงาน
const updatedJob = await prisma.job.update({
  where: { id: jobId },
  data: {
    status: 'COMPLETED',
    completedAt: new Date(),
  },
})
```

### Raw SQL Queries

```typescript
// ใช้ raw SQL สำหรับ complex queries
const result = await prisma.$queryRaw`
  SELECT
    c.name,
    COUNT(j.id) as job_count
  FROM customers c
  LEFT JOIN jobs j ON c.id = j.customerId
  WHERE c.status = 'ACTIVE'
  GROUP BY c.id, c.name
  ORDER BY job_count DESC
`
```

## ⚡ Performance Tips

### 1. การใช้ Indexes

Schema ได้ออกแบบ indexes สำหรับ queries ที่ใช้บ่อย:

```typescript
// เร็ว - ใช้ index
const customer = await prisma.customer.findUnique({
  where: { phone: '0812345678' },
})

// เร็ว - ใช้ composite index
const jobs = await prisma.job.findMany({
  where: {
    customerId: '...',
    status: 'NEW',
  },
})
```

### 2. การใช้ Select & Include อย่างถูกต้อง

```typescript
// ดี - เลือกเฉพาะฟิลด์ที่ต้องการ
const customers = await prisma.customer.findMany({
  select: {
    id: true,
    name: true,
    phone: true,
  },
})

// ระวัง - N+1 query problem
const jobs = await prisma.job.findMany({
  include: {
    customer: true, // ใช้ include แทน separate queries
    assignedTo: true,
  },
})
```

### 3. การใช้ Pagination

```typescript
// ใช้ cursor-based pagination สำหรับข้อมูลเยอะ
const jobs = await prisma.job.findMany({
  take: 20,
  skip: 1,
  cursor: {
    id: lastJobId,
  },
  orderBy: {
    createdAt: 'desc',
  },
})
```

## 🛠️ Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. การเชื่อมต่อฐานข้อมูลล้มเหลว

```bash
# ตรวจสอบ DATABASE_URL
echo $DATABASE_URL

# ทดสอบการเชื่อมต่อ
npm run db:generate
```

#### 2. Migration ล้มเหลว

```bash
# ดูสถานะ migrations
npx prisma migrate status

# รีเซ็ต migrations (ระวัง!)
npx prisma migrate reset
```

#### 3. Schema ไม่ sync กับฐานข้อมูล

```bash
# Pull schema จากฐานข้อมูล
npm run db:pull

# หรือ push schema ไปยังฐานข้อมูล
npm run db:push
```

#### 4. Seed ข้อมูลซ้ำ

```bash
# รีเซ็ตและ seed ใหม่
npm run db:fresh
```

### การ Debug

```typescript
// เปิด query logging
import { enableQueryLogging } from '@/lib/db'

if (process.env.NODE_ENV === 'development') {
  enableQueryLogging()
}
```

### ข้อมูลการติดต่อ

หากพบปัญหาหรือต้องการความช่วยเหลือ กรุณาติดต่อทีมพัฒนา

---

📝 **อัปเดตล่าสุด**: 2025-09-28 | **เวอร์ชัน**: 1.0.0
