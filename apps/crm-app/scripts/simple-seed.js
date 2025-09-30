// Simple Seed Script for Testing (JavaScript version)
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple seed...')

  try {
    // Clean existing data (order matters due to foreign keys)
    await prisma.job.deleteMany()
    console.log('✅ Cleaned jobs')
    await prisma.customer.deleteMany()
    console.log('✅ Cleaned customers')
    await prisma.user.deleteMany()
    console.log('✅ Cleaned users')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.create({
      data: {
        id: 'admin-user-001',
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
        id: 'ops-user-001',
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
        id: 'cust-001',
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
        id: 'job-001',
        customerId: customer.id,
        serviceType: 'CLEANING',
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        price: 5000.0,
        status: 'NEW',
        description: 'ทำความสะอาดสำนักงาน',
        priority: 'MEDIUM',
        assignedUserId: operationsUser.id,
      },
    })
    console.log('✅ Created sample job:', job.id)

    console.log('🎉 Simple seed completed!')
    console.log('📧 Admin email: admin@tinedy.com')
    console.log('🔑 Admin password: admin123')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
