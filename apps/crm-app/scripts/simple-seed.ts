// Simple Seed Script for Testing
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple seed...')

  // Clean existing data (order matters due to foreign keys)
  await prisma.job.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleaned existing data')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tinedy.com',
      password: hashedPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Create test operations user
  const operationsPassword = await bcrypt.hash('password123', 12)
  const operationsUser = await prisma.user.create({
    data: {
      email: 'operations@tinedy.com',
      password: operationsPassword,
      name: 'พนักงานปฏิบัติการ',
      role: 'OPERATIONS',
      isActive: true,
    },
  })
  console.log('✅ Created operations user:', operationsUser.email)

  // Create sample customer
  const customer = await prisma.customer.create({
    data: {
      name: 'บริษัท ทดสอบ จำกัด',
      phone: '02-123-4567',
      address: '123 ถนนทดสอบ กรุงเทพฯ 10110',
      contactChannel: 'LINE OA',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Created sample customer:', customer.name)

  // Create sample job
  const job = await prisma.job.create({
    data: {
      customerId: customer.id,
      serviceType: 'CLEANING',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      price: 5000.0,
      status: 'NEW',
      description: 'ทำความสะอาดสำนักงาน',
      priority: 'MEDIUM',
      assignedUserId: operationsUser.id,
    },
  })
  console.log('✅ Created sample job:', job.id)

  console.log('🎉 Simple seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
