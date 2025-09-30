# 🗄️ Vercel Database Setup Guide - Tinedy CRM

## ปัญหาที่เกิดขึ้น

หน้า Jobs แสดง error:
```
NetworkError when attempting to fetch resource.
```

**สาเหตุ:** Vercel deployment ไม่มี `DATABASE_URL` environment variable ทำให้ไม่สามารถเชื่อมต่อ database ได้

---

## ✅ วิธีแก้ไข: ตั้งค่า Vercel Postgres Database

### ขั้นตอนที่ 1: สร้าง Vercel Postgres Database

1. **ไปที่ Vercel Dashboard**
   - https://vercel.com/dashboard

2. **เลือกโปรเจ็ค Tinedy CRM**
   - คลิกที่โปรเจ็คของคุณ

3. **ไปที่ Storage Tab**
   - คลิก **Storage** ที่ navigation bar ด้านบน
   - หรือไปที่ https://vercel.com/jirawatpyk-4879/tinedy-crm/stores

4. **สร้าง Postgres Database**
   - คลิก **"Create Database"**
   - เลือก **"Postgres"**
   - ตั้งชื่อ database: `tinedy-crm-production`
   - เลือก region ที่ใกล้ที่สุด (เช่น Singapore)
   - คลิก **"Create"**

5. **เชื่อมต่อ Database กับ Project**
   - หลังจากสร้างเสร็จ จะมีหน้า "Connect to Project"
   - เลือกโปรเจ็ค **Tinedy CRM**
   - คลิก **"Connect"**

**Vercel จะตั้งค่า environment variables เหล่านี้ให้อัตโนมัติ:**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` ← **ใช้ตัวนี้สำหรับ Prisma**
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

---

### ขั้นตอนที่ 2: เพิ่ม DATABASE_URL Environment Variable

**วิธีที่ 1: ใช้ POSTGRES_PRISMA_URL ที่ Vercel สร้างให้ (แนะนำ)**

1. ไปที่ **Settings → Environment Variables**
2. คลิก **"Add New"**
3. กรอก:
   ```
   Name: DATABASE_URL
   Value: (คัดลอกค่าจาก POSTGRES_PRISMA_URL)
   ```
4. เลือก environment: **Production, Preview, Development** (ทุกอัน)
5. คลิก **"Save"**

**วิธีที่ 2: ใช้ Connection String เต็ม**

1. ไปที่ Storage → Postgres database → Connect
2. คัดลอก **Prisma URL**
3. ไปที่ **Settings → Environment Variables**
4. เพิ่ม:
   ```
   Name: DATABASE_URL
   Value: postgres://default:xxxxx@ep-xxxxx-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
   ```

---

### ขั้นตอนที่ 3: Run Database Migrations

**สำคัญ!** ต้อง migrate database schema ไปยัง Vercel Postgres

**วิธีที่ 1: ใช้ Vercel CLI (แนะนำ)**

```bash
# 1. Link project กับ Vercel
vercel link

# 2. Pull environment variables
vercel env pull .env.vercel

# 3. Run migration
cd apps/crm-app
DATABASE_URL="<POSTGRES_PRISMA_URL>" npx prisma migrate deploy

# หรือ
npx prisma db push
```

**วิธีที่ 2: ใช้ GitHub Actions / Vercel Build Hook**

สร้าง file `.github/workflows/migrate.yml`:

```yaml
name: Database Migration

on:
  push:
    branches: [master]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd apps/crm-app
          npm install

      - name: Run Prisma migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd apps/crm-app
          npx prisma migrate deploy
```

**วิธีที่ 3: Manual Migration ผ่าน Vercel Postgres Console**

1. ไปที่ Storage → Postgres → **Data** tab
2. คลิก **"Query"**
3. รันคำสั่ง SQL จาก migration files

---

### ขั้นตอนที่ 4: Seed Database (Optional)

หลังจาก migrate แล้ว ต้องเพิ่มข้อมูล admin user:

```bash
# Local
DATABASE_URL="<POSTGRES_PRISMA_URL>" npx tsx apps/crm-app/scripts/create-admin.ts

