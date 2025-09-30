/**
 * Script to seed test jobs data for development
 */

import { PrismaClient, ServiceType, JobStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTestJobs() {
  console.log('🌱 Seeding test jobs data...')

  try {
    // Check if we have customers first
    const customers = await prisma.customer.findMany({
      take: 5,
      select: { id: true, name: true },
    })

    if (customers.length === 0) {
      console.log('❌ No customers found. Please seed customers first.')
      return
    }

    console.log(`📊 Found ${customers.length} customers`)

    // Check if we have operations users
    const operationsUsers = await prisma.user.findMany({
      where: { role: 'OPERATIONS', isActive: true },
      take: 3,
      select: { id: true, name: true },
    })

    console.log(`👥 Found ${operationsUsers.length} operations users`)

    // Create test jobs
    const testJobs = [
      {
        customerId: customers[0].id,
        serviceType: ServiceType.CLEANING,
        scheduledDate: new Date('2024-12-01T09:00:00Z'),
        price: 1500,
        status: JobStatus.NEW,
        description: 'ทำความสะอาดบ้าน 2 ชั้น พื้นที่ 200 ตรม.',
        notes: 'ลูกค้าต้องการทำความสะอาดอย่างละเอียด รวมถึงเฟอร์นิเจอร์',
        assignedUserId: null,
      },
      {
        customerId: customers[0].id,
        serviceType: ServiceType.CLEANING,
        scheduledDate: new Date('2024-11-15T14:00:00Z'),
        price: 2000,
        status: JobStatus.ASSIGNED,
        description: 'ทำความสะอาดออฟฟิศ พื้นที่ 150 ตรม.',
        notes: 'ห้องประชุม 2 ห้อง และพื้นที่ทำงานร่วม',
        assignedUserId:
          operationsUsers.length > 0 ? operationsUsers[0].id : null,
      },
      {
        customerId: customers[1]?.id || customers[0].id,
        serviceType: ServiceType.TRAINING,
        scheduledDate: new Date('2024-11-20T10:00:00Z'),
        price: 5000,
        status: JobStatus.IN_PROGRESS,
        description: 'อบรมการทำความสะอาดสำหรับพนักงาน',
        notes: 'อบรมกลุ่ม 15 คน เวลา 4 ชั่วโมง',
        assignedUserId:
          operationsUsers.length > 1
            ? operationsUsers[1].id
            : operationsUsers[0]?.id,
      },
      {
        customerId: customers[2]?.id || customers[0].id,
        serviceType: ServiceType.CLEANING,
        scheduledDate: new Date('2024-10-30T16:00:00Z'),
        price: 3000,
        status: JobStatus.COMPLETED,
        description: 'ทำความสะอาดร้านอาหาร',
        notes: 'ครัว ห้องน้ำ และโซนลูกค้า ทำความสะอาดเครื่องปรับอากาศด้วย',
        assignedUserId:
          operationsUsers.length > 2
            ? operationsUsers[2].id
            : operationsUsers[0]?.id,
        completedAt: new Date('2024-10-30T20:00:00Z'),
      },
      {
        customerId: customers[3]?.id || customers[0].id,
        serviceType: ServiceType.CLEANING,
        scheduledDate: new Date('2024-10-25T08:00:00Z'),
        price: 1200,
        status: JobStatus.CANCELLED,
        description: 'ทำความสะอาดคอนโด 1 ห้องนอน',
        notes: 'ลูกค้าขอยกเลิกเนื่องจากเดินทางไม่ได้',
        assignedUserId: null,
      },
    ]

    // Create jobs one by one to handle potential duplicates
    for (const jobData of testJobs) {
      try {
        const job = await prisma.job.create({
          data: jobData,
          include: {
            customer: { select: { name: true } },
            assignedUser: { select: { name: true } },
          },
        })

        console.log(
          `✅ Created job ${job.id.slice(-8)} for customer: ${job.customer.name}`
        )
      } catch (error) {
        console.log(
          `⚠️  Failed to create job for customer ${jobData.customerId}: ${error}`
        )
      }
    }

    // Show summary
    const totalJobs = await prisma.job.count()
    console.log(`\n📊 Total jobs in database: ${totalJobs}`)

    // Show some job IDs for testing
    const sampleJobs = await prisma.job.findMany({
      take: 3,
      select: { id: true, serviceType: true, status: true },
      orderBy: { createdAt: 'desc' },
    })

    console.log('\n🔗 Sample Job IDs for testing:')
    sampleJobs.forEach((job) => {
      console.log(`   📝 ${job.id} (${job.serviceType}, ${job.status})`)
      console.log(`   🌐 http://localhost:3002/jobs/${job.id}`)
    })
  } catch (error) {
    console.error('❌ Error seeding jobs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTestJobs()
