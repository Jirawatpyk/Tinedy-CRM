/**
 * =============================================================================
 * TINEDY CRM - Database Client Configuration
 * =============================================================================
 * Prisma Client สำหรับการเชื่อมต่อฐานข้อมูล Vercel Postgres
 * รองรับ Connection pooling และ Edge runtime
 */

import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * Prisma Client Configuration
 * ปรับแต่งเพื่อประสิทธิภาพและความปลอดภัย
 */
const createPrismaClient = () => {
  return new PrismaClient({
    // Logging Configuration
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],

    // Error formatting สำหรับ development
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  })
}

/**
 * Global Prisma instance สำหรับ development
 * ป้องกันการสร้าง connection หลายตัวใน development mode
 */
const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export { prisma }

/**
 * =============================================================================
 * DATABASE HEALTH CHECK FUNCTIONS
 * =============================================================================
 */

/**
 * ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

/**
 * ดึงข้อมูลสถิติฐานข้อมูล
 */
export async function getDatabaseStats() {
  try {
    const [customerCount, jobCount, userCount, activeJobCount, recentJobCount] =
      await Promise.all([
        prisma.customer.count(),
        prisma.job.count(),
        prisma.user.count(),
        prisma.job.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } }),
        prisma.job.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 วันที่แล้ว
            },
          },
        }),
      ])

    return {
      customers: customerCount,
      jobs: jobCount,
      users: userCount,
      activeJobs: activeJobCount,
      recentJobs: recentJobCount,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to get database stats:', error)
    throw error
  }
}

/**
 * =============================================================================
 * CONNECTION POOL MANAGEMENT
 * =============================================================================
 */

/**
 * ปิดการเชื่อมต่อฐานข้อมูลอย่างปลอดภัย
 * ใช้ใน API routes และ background jobs
 */
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error disconnecting from database:', error)
  }
}

/**
 * =============================================================================
 * TRANSACTION HELPERS
 * =============================================================================
 */


/**
 * =============================================================================
 * MIGRATION HELPERS
 * =============================================================================
 */

/**
 * ตรวจสอบสถานะ database migrations
 */
export async function checkMigrationStatus() {
  try {
    // ตรวจสอบว่าตาราง _prisma_migrations มีอยู่หรือไม่
    const result = (await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '_prisma_migrations'
      );
    `) as [{ exists: boolean }]

    if (!result[0]?.exists) {
      return { migrated: false, message: 'Migration table not found' }
    }

    // ตรวจสอบ migrations ที่ยังไม่ได้รัน
    const pendingMigrations = (await prisma.$queryRaw`
      SELECT migration_name
      FROM _prisma_migrations
      WHERE finished_at IS NULL;
    `) as Array<{ migration_name: string }>

    return {
      migrated: pendingMigrations.length === 0,
      pendingMigrations: pendingMigrations.map((m) => m.migration_name),
      message:
        pendingMigrations.length === 0
          ? 'All migrations completed'
          : `${pendingMigrations.length} pending migrations`,
    }
  } catch (error) {
    console.error('Error checking migration status:', error)
    return { migrated: false, message: 'Error checking migrations' }
  }
}

/**
 * =============================================================================
 * PERFORMANCE MONITORING
 * =============================================================================
 */

/**
 * Monitor database query performance
 */
export function enableQueryLogging() {
  if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e: any) => {
      console.log(`Query: ${e.query}`)
      console.log(`Duration: ${e.duration}ms`)
      console.log(`Params: ${e.params}`)
      console.log('---')
    })
  }
}

/**
 * =============================================================================
 * EXPORT DEFAULT INSTANCE
 * =============================================================================
 */

export default prisma
