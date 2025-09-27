# 🌱 Seed Data Guide

## Overview

Tinedy CRM มี seed data scripts สำหรับการสร้างข้อมูลทดสอบและพัฒนา ระบบนี้ช่วยให้นักพัฒนาสามารถทดสอบฟีเจอร์ต่างๆ ได้อย่างรวดเร็ว

## 📋 Available Scripts

### 1. Full Seed Data (`npm run db:seed`)
สร้างข้อมูลทดสอบครบถ้วนสำหรับการพัฒนาและทดสอบ

**ข้อมูลที่สร้าง:**
- 👥 Users: 8 คน (Admin, Operations, Training, QC)
- 🏢 Customers: 15 บริษัท
- 💼 Jobs: 25 งาน (หลากหลาย status)
- 📋 Quality Checklists: 5 แบบ
- ✅ Quality Checks: ตาม jobs ที่เหมาะสม
- 🎓 Training Workflows: สำหรับงานฝึกอบรม
- 📡 Webhook Logs: จำลอง N8N integration
- 📋 Audit Logs: ประวัติการเปลี่ยนแปลง

### 2. Quick Seed (`node scripts/quick-seed.js`)
สร้างข้อมูลพื้นฐานสำหรับการพัฒนาด่วน

**ข้อมูลที่สร้าง:**
- 👥 Users: 2 คน (Admin + Operations)
- 🏢 Customers: 2 บริษัท
- 💼 Jobs: 3 งาน (NEW, IN_PROGRESS, COMPLETED)
- 📋 Quality Checklists: 1 แบบพื้นฐาน

## 🚀 Usage

### เริ่มต้นใช้งาน (แนะนำสำหรับ Development)

```bash
# 1. เตรียม database
npm run db:migrate

# 2. สร้างข้อมูลพื้นฐาน (เร็ว)
node scripts/quick-seed.js

# หรือสร้างข้อมูลครบถ้วน (ช้ากว่า)
npm run db:seed
```

### สำหรับ Testing Environment

```bash
# 1. Reset database
npm run db:migrate:reset

# 2. สร้างข้อมูลทดสอบครบถ้วน
npm run db:seed
```

### สำหรับ Production (ไม่ควรใช้ seed data)

```bash
# เฉพาะ migration เท่านั้น
npm run db:migrate:deploy
```

## 🔑 Default Login Credentials

### Quick Seed
- **Admin**: admin@tinedy.com
- **Operations**: operations@tinedy.com

### Full Seed
- **Admin**: admin@tinedy.com
- **Users**: ดูใน console output หลังรัน seed

> **หมายเหตุ**: ใน production จะใช้ NextAuth.js สำหรับการ authentication

## 📊 Sample Data Details

### Customers
- **บริษัทไทย**: ชื่อและที่อยู่เป็นภาษาไทย
- **LINE Integration**: มี LINE User ID สำหรับทดสอบ webhook
- **Contact Info**: เบอร์โทร, อีเมล, ที่อยู่
- **Status Distribution**: 80% ACTIVE, 20% อื่นๆ

### Jobs
- **Service Types**: 12 ประเภทบริการ
- **Status Distribution**: สมดุลระหว่าง NEW, IN_PROGRESS, COMPLETED
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Realistic Dates**: วันที่สมจริงตาม status

### Quality Control
- **Service-Specific Checklists**: แต่ละบริการมี checklist เฉพาะ
- **Quality Checks**: เชื่อมโยงกับงานที่เหมาะสม
- **Status Tracking**: ติดตามสถานะการตรวจสอบ

### N8N Integration
- **Webhook Logs**: จำลองข้อมูลจาก N8N workflows
- **Realistic Payloads**: โครงสร้างข้อมูลเหมือนจริง
- **Error Scenarios**: รวมกรณีที่ผิดพลาดเพื่อทดสอบ

## 🛠️ Customization

### แก้ไขจำนวนข้อมูล

แก้ไขใน `prisma/seed.ts`:

```typescript
const SEED_CONFIG: SeedDataConfig = {
  users: 8,           // จำนวนผู้ใช้
  customers: 15,      // จำนวนลูกค้า
  jobs: 25,           // จำนวนงาน
  qualityChecklists: 5, // จำนวน checklists
  cleanExisting: true   // ล้างข้อมูลเก่า
};
```

### เพิ่มข้อมูลใหม่

แก้ไขใน `lib/utils/seed-generators.ts`:

```typescript
// เพิ่มประเภทบริการใหม่
serviceTypes: [
  'การปรึกษาระบบ IT',
  'การฝึกอบรมพนักงาน',
  'บริการใหม่ของคุณ'  // เพิ่มตรงนี้
],

// เพิ่มชื่อบริษัทใหม่
companyNames: [
  'บริษัทใหม่ของคุณ จำกัด'  // เพิ่มตรงนี้
]
```

## 🚨 ข้อควรระวัง

### Development Environment
- Seed data จะ**ลบข้อมูลเก่าทั้งหมด** (ตาม `cleanExisting: true`)
- เหมาะสำหรับ development เท่านั้น

### Production Environment
- **ห้ามใช้ seed scripts ใน production**
- ใช้เฉพาะ migration scripts
- สร้างข้อมูลจริงผ่าน application

### Performance
- Full seed อาจใช้เวลา 30-60 วินาที
- Quick seed ใช้เวลาประมาณ 5-10 วินาที
- ขึ้นอยู่กับความเร็วของ database

## 🧪 Testing Scenarios

### User Roles Testing
- **Admin**: ทดสอบการจัดการระบบ
- **Operations**: ทดสอบการรับและดำเนินการงาน
- **Training**: ทดสอบ training workflows
- **QC Manager**: ทดสอบระบบควบคุมคุณภาพ

### Workflow Testing
- **Job Assignment**: ทดสอบการมอบหมายงาน
- **Status Updates**: ทดสอบการอัพเดทสถานะ
- **Quality Control**: ทดสอบกระบวนการ QC
- **Training Flow**: ทดสอบขั้นตอนการฝึกอบรม

### Integration Testing
- **N8N Webhooks**: ทดสอบการรับข้อมูลจาก N8N
- **LINE OA Data**: ทดสอบข้อมูลลูกค้าจาก LINE
- **Audit Trail**: ทดสอบการบันทึกประวัติ

## 📞 Support

หากมีปัญหาเกี่ยวกับ seed data:

1. **ตรวจสอบ database connection** ใน `.env`
2. **ตรวจสอบ Prisma schema** ด้วย `npx prisma validate`
3. **Reset database** ด้วย `npm run db:migrate:reset`
4. **ติดต่อ Database Agent (Alex)** เพื่อขอความช่วยเหลือ