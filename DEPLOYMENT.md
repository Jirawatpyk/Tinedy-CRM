# 🚀 คู่มือการ Deploy Tinedy CRM บน Vercel

## ✅ สถานะความพร้อม Deployment

**ระบบ Tinedy CRM พร้อมสำหรับการ deploy แล้ว!**

### การตรวจสอบที่ทำแล้ว:
- ✅ โครงสร้าง Monorepo สำหรับ Vercel
- ✅ Build configuration (Next.js 14+)
- ✅ Database configuration (Prisma + PostgreSQL)
- ✅ Environment variables setup
- ✅ Security headers และ optimizations
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ TypeScript และ ESLint configuration

---

## 📋 ขั้นตอนการ Deploy

### 1. **เตรียม Vercel Postgres Database**

```bash
# 1. เข้าสู่ Vercel Dashboard
# 2. สร้าง Project ใหม่หรือเลือก Project ที่มี
# 3. ไปที่ Storage tab
# 4. สร้าง Postgres Database
# 5. คัดลอก DATABASE_URL
```

### 2. **ตั้งค่า Environment Variables บน Vercel**

เข้าไปที่ **Vercel Dashboard → Project → Settings → Environment Variables** และเพิ่ม:

```bash
# Required - Database
DATABASE_URL=your_vercel_postgres_url

# Required - Authentication
NEXTAUTH_SECRET=your_generated_secret_32_chars
NEXTAUTH_URL=https://your-app.vercel.app

# Optional - N8N Integration
N8N_WEBHOOK_SECRET=your_n8n_secret
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key

# Optional - LINE OA
LINE_CHANNEL_ACCESS_TOKEN=your_line_token
LINE_CHANNEL_SECRET=your_line_secret

# Production Settings
NODE_ENV=production
```

### 3. **Deploy ผ่าน Vercel Dashboard**

#### Option A: Connect GitHub Repository
```bash
1. ไปที่ Vercel Dashboard
2. คลิก "New Project"
3. Import จาก GitHub repository
4. เลือก Root Directory: apps/crm-app
5. คลิก "Deploy"
```

#### Option B: Deploy ผ่าน Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd apps/crm-app
vercel

# สำหรับ production
vercel --prod
```

### 4. **Migration Database**

หลังจาก deploy แล้ว ให้รัน migration:

```bash
# ใน Vercel Dashboard → Project → Functions tab
# หรือใช้ Vercel CLI
vercel env pull .env.local
pnpm db:migrate:deploy
```

### 5. **Seed Initial Data (Optional)**

```bash
# รัน seed script เพื่อใส่ข้อมูลเริ่มต้น
pnpm db:seed
```

---

## 🔧 การกำหนดค่าพิเศษ

### **Vercel Project Settings**

ไฟล์ `vercel.json` ได้ถูกกำหนดค่าไว้แล้วสำหรับ:
- Monorepo structure
- API routes optimization
- Security headers
- Environment variables

### **Database Optimization**

- Prisma schema พร้อม indexes สำหรับประสิทธิภาพ
- Connection pooling configuration
- Query optimization

### **Security Features**

- Security headers ใน Next.js config
- API rate limiting
- Input validation
- Authentication middleware

---

## 📊 การตรวจสอบหลัง Deploy

### 1. **Health Check**
```bash
curl https://your-app.vercel.app/api/health
```

### 2. **Database Connection**
```bash
# ตรวจสอบผ่าน Prisma Studio
pnpm db:studio
```

### 3. **Authentication Test**
- เข้าสู่ระบบที่ `/login`
- ทดสอบ protected routes

---

## 🔄 CI/CD Pipeline

GitHub Actions จะทำงานอัตโนมัติเมื่อ:

### **Push to `develop` branch:**
- ✅ Code quality checks
- ✅ Unit tests
- ✅ Build test
- ✅ Deploy to staging

### **Push to `master` branch:**
- ✅ ทุกขั้นตอนของ develop
- ✅ E2E tests
- ✅ Security scan
- ✅ Deploy to production

---

## 🛠️ การแก้ปัญหาที่อาจพบ

### **Build Errors**
```bash
# ลบ cache และ rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### **Database Connection Issues**
```bash
# ตรวจสอบ DATABASE_URL
# ตรวจสอบ Vercel Postgres connection limits
```

### **Environment Variables**
```bash
# ตรวจสอบใน Vercel Dashboard
# ทุก environment variables ต้องไม่มี trailing spaces
```

---

## 📝 Next Steps หลัง Deploy

1. **Setup Domain** - เชื่อมต่อ custom domain
2. **Monitoring** - ติดตั้ง error tracking (Sentry)
3. **Analytics** - เพิ่ม Vercel Analytics
4. **Database Backup** - ตั้งค่า automatic backup
5. **Performance** - ติดตาม Web Vitals

---

## 🆘 Support

หากมีปัญหาในการ deploy:

1. ตรวจสอบ Vercel Function Logs
2. ตรวจสอบ GitHub Actions logs
3. ทดสอบ local build ก่อน deploy
4. ตรวจสอบ environment variables

---

**🎉 ขอแสดงความยินดี! ระบบ Tinedy CRM พร้อมใช้งานแล้ว**