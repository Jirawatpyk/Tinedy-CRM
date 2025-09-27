import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 เริ่มต้นการ Seed ข้อมูลสำหรับ Tinedy CRM...')

  // =============================================================================
  // สร้างผู้ใช้งานระบบ (Users)
  // =============================================================================

  const hashedPassword = await bcrypt.hash('admin123', 12)
  const operationsPassword = await bcrypt.hash('ops123', 12)
  const trainingPassword = await bcrypt.hash('training123', 12)
  const qcPassword = await bcrypt.hash('qc123', 12)

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tinedy.com' },
    update: {},
    create: {
      email: 'admin@tinedy.com',
      name: 'ผู้ดูแลระบบ',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Operations Users
  const operationsUser1 = await prisma.user.upsert({
    where: { email: 'operations1@tinedy.com' },
    update: {},
    create: {
      email: 'operations1@tinedy.com',
      name: 'พนักงานปฏิบัติการ 1',
      password: operationsPassword,
      role: 'OPERATIONS',
    },
  })

  const operationsUser2 = await prisma.user.upsert({
    where: { email: 'operations2@tinedy.com' },
    update: {},
    create: {
      email: 'operations2@tinedy.com',
      name: 'พนักงานปฏิบัติการ 2',
      password: operationsPassword,
      role: 'OPERATIONS',
    },
  })

  // Training Team User
  const trainingUser = await prisma.user.upsert({
    where: { email: 'training@tinedy.com' },
    update: {},
    create: {
      email: 'training@tinedy.com',
      name: 'ทีมฝึกอบรม',
      password: trainingPassword,
      role: 'TRAINING',
    },
  })

  // QC Manager
  const qcManager = await prisma.user.upsert({
    where: { email: 'qc@tinedy.com' },
    update: {},
    create: {
      email: 'qc@tinedy.com',
      name: 'ผู้จัดการคุณภาพ',
      password: qcPassword,
      role: 'QC_MANAGER',
    },
  })

  console.log('✅ สร้างผู้ใช้งานระบบเสร็จสิ้น')

  // =============================================================================
  // สร้างลูกค้าตัวอย่าง (Sample Customers)
  // =============================================================================

  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { phone: '0812345678' },
      update: {},
      create: {
        name: 'คุณสมชาย ใจดี',
        phone: '0812345678',
        address: '123 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110',
        contactChannel: 'LINE_OA',
        status: 'ACTIVE',
      },
    }),
    prisma.customer.upsert({
      where: { phone: '0823456789' },
      update: {},
      create: {
        name: 'คุณมาลี รักงาน',
        phone: '0823456789',
        address: '456 ถ.พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
        contactChannel: 'LINE_OA',
        status: 'ACTIVE',
      },
    }),
    prisma.customer.upsert({
      where: { phone: '0834567890' },
      update: {},
      create: {
        name: 'บริษัท ABC จำกัด',
        phone: '0834567890',
        address: '789 ถ.สาธรใต้ แขวงทุ่งมหาเมฆ เขตสาธร กรุงเทพฯ 10120',
        contactChannel: 'PHONE',
        status: 'ACTIVE',
      },
    }),
  ])

  console.log('✅ สร้างลูกค้าตัวอย่างเสร็จสิ้น')

  // =============================================================================
  // สร้าง Quality Checklists
  // =============================================================================

  const generalServiceChecklist = await prisma.qualityChecklist.upsert({
    where: { name: 'เช็คลิสต์บริการทั่วไป' },
    update: {},
    create: {
      name: 'เช็คลิสต์บริการทั่วไป',
      description: 'เช็คลิสต์สำหรับการตรวจสอบคุณภาพบริการทั่วไป',
      items: [
        { id: 1, text: 'ตรวจสอบความพร้อมของอุปกรณ์', required: true },
        { id: 2, text: 'ยืนยันความต้องการของลูกค้า', required: true },
        { id: 3, text: 'ดำเนินการตามขั้นตอนมาตรฐาน', required: true },
        { id: 4, text: 'ตรวจสอบผลงานก่อนส่งมอบ', required: true },
        { id: 5, text: 'รับฟีดแบ็คจากลูกค้า', required: false },
      ],
      isActive: true,
    },
  })

  const cleaningServiceChecklist = await prisma.qualityChecklist.upsert({
    where: { name: 'เช็คลิสต์บริการทำความสะอาด' },
    update: {},
    create: {
      name: 'เช็คลิสต์บริการทำความสะอาด',
      description: 'เช็คลิสต์เฉพาะสำหรับบริการทำความสะอาด',
      items: [
        { id: 1, text: 'เตรียมอุปกรณ์ทำความสะอาด', required: true },
        { id: 2, text: 'ตรวจสอบพื้นที่ที่ต้องทำความสะอาด', required: true },
        { id: 3, text: 'ใช้ผลิตภัณฑ์ที่เหมาะสม', required: true },
        { id: 4, text: 'ทำความสะอาดตามลำดับขั้นตอน', required: true },
        { id: 5, text: 'ตรวจสอบผลงานหลังเสร็จสิ้น', required: true },
        { id: 6, text: 'ทำความสะอาดอุปกรณ์หลังใช้งาน', required: true },
      ],
      isActive: true,
    },
  })

  console.log('✅ สร้าง Quality Checklists เสร็จสิ้น')

  // =============================================================================
  // สร้างงานตัวอย่าง (Sample Jobs)
  // =============================================================================

  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        customerId: customers[0].id,
        serviceType: 'ทำความสะอาดบ้าน',
        description: 'ทำความสะอาดบ้าน 3 ชั้น รวมถูพื้น เช็ดฝุ่น จัดระเบียบ',
        status: 'NEW',
        priority: 'MEDIUM',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // วันพรุ่งนี้
        n8nWorkflowId: 'workflow_001',
        webhookData: {
          source: 'LINE_OA',
          messageId: 'msg_001',
          timestamp: new Date().toISOString(),
        },
      },
    }),
    prisma.job.create({
      data: {
        customerId: customers[1].id,
        serviceType: 'บริการซ่อมแซม',
        description: 'ซ่อมแซมเครื่องใช้ไฟฟ้าในบ้าน',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedToId: operationsUser1.id,
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 ชั่วโมงข้างหน้า
        n8nWorkflowId: 'workflow_002',
        webhookData: {
          source: 'LINE_OA',
          messageId: 'msg_002',
          timestamp: new Date().toISOString(),
        },
      },
    }),
    prisma.job.create({
      data: {
        customerId: customers[2].id,
        serviceType: 'บริการดูแลสวน',
        description: 'ตัดแต่งกิ่งไม้ รดน้ำต้นไม้ ใส่ปุ๋ย',
        status: 'COMPLETED',
        priority: 'LOW',
        assignedToId: operationsUser2.id,
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // เมื่อวาน
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 ชั่วโมงที่แล้ว
        n8nWorkflowId: 'workflow_003',
        webhookData: {
          source: 'PHONE',
          callId: 'call_001',
          timestamp: new Date().toISOString(),
        },
      },
    }),
  ])

  console.log('✅ สร้างงานตัวอย่างเสร็จสิ้น')

  // =============================================================================
  // สร้าง Quality Checks สำหรับงานที่เสร็จแล้ว
  // =============================================================================

  await prisma.qualityCheck.create({
    data: {
      jobId: jobs[2].id, // งานที่เสร็จแล้ว
      checklistId: cleaningServiceChecklist.id,
      status: 'PASSED',
      completedBy: qcManager.id,
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 ชั่วโมงที่แล้ว
      notes: 'งานเสร็จสิ้นตามมาตรฐาน ลูกค้าพอใจ',
    },
  })

  console.log('✅ สร้าง Quality Checks เสร็จสิ้น')

  // =============================================================================
  // สร้าง Training Workflow สำหรับงานที่กำลังดำเนินการ
  // =============================================================================

  await prisma.trainingWorkflow.create({
    data: {
      jobId: jobs[1].id, // งานที่กำลังดำเนินการ
      status: 'TRAINING_IN_PROGRESS',
      documentsReceived: true,
      trainingCompleted: false,
      notes: 'กำลังฝึกอบรมการใช้เครื่องมือใหม่',
    },
  })

  console.log('✅ สร้าง Training Workflows เสร็จสิ้น')

  // =============================================================================
  // สร้าง Webhook Logs ตัวอย่าง
  // =============================================================================

  await Promise.all([
    prisma.webhookLog.create({
      data: {
        source: 'N8N',
        workflowId: 'workflow_001',
        executionId: 'exec_001',
        payload: {
          type: 'booking_created',
          customer: { name: 'คุณสมชาย ใจดี', phone: '0812345678' },
          service: 'ทำความสะอาดบ้าน',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'PROCESSED',
        processedAt: new Date(),
        createdJobId: jobs[0].id,
      },
    }),
    prisma.webhookLog.create({
      data: {
        source: 'LINE_OA',
        workflowId: 'line_workflow_001',
        executionId: 'line_exec_001',
        payload: {
          type: 'message_received',
          userId: 'U1234567890',
          message: 'ขอจองบริการทำความสะอาด',
          timestamp: new Date().toISOString(),
        },
        status: 'PROCESSED',
        processedAt: new Date(),
        createdJobId: jobs[1].id,
      },
    }),
  ])

  console.log('✅ สร้าง Webhook Logs เสร็จสิ้น')

  // =============================================================================
  // สร้าง Audit Logs ตัวอย่าง
  // =============================================================================

  await Promise.all([
    prisma.auditLog.create({
      data: {
        entityType: 'Job',
        entityId: jobs[1].id,
        action: 'STATUS_CHANGE',
        oldValues: { status: 'NEW' },
        newValues: { status: 'IN_PROGRESS' },
        userId: admin.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        entityType: 'Job',
        entityId: jobs[2].id,
        action: 'ASSIGNMENT',
        oldValues: { assignedToId: null },
        newValues: { assignedToId: operationsUser2.id },
        userId: admin.id,
      },
    }),
  ])

  console.log('✅ สร้าง Audit Logs เสร็จสิ้น')

  // =============================================================================
  // สรุปผลการ Seed
  // =============================================================================

  const summary = {
    users: await prisma.user.count(),
    customers: await prisma.customer.count(),
    jobs: await prisma.job.count(),
    qualityChecklists: await prisma.qualityChecklist.count(),
    qualityChecks: await prisma.qualityCheck.count(),
    trainingWorkflows: await prisma.trainingWorkflow.count(),
    webhookLogs: await prisma.webhookLog.count(),
    auditLogs: await prisma.auditLog.count(),
  }

  console.log('\n🎉 การ Seed ข้อมูลเสร็จสิ้นเรียบร้อย!')
  console.log('📊 สรุปข้อมูลที่สร้าง:')
  console.log(`   👥 ผู้ใช้งาน: ${summary.users} คน`)
  console.log(`   🏠 ลูกค้า: ${summary.customers} ราย`)
  console.log(`   📋 งาน: ${summary.jobs} งาน`)
  console.log(`   ✅ เช็คลิสต์คุณภาพ: ${summary.qualityChecklists} รายการ`)
  console.log(`   🔍 การตรวจสอบคุณภาพ: ${summary.qualityChecks} ครั้ง`)
  console.log(`   📚 การฝึกอบรม: ${summary.trainingWorkflows} ครั้ง`)
  console.log(`   🔗 Webhook Logs: ${summary.webhookLogs} รายการ`)
  console.log(`   📝 Audit Logs: ${summary.auditLogs} รายการ`)
  console.log('\n🔑 ข้อมูลการเข้าสู่ระบบ:')
  console.log('   Admin: admin@tinedy.com / admin123')
  console.log('   Operations: operations1@tinedy.com / ops123')
  console.log('   Training: training@tinedy.com / training123')
  console.log('   QC Manager: qc@tinedy.com / qc123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ Seed ข้อมูล:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
