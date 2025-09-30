# 🔧 Production Database Error - Story 2.6

## ปัญหาที่เกิดขึ้น
เมื่อพยายามอัปเดตสถานะงานบน Production (Vercel) เกิด **Network Error** เพราะ API ไม่สามารถ **fetch database** ได้

## API ที่มีปัญหา
```
PATCH /api/jobs/[id]
```

**ไฟล์:** `apps/crm-app/app/api/jobs/[id]/route.ts` (Line 68-190)

**Database Queries ที่ล้มเหลว:**
1. Line 82: `JobService.getJobById(id)` - ตรวจสอบว่างานมีอยู่
2. Line 162: `JobService.updateJob(id, updateData)` - อัปเดตสถานะงาน

---

## ✅ สาเหตุและวิธีแก้ไข

### 1. ❌ DATABASE_URL ไม่ได้ตั้งค่าบน Vercel

**ตรวจสอบ:**
1. ไปที่ https://vercel.com/dashboard
2. เลือกโปรเจ็ค "Tinedy CRM"
3. Settings → Environment Variables
4. ตรวจสอบว่ามี `DATABASE_URL` หรือไม่

**วิธีแก้:**
```bash
# เพิ่ม Environment Variable บน Vercel Dashboard:
Name: DATABASE_URL
Value: postgres://username:password@host:5432/database?sslmode=require

# หรือใช้ Vercel CLI:
vercel env add DATABASE_URL
```

**จากนั้น redeploy:**
```bash
git commit --allow-empty -m "Trigger redeploy after adding DATABASE_URL"
git push origin master
```

---

### 2. ❌ Prisma Client ไม่ถูก Generate ตอน Build

**ตรวจสอบ:**
ดู Vercel Build Logs ว่ามี error เกี่ยวกับ Prisma หรือไม่

**วิธีแก้:**

✅ **package.json มี script ที่ถูกต้องแล้ว:**
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && next build"
  }
}
```

แต่ต้องเพิ่ม `postinstall` script เผื่อกรณีที่ Vercel ไม่ run `vercel-build`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && next build"
  }
}
```

---

### 3. ❌ Database Connection Timeout

**ตรวจสอบ:**
Database อาจ sleep mode หรือ connection pool เต็ม

**วิธีแก้:**

ปรับ `apps/crm-app/lib/db.ts` เพื่อเพิ่ม timeout และ retry:

```typescript
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}
```

และเพิ่ม connection pooling config ใน `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // สำหรับ migrations

  // Connection pooling for Vercel
  relationMode = "prisma"
}
```

---

### 4. ❌ Vercel Deployment Protection ยังเปิดอยู่

**ตรวจสอบ:**
ลอง access production URL แล้วเจอหน้า "Authentication Required" ของ Vercel

**วิธีแก้:**
1. Vercel Dashboard → Settings → Deployment Protection
2. เปลี่ยนเป็น "Only Preview Deployments" หรือ "None"
3. Save

---

## 🧪 วิธีตรวจสอบ Error แบบละเอียด

### เปิด Browser DevTools
1. กด **F12** เปิด DevTools
2. ไปที่ Tab **Network**
3. ทดสอบเปลี่ยนสถานะงาน
4. คลิกที่ request `jobs/[id]` ที่ล้มเหลว

### ดูข้อมูล Error
**Response Tab:**
```json
{
  "error": "Internal server error" // หรือ error message อื่นๆ
}
```

**Console Tab:** จะมี error ที่ชัดเจนกว่า เช่น:
```
PrismaClientInitializationError: Can't reach database server
```

---

## 🔍 Debug Script สำหรับทดสอบ Database Connection

สร้างไฟล์ `apps/crm-app/app/api/test-db/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    // Test Job query
    const jobCount = await prisma.job.count()

    return NextResponse.json({
      success: true,
      database: 'Connected',
      jobCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
```

**ทดสอบ:**
```bash
curl https://your-app.vercel.app/api/test-db
```

---

## 📋 Checklist การแก้ไข

- [ ] 1. ตรวจสอบ DATABASE_URL บน Vercel Environment Variables
- [ ] 2. เพิ่ม `postinstall` script ใน package.json
- [ ] 3. ปิด Vercel Deployment Protection (ถ้าเปิดอยู่)
- [ ] 4. Commit และ Push เพื่อ trigger deployment ใหม่
- [ ] 5. ตรวจสอบ Vercel Build Logs ว่า `prisma generate` สำเร็จ
- [ ] 6. ทดสอบ `/api/test-db` endpoint
- [ ] 7. ทดสอบอัปเดตสถานะงานอีกครั้ง

---

## 🚀 Quick Fix Commands

```bash
# 1. เพิ่ม postinstall script
cd apps/crm-app
npm pkg set scripts.postinstall="prisma generate"

# 2. Commit และ push
git add apps/crm-app/package.json
git commit -m "Add postinstall script for Prisma Client generation"
git push origin master

# 3. ตรวจสอบ deployment บน Vercel
vercel logs https://your-app.vercel.app --yes
```

---

## 📞 ต้องการความช่วยเหลือเพิ่มเติม

หากยังแก้ไม่ได้ กรุณาส่งข้อมูลนี้มา:
1. Screenshot ของ Network tab error
2. Vercel Build Logs (10 บรรทัดสุดท้าย)
3. Environment Variables list (ไม่ต้องแสดง value)
4. Error message จาก Browser Console
