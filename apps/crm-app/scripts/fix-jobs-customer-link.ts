/**
 * Script to fix jobs customer linking for existing customer
 */

import { PrismaClient, ServiceType, JobStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function fixJobsCustomerLink() {
  console.log('🔗 Fixing jobs customer linking...')

  const TARGET_CUSTOMER_ID = '02dec1b1-b7ba-4942-9c74-6daacae965ae'

  try {
    // Check if target customer exists
    const targetCustomer = await prisma.customer.findUnique({
      where: { id: TARGET_CUSTOMER_ID },
      select: { id: true, name: true },
    })

    if (!targetCustomer) {
      console.log(`❌ Customer ${TARGET_CUSTOMER_ID} not found`)
      return
    }

    console.log(`✅ Target customer found: ${targetCustomer.name}`)

    // Check current jobs for this customer
    const currentJobs = await prisma.job.findMany({
      where: { customerId: TARGET_CUSTOMER_ID },
      select: { id: true, serviceType: true, status: true },
    })

    console.log(`📊 Current jobs for customer: ${currentJobs.length}`)

    if (currentJobs.length === 0) {
      // Get operations user for assignment
      const operationsUser = await prisma.user.findFirst({
        where: { role: 'OPERATIONS', isActive: true },
        select: { id: true, name: true },
      })

      console.log(`👥 Found operations user: ${operationsUser?.name || 'None'}`)

      // Create jobs for this specific customer
      const jobsToCreate = [
        {
          customerId: TARGET_CUSTOMER_ID,
          serviceType: ServiceType.CLEANING,
          scheduledDate: new Date('2024-12-05T10:00:00Z'),
          price: 2500,
          status: JobStatus.NEW,
          description: 'ทำความสะอาดบ้าน 3 ชั้น พื้นที่ 300 ตรม.',
          notes: 'ลูกค้าต้องการทำความสะอาดห้องครัวและห้องน้ำอย่างละเอียด',
          assignedUserId: null,
        },
        {
          customerId: TARGET_CUSTOMER_ID,
          serviceType: ServiceType.CLEANING,
          scheduledDate: new Date('2024-11-20T14:30:00Z'),
          price: 1800,
          status: JobStatus.ASSIGNED,
          description: 'ทำความสะอาดคอนโด 2 ห้องนอน',
          notes: 'รวมทำความสะอาดระเบียงและล้างผ้าม่าน',
          assignedUserId: operationsUser?.id || null,
        },
        {
          customerId: TARGET_CUSTOMER_ID,
          serviceType: ServiceType.TRAINING,
          scheduledDate: new Date('2024-11-10T09:00:00Z'),
          price: 3500,
          status: JobStatus.COMPLETED,
          description: 'อบรมการทำความสะอาดสำหรับทีมงาน',
          notes: 'อบรม 8 คน เวลา 3 ชั่วโมง เรื่องเทคนิคทำความสะอาดขั้นสูง',
          assignedUserId: operationsUser?.id || null,
          completedAt: new Date('2024-11-10T12:00:00Z'),
        },
      ]

      // Create jobs one by one
      for (const jobData of jobsToCreate) {
        try {
          const job = await prisma.job.create({
            data: jobData,
            include: {
              customer: { select: { name: true } },
            },
          })

          console.log(
            `✅ Created job ${job.id.slice(-8)} - ${job.serviceType} (${job.status})`
          )
        } catch (error) {
          console.log(`⚠️  Failed to create job: ${error}`)
        }
      }
    } else {
      console.log('✅ Customer already has jobs')
      currentJobs.forEach((job) => {
        console.log(
          `   📝 ${job.id.slice(-8)} - ${job.serviceType} (${job.status})`
        )
      })
    }

    // Final verification
    const finalJobs = await prisma.job.findMany({
      where: { customerId: TARGET_CUSTOMER_ID },
      select: {
        id: true,
        serviceType: true,
        status: true,
        scheduledDate: true,
        price: true,
      },
      orderBy: { scheduledDate: 'desc' },
    })

    console.log(
      `\n🎯 Final verification: ${finalJobs.length} jobs for customer`
    )
    finalJobs.forEach((job) => {
      console.log(`   🌐 http://localhost:3002/jobs/${job.id}`)
      console.log(`      ${job.serviceType} - ${job.status} - ${job.price} บาท`)
    })
  } catch (error) {
    console.error('❌ Error fixing customer job links:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixJobsCustomerLink()
