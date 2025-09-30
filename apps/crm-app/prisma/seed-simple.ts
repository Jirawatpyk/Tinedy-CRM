// Simple Seed Script for Tinedy CRM
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple seed...')

  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.webhookLog.deleteMany()
  await prisma.trainingWorkflow.deleteMany()
  await prisma.qualityCheck.deleteMany()
  await prisma.qualityChecklist.deleteMany()
  await prisma.job.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleaned existing data')

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12)
  const opsPassword = await bcrypt.hash('ops123', 12)

  const admin = await prisma.user.create({
    data: {
      id: 'admin-user-001',
      email: 'admin@tinedy.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const operations = await prisma.user.create({
    data: {
      id: 'operations-user-001',
      email: 'operations1@tinedy.com',
      name: 'Operations Staff',
      password: opsPassword,
      role: 'OPERATIONS',
    },
  })

  console.log('✅ Created users')

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'บริษัท เทสต์ จำกัด',
      phone: '02-123-4567',
      address: '123 ถ.สุขุมวิท กรุงเทพฯ 10110',
      contactChannel: 'LINE',
      status: 'ACTIVE',
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: 'ร้านกาแฟดี',
      phone: '081-234-5678',
      address: '456 ถ.รัชดาภิเษก กรุงเทพฯ 10400',
      contactChannel: 'PHONE',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created customers')

  // Create quality checklist
  const checklist = await prisma.qualityChecklist.create({
    data: {
      name: 'บริการทำความสะอาดมาตรฐาน',
      description: 'เช็คลิสต์มาตรฐานสำหรับงานทำความสะอาด',
      items: [
        { id: 1, item: 'ตรวจสอบอุปกรณ์', required: true },
        { id: 2, item: 'ทำความสะอาดพื้นผิว', required: true },
        { id: 3, item: 'ตรวจสอบผลงาน', required: true },
      ],
      isActive: true,
    },
  })

  console.log('✅ Created quality checklist')

  // Create jobs
  const job1 = await prisma.job.create({
    data: {
      customerId: customer1.id,
      description: 'ทำความสะอาดออฟฟิสประจำสัปดาห์',
      status: 'NEW',
      priority: 'MEDIUM',
      serviceType: 'CLEANING',
      scheduledDate: new Date('2024-09-30'),
      price: 2500.0,
      notes: 'ขอให้ระวังเอกสารสำคัญ',
    },
  })

  const job2 = await prisma.job.create({
    data: {
      customerId: customer2.id,
      description: 'ทำความสะอาดครัวและพื้นที่นั่งลูกค้า',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      serviceType: 'CLEANING',
      scheduledDate: new Date('2024-09-29'),
      price: 3500.0,
      assignedUserId: operations.id,
      notes: 'ต้องทำเสร็จก่อน 8 โมงเช้า',
    },
  })

  console.log('✅ Created jobs')

  // Create quality check
  await prisma.qualityCheck.create({
    data: {
      jobId: job2.id,
      checklistId: checklist.id,
      completedBy: operations.id,
      status: 'IN_PROGRESS',
      notes: 'อุปกรณ์พร้อม ยังคงต้องตรวจสอบอีก',
    },
  })

  console.log('✅ Created quality check')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log('👥 Users: 2')
  console.log('🏢 Customers: 2')
  console.log('📋 Jobs: 2')
  console.log('✅ Quality Checklists: 1')
  console.log('\n🔑 Login credentials:')
  console.log('Admin: admin@tinedy.com / admin123')
  console.log('Operations: operations1@tinedy.com / ops123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
