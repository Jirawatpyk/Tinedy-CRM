/**
 * =============================================================================
 * PERFORMANCE METRICS API ENDPOINT
 * =============================================================================
 * ติดตาม performance ของ database queries และ system metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()

    // Performance metrics collection
    const metrics = {
      database: await getDatabaseMetrics(),
      queries: await getQueryPerformanceMetrics(),
      cache: getCacheMetrics(),
      system: {
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      },
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error collecting performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    )
  }
}

/**
 * Database performance metrics
 */
async function getDatabaseMetrics() {
  const start = Date.now()

  try {
    // Test key database operations with timing
    const customerSearchTime = await timeQuery('customer-search', () =>
      prisma.customer.findMany({
        where: { status: 'ACTIVE' },
        take: 10,
        select: { id: true, name: true, phone: true },
      })
    )

    const jobCountTime = await timeQuery('job-count', () =>
      prisma.job.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } })
    )

    const complexJoinTime = await timeQuery('complex-join', () =>
      prisma.job.findMany({
        where: { status: 'NEW' },
        include: { customer: { select: { name: true, phone: true } } },
        take: 5,
      })
    )

    return {
      customerSearchMs: customerSearchTime,
      jobCountMs: jobCountTime,
      complexJoinMs: complexJoinTime,
      totalMs: Date.now() - start,
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Query performance tracking
 */
const queryTimes = new Map<string, number[]>()

async function timeQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<number> {
  const start = Date.now()
  await queryFn()
  const duration = Date.now() - start

  // Track query times for averaging
  if (!queryTimes.has(queryName)) {
    queryTimes.set(queryName, [])
  }
  const times = queryTimes.get(queryName)!
  times.push(duration)

  // Keep only last 10 measurements
  if (times.length > 10) {
    times.shift()
  }

  return duration
}

/**
 * Get query performance statistics
 */
async function getQueryPerformanceMetrics() {
  const metrics: Record<string, any> = {}

  for (const [queryName, times] of Array.from(queryTimes.entries())) {
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      const min = Math.min(...times)
      const max = Math.max(...times)

      metrics[queryName] = {
        averageMs: Math.round(avg),
        minMs: min,
        maxMs: max,
        samples: times.length,
      }
    }
  }

  return metrics
}

/**
 * Cache performance metrics
 */
function getCacheMetrics() {
  // These would be imported from db.ts if cache was exported
  return {
    message:
      'Cache metrics placeholder - implement based on actual cache usage',
    // hits: cacheHits,
    // misses: cacheMisses,
    // hitRate: cacheHits / (cacheHits + cacheMisses)
  }
}

/**
 * Clear performance tracking data
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    queryTimes.clear()

    return NextResponse.json({ message: 'Performance metrics cleared' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear metrics' },
      { status: 500 }
    )
  }
}
