/**
 * =============================================================================
 * TINEDY CRM - Database Client Configuration
 * =============================================================================
 * Prisma Client สำหรับการเชื่อมต่อฐานข้อมูล Vercel Postgres
 * รองรับ Connection pooling และ Edge runtime
 */

import { PrismaClient, type Prisma } from '@prisma/client'

// Re-export Prisma types and enums for convenient imports
export type { Prisma }
export { JobStatus, UserRole, CustomerStatus } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * Prisma Client Configuration
 * ปรับแต่งเพื่อประสิทธิภาพและความปลอดภัย
 */
const createPrismaClient = () => {
  const baseConfig = {
    // Logging Configuration - Optimized for production
    log:
      process.env.NODE_ENV === 'development'
        ? (['query', 'info', 'warn', 'error'] as Prisma.LogLevel[])
        : (['error'] as Prisma.LogLevel[]), // Only errors in production for performance

    // Error formatting สำหรับ development
    errorFormat: (process.env.NODE_ENV === 'development'
      ? 'pretty'
      : 'minimal') as 'pretty' | 'minimal',

    // Connection optimization for Vercel Postgres
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }

  // Only add internal config for production to avoid type issues
  if (process.env.NODE_ENV === 'production') {
    // @ts-ignore - Internal config for production optimization
    baseConfig.__internal = {
      engine: {
        connectTimeout: 5000, // 5 seconds
        queryTimeout: 30000, // 30 seconds for complex queries
        pool: {
          min: 1, // Minimum connections
          max: 10, // Maximum connections for Vercel
          idleTimeout: 30000, // 30 seconds idle timeout
        },
      },
    }
  }

  return new PrismaClient(baseConfig)
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
 * ดึงข้อมูลสถิติฐานข้อมูลแบบ optimized สำหรับ health check
 */
export async function getDatabaseStats() {
  try {
    // ใช้ PostgreSQL table statistics สำหรับ quick estimates
    const statsQuery = await prisma.$queryRaw<
      Array<{
        table_name: string
        row_estimate: number
      }>
    >`
      SELECT
        schemaname||'.'||tablename as table_name,
        COALESCE(n_tup_ins - n_tup_del, 0) as row_estimate
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND tablename IN ('Customer', 'Job', 'User')
      ORDER BY table_name
    `

    // เฉพาะข้อมูลที่จำเป็นต้องมีความแม่นยำ ถึงจะใช้ count()
    const [activeJobCount, recentJobCount] = await Promise.all([
      prisma.job.count({
        where: { status: { in: ['NEW', 'IN_PROGRESS', 'ASSIGNED'] } },
      }),
      // ใช้ indexed field สำหรับ recent jobs
      prisma.job.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    // แปลง stats เป็น object สำหรับ response
    const tableStats = statsQuery.reduce(
      (acc, stat) => {
        const tableName = stat.table_name.split('.')[1].toLowerCase()
        acc[tableName + 's'] = stat.row_estimate || 0
        return acc
      },
      {} as Record<string, number>
    )

    return {
      customers: tableStats.customers || 0,
      jobs: tableStats.jobs || 0,
      users: tableStats.users || 0,
      activeJobs: activeJobCount,
      recentJobs: recentJobCount,
      timestamp: new Date().toISOString(),
      note: 'Using PostgreSQL statistics for fast estimates',
    }
  } catch (error) {
    console.error('Failed to get database stats:', error)
    throw error
  }
}

/**
 * ดึงข้อมูลสถิติฐานข้อมูลแบบเบา สำหรับ health check
 */
export async function getLightweightDatabaseStats() {
  try {
    // เฉพาะข้อมูลที่จำเป็นที่สุดสำหรับ health check
    const activeJobCount = await prisma.job.count({
      where: { status: { in: ['NEW', 'IN_PROGRESS'] } },
    })

    return {
      activeJobs: activeJobCount,
      timestamp: new Date().toISOString(),
      healthCheck: true,
    }
  } catch (error) {
    console.error('Failed to get lightweight database stats:', error)
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
 * QUERY RESULT CACHING
 * =============================================================================
 */

// Simple in-memory cache for frequently accessed data
const queryCache = new Map<string, { data: any; expiry: number }>()

/**
 * Cache query results with TTL
 */
export function cacheQueryResult(
  key: string,
  data: any,
  ttlSeconds: number = 300 // 5 minutes default
) {
  const expiry = Date.now() + ttlSeconds * 1000
  queryCache.set(key, { data, expiry })
}

/**
 * Get cached query result if not expired
 */
export function getCachedQueryResult(key: string): any | null {
  const cached = queryCache.get(key)
  if (!cached) return null

  if (Date.now() > cached.expiry) {
    queryCache.delete(key)
    return null
  }

  return cached.data
}

/**
 * Clear cache by pattern or specific key
 */
export function clearQueryCache(pattern?: string) {
  if (!pattern) {
    queryCache.clear()
    return
  }

  for (const key of Array.from(queryCache.keys())) {
    if (key.includes(pattern)) {
      queryCache.delete(key)
    }
  }
}

/**
 * Cached customer count for dashboard
 */
export async function getCachedCustomerStats() {
  const cacheKey = 'customer-stats'
  const cached = getCachedQueryResult(cacheKey)

  if (cached) return cached

  const stats = {
    total: await prisma.customer.count(),
    active: await prisma.customer.count({ where: { status: 'ACTIVE' } }),
    recent: await prisma.customer.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  }

  cacheQueryResult(cacheKey, stats, 600) // Cache for 10 minutes
  return stats
}

/**
 * =============================================================================
 * PERFORMANCE MONITORING
 * =============================================================================
 */

/**
 * Monitor database query performance - Disabled for build compatibility
 */
// export function enableQueryLogging() {
//   if (process.env.NODE_ENV === 'development') {
//     prisma.$on('query', (e: any) => {
//       console.log(`Query: ${e.query}`)
//       console.log(`Duration: ${e.duration}ms`)
//       console.log(`Params: ${e.params}`)
//       console.log('---')
//     })
//   }
// }

/**
 * =============================================================================
 * EXPORT DEFAULT INSTANCE
 * =============================================================================
 */

export default prisma
