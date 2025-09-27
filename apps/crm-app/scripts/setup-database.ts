#!/usr/bin/env tsx

/**
 * =============================================================================
 * TINEDY CRM - DATABASE SETUP SCRIPT
 * =============================================================================
 * สคริปต์สำหรับการตั้งค่าฐานข้อมูลครั้งแรก
 * รัน: npm run db:setup หรือ tsx scripts/setup-database.ts
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import {
  checkDatabaseConnection,
  checkMigrationStatus,
  getDatabaseStats
} from '../lib/db'

const execAsync = promisify(exec)

/**
 * สีสำหรับ console output
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function colorLog(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * ตรวจสอบ environment variables ที่จำเป็น
 */
function checkEnvironmentVariables() {
  colorLog('blue', '🔍 ตรวจสอบ Environment Variables...')

  const requiredVars = ['DATABASE_URL']
  const missingVars: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    colorLog('red', `❌ ขาด Environment Variables: ${missingVars.join(', ')}`)
    colorLog('yellow', '💡 กรุณาตั้งค่าใน .env.local หรือ environment ของคุณ')
    process.exit(1)
  }

  colorLog('green', '✅ Environment Variables ครบถ้วน')
}

/**
 * รัน Prisma command และแสดงผล
 */
async function runPrismaCommand(command: string, description: string) {
  try {
    colorLog('blue', `🔄 ${description}...`)
    const { stdout, stderr } = await execAsync(`npx prisma ${command}`)

    if (stderr && !stderr.includes('warning')) {
      colorLog('yellow', `⚠️  ${stderr}`)
    }

    if (stdout) {
      console.log(stdout)
    }

    colorLog('green', `✅ ${description} เสร็จสิ้น`)
  } catch (error) {
    colorLog('red', `❌ ${description} ล้มเหลว`)
    if (error instanceof Error) {
      console.error(error.message)
    }
    throw error
  }
}

/**
 * ตั้งค่าฐานข้อมูลครั้งแรก
 */
async function setupDatabase() {
  try {
    colorLog('magenta', '🚀 เริ่มต้นการตั้งค่าฐานข้อมูล Tinedy CRM')
    colorLog('cyan', '='.repeat(60))

    // 1. ตรวจสอบ Environment Variables
    checkEnvironmentVariables()

    // 2. Generate Prisma Client
    await runPrismaCommand('generate', 'สร้าง Prisma Client')

    // 3. ตรวจสอบการเชื่อมต่อฐานข้อมูล
    colorLog('blue', '🔍 ตรวจสอบการเชื่อมต่อฐานข้อมูล...')
    const dbConnected = await checkDatabaseConnection()

    if (!dbConnected) {
      colorLog('red', '❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้')
      colorLog('yellow', '💡 กรุณาตรวจสอบ DATABASE_URL และสถานะของ database server')
      process.exit(1)
    }

    colorLog('green', '✅ เชื่อมต่อฐานข้อมูลสำเร็จ')

    // 4. ตรวจสอบสถานะ migrations
    colorLog('blue', '🔍 ตรวจสอบสถานะ migrations...')
    const migrationStatus = await checkMigrationStatus()

    if (!migrationStatus.migrated) {
      colorLog('yellow', '⚠️  พบ migrations ที่ยังไม่ได้รัน')

      // 5. รัน migrations
      await runPrismaCommand('migrate deploy', 'รัน Database Migrations')
    } else {
      colorLog('green', '✅ Migrations ทั้งหมดรันเสร็จแล้ว')
    }

    // 6. ตรวจสอบข้อมูลในฐานข้อมูล
    colorLog('blue', '🔍 ตรวจสอบข้อมูลในฐานข้อมูล...')
    const stats = await getDatabaseStats()

    colorLog('cyan', '📊 สถิติฐานข้อมูล:')
    console.log(`   👥 ผู้ใช้งาน: ${stats.users} คน`)
    console.log(`   🏠 ลูกค้า: ${stats.customers} ราย`)
    console.log(`   📋 งาน: ${stats.jobs} งาน`)
    console.log(`   ⚡ งานที่กำลังดำเนินการ: ${stats.activeJobs} งาน`)

    // 7. Seed ข้อมูลเริ่มต้น (ถ้าไม่มีข้อมูล)
    if (stats.users === 0) {
      colorLog('yellow', '📝 ไม่พบข้อมูลเริ่มต้น กำลังสร้างข้อมูลตัวอย่าง...')
      await runPrismaCommand('db seed', 'สร้างข้อมูลเริ่มต้น')

      // แสดงสถิติใหม่หลัง seed
      const newStats = await getDatabaseStats()
      colorLog('cyan', '📊 สถิติฐานข้อมูลหลัง seed:')
      console.log(`   👥 ผู้ใช้งาน: ${newStats.users} คน`)
      console.log(`   🏠 ลูกค้า: ${newStats.customers} ราย`)
      console.log(`   📋 งาน: ${newStats.jobs} งาน`)
    } else {
      colorLog('green', '✅ พบข้อมูลในฐานข้อมูลแล้ว')
    }

    // 8. สรุปผลการตั้งค่า
    colorLog('cyan', '='.repeat(60))
    colorLog('green', '🎉 การตั้งค่าฐานข้อมูลเสร็จสิ้นเรียบร้อย!')
    colorLog('cyan', '\n📝 ขั้นตอนต่อไป:')
    console.log('   1. รัน npm run dev เพื่อเริ่มต้น development server')
    console.log('   2. เข้าไปที่ http://localhost:3000/api/health เพื่อตรวจสอบสถานะ')
    console.log('   3. รัน npm run db:studio เพื่อดูข้อมูลในฐานข้อมูล')

    if (stats.users === 0) {
      colorLog('cyan', '\n🔑 ข้อมูลการเข้าสู่ระบบ:')
      console.log('   Admin: admin@tinedy.com / admin123')
      console.log('   Operations: operations1@tinedy.com / ops123')
    }

  } catch (error) {
    colorLog('red', '❌ เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล')
    console.error(error)
    process.exit(1)
  }
}

/**
 * รัน script ถ้าเรียกใช้โดยตรง
 */
if (require.main === module) {
  setupDatabase()
}