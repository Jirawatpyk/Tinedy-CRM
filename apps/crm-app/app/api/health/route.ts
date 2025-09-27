/**
 * =============================================================================
 * API HEALTH CHECK ENDPOINT
 * =============================================================================
 * ตรวจสอบสถานะของระบบและฐานข้อมูล
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  checkDatabaseConnection,
  getDatabaseStats,
  checkMigrationStatus
} from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    // ตรวจสอบการเชื่อมต่อฐานข้อมูล
    const dbConnected = await checkDatabaseConnection()

    if (!dbConnected) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection failed',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // ดึงข้อมูลสถิติและสถานะ migrations แบบ parallel
    const [dbStats, migrationStatus] = await Promise.all([
      getDatabaseStats().catch(error => ({ error: error.message })),
      checkMigrationStatus().catch(error => ({ error: error.message }))
    ])

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'healthy',
      message: 'System is operational',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: dbConnected,
        stats: dbStats,
        migrations: migrationStatus
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        runtime: 'edge'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// สำหรับ HEAD request (load balancer health checks)
export async function HEAD() {
  try {
    const dbConnected = await checkDatabaseConnection()

    if (!dbConnected) {
      return new NextResponse(null, { status: 503 })
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}