# Deployment Setup Guide

## 🚀 Vercel Deployment Configuration

### 1. GitHub Secrets Setup

ไปที่ GitHub Repository Settings > Secrets and variables > Actions แล้วเพิ่ม secrets ต่อไปนี้:

```bash
# Vercel Integration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# NextAuth
NEXTAUTH_SECRET=your-32-char-secret-minimum
NEXTAUTH_URL=https://your-domain.vercel.app

# N8N Integration
N8N_WEBHOOK_SECRET=your-webhook-secret
N8N_API_URL=https://your-n8n-instance.com/api
N8N_API_KEY=your-n8n-api-key

# Optional Services
SENTRY_DSN=your-sentry-dsn
```

### 2. Vercel Environment Variables

ตั้งค่าใน Vercel Dashboard > Project Settings > Environment Variables:

#### Production Environment
```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:password@host:5432/tinedy_prod
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
```

#### Preview/Staging Environment
```bash
NODE_ENV=development
DATABASE_URL=postgresql://dev_user:password@host:5432/tinedy_staging
NEXTAUTH_URL=https://your-preview-domain.vercel.app
NEXTAUTH_SECRET=your-staging-secret
```

### 3. Package.json Scripts

เพิ่ม scripts เหล่านี้ใน package.json:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

## 🔧 CI/CD Workflow Configuration

### Branch Strategy

- **main**: Production deployments
- **develop**: Staging deployments
- **feature/***: Preview deployments for PRs

### Deployment Flow

1. **Feature Development**
   ```
   feature/new-feature → Preview deployment
   ```

2. **Staging Release**
   ```
   feature/new-feature → develop → Staging deployment
   ```

3. **Production Release**
   ```
   develop → main → Production deployment
   ```

### Automatic Deployments

- ✅ **Push to develop** → Deploy to staging
- ✅ **Push to main** → Deploy to production
- ✅ **Pull Request** → Create preview deployment
- ✅ **All branches** → Run tests and quality checks

## 🗄️ Database Migration Strategy

### Development Environment
```bash
# Create migration
npx prisma migrate dev --name feature_name

# Apply migration
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### Production Environment
```bash
# Auto-deploy migrations
# (included in CI/CD pipeline)
npx prisma migrate deploy
```

### Migration Checklist
- [ ] Test migration in development
- [ ] Create backup of production database
- [ ] Test migration in staging
- [ ] Deploy to production during low-traffic hours
- [ ] Verify data integrity post-migration

## 📊 Monitoring & Health Checks

### Health Check Endpoint
สร้าง API endpoint สำหรับ health check:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      error: 'Database connection failed'
    }, { status: 500 });
  }
}
```

### Monitoring Setup

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor performance metrics

2. **Error Tracking** (Sentry)
   ```bash
   npm install @sentry/nextjs
   ```

3. **Uptime Monitoring**
   - Use external service (UptimeRobot, Pingdom)
   - Monitor `/api/health` endpoint

## 🔒 Security Configuration

### Environment Security
- ✅ Never commit `.env` files
- ✅ Use different secrets for each environment
- ✅ Rotate secrets regularly
- ✅ Use Vercel environment variables

### API Security
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rate limiting
  // CORS headers
  // Authentication checks
  return NextResponse.next();
}
```

### Headers Configuration
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

## 🚨 Troubleshooting Common Issues

### Build Failures

1. **TypeScript Errors**
   ```bash
   npm run type-check
   # Fix type errors before deploying
   ```

2. **Missing Environment Variables**
   ```bash
   # Check .env.example for required variables
   # Verify Vercel environment variables
   ```

3. **Prisma Issues**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

### Runtime Issues

1. **Database Connection**
   - Check DATABASE_URL format
   - Verify database server accessibility
   - Check connection limits

2. **Authentication Issues**
   - Verify NEXTAUTH_SECRET length (min 32 chars)
   - Check NEXTAUTH_URL matches deployment URL
   - Verify OAuth provider configuration

3. **API Failures**
   - Check API route implementations
   - Verify external service connectivity
   - Review error logs in Vercel dashboard

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint checks passed
- [ ] Prettier formatting applied
- [ ] Build successful locally

### Environment Setup
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] External services accessible
- [ ] Secrets properly configured

### Security
- [ ] No hardcoded secrets
- [ ] Proper authentication setup
- [ ] CORS configuration correct
- [ ] Security headers configured

### Monitoring
- [ ] Health check endpoint working
- [ ] Error tracking configured
- [ ] Performance monitoring setup
- [ ] Uptime monitoring configured

## 🔄 Rollback Procedures

### Quick Rollback (Vercel)
1. Go to Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"

### Database Rollback
1. Stop application
2. Restore database backup
3. Revert to previous code version
4. Restart application

### Emergency Contact
- **DevOps Lead**: [Contact Info]
- **Database Admin**: [Contact Info]
- **Product Owner**: [Contact Info]

---

## 📞 Support Commands

```bash
# Quick deployment
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Environment variables
vercel env ls
vercel env add VARIABLE_NAME

# Database operations
npx prisma studio
npx prisma migrate status
npx prisma db seed
```

**หมายเหตุ**: อัปเดตไฟล์นี้ทุกครั้งที่มีการเปลี่ยนแปลง deployment configuration