# หรือรัน seed script
DATABASE_URL="<POSTGRES_PRISMA_URL>" npx tsx apps/crm-app/prisma/seed-simple.ts
```

---

### ขั้นตอนที่ 5: Redeploy Vercel

หลังจากตั้งค่า DATABASE_URL แล้ว ต้อง redeploy:

```bash
# Trigger redeploy
git commit --allow-empty -m "Trigger redeploy after database setup"
git push origin master
```

หรือใช้ Vercel Dashboard:
- Deployments → คลิก deployment ล่าสุด → คลิก **"Redeploy"**

---

## 🧪 ทดสอบการเชื่อมต่อ Database

### ทดสอบผ่าน API Endpoint

สร้าง `apps/crm-app/app/api/health/db/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    const counts = await prisma.$transaction([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.job.count()
    ])

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      counts: {
        users: counts[0],
        customers: counts[1],
        jobs: counts[2]
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

**ทดสอบ:**
```bash
curl https://crm-jvgi3ai8z-jirawatpyk-4879s-projects.vercel.app/api/health/db
```

---

## 🔍 Troubleshooting

### Error: "Can't reach database server"

**สาเหตุ:**
- DATABASE_URL ไม่ถูกต้อง
- Database ไม่อยู่ใน region เดียวกับ Vercel deployment

**วิธีแก้:**
1. ตรวจสอบ DATABASE_URL ว่าถูกต้อง
2. ตรวจสอบว่า database region ใกล้กับ Vercel deployment region
3. ลองใช้ `POSTGRES_URL_NON_POOLING` แทน

### Error: "relation does not exist"

**สาเหตุ:** Schema ยังไม่ถูก migrate

**วิธีแก้:**
```bash
npx prisma db push
# หรือ
npx prisma migrate deploy
```

### Error: "SSL connection required"

**สาเหตุ:** Missing `?sslmode=require` ใน connection string

**วิธีแก้:**
```
DATABASE_URL="postgres://...?sslmode=require"
```

---

## 📋 Checklist

- [ ] สร้าง Vercel Postgres Database
- [ ] Connect database กับ project
- [ ] เพิ่ม DATABASE_URL environment variable
- [ ] Run database migrations (`prisma migrate deploy`)
- [ ] Seed database (create admin user)
- [ ] Redeploy Vercel
- [ ] ทดสอบ `/api/health/db` endpoint
- [ ] ทดสอบหน้า Jobs ใน production

---

## 🚀 Quick Setup Commands

```bash
# 1. Link to Vercel
vercel link

# 2. Pull environment variables
vercel env pull .env.vercel

# 3. Migrate database
cd apps/crm-app
source ../.env.vercel  # หรือ copy DATABASE_URL manually
npx prisma migrate deploy

# 4. Create admin user
npx tsx scripts/create-admin.ts

# 5. Trigger redeploy
git commit --allow-empty -m "Database setup complete"
git push origin master
```

---

## 💡 Best Practices

1. **ใช้ Connection Pooling:** `POSTGRES_PRISMA_URL` มี pgbouncer pooling
2. **Set Connection Limits:** Vercel Hobby plan จำกัด 60 concurrent connections
3. **Enable SSL:** ใช้ `?sslmode=require` เสมอ
4. **Monitor Database:** ดู metrics ใน Vercel Storage dashboard
5. **Backup Data:** Vercel Postgres มี automatic backups

---

## 📞 ต้องการความช่วยเหลือ?

หากยังมีปัญหา กรุณาส่งข้อมูลนี้มา:
1. Screenshot ของ Vercel Storage dashboard
2. Environment Variables list (ซ่อน values)
3. Error message จาก browser console
4. Vercel deployment logs
