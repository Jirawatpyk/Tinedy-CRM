// Seed Data Template for Tinedy CRM
// File: prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed data generation for Tinedy CRM...');

  try {
    // =======================================================================
    // CLEAN EXISTING DATA (Development only)
    // =======================================================================
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Cleaning existing data...');

      // Delete in reverse order of dependencies
      await prisma.qualityCheck.deleteMany();
      await prisma.trainingWorkflow.deleteMany();
      await prisma.job.deleteMany();
      await prisma.customer.deleteMany();
      await prisma.qualityChecklist.deleteMany();
      await prisma.user.deleteMany();
      await prisma.webhookLog.deleteMany();

      console.log('✅ Existing data cleaned');
    }

    // =======================================================================
    // CREATE USERS
    // =======================================================================
    console.log('👥 Creating users...');

    const adminUser = await prisma.user.create({
      data: {
        id: 'admin-001',
        email: 'admin@tinedy.com',
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
      },
    });

    const operationsUsers = await Promise.all([
      prisma.user.create({
        data: {
          id: 'ops-001',
          email: 'operations1@tinedy.com',
          name: 'Operations Staff 1',
          role: 'OPERATIONS',
          isActive: true,
        },
      }),
      prisma.user.create({
        data: {
          id: 'ops-002',
          email: 'operations2@tinedy.com',
          name: 'Operations Staff 2',
          role: 'OPERATIONS',
          isActive: true,
        },
      }),
    ]);

    const trainingUser = await prisma.user.create({
      data: {
        id: 'training-001',
        email: 'training@tinedy.com',
        name: 'Training Specialist',
        role: 'TRAINING',
        isActive: true,
      },
    });

    const qcUser = await prisma.user.create({
      data: {
        id: 'qc-001',
        email: 'qc@tinedy.com',
        name: 'QC Manager',
        role: 'QC_MANAGER',
        isActive: true,
      },
    });

    console.log(`✅ Created ${1 + operationsUsers.length + 2} users`);

    // =======================================================================
    // CREATE CUSTOMERS
    // =======================================================================
    console.log('🏢 Creating customers...');

    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          id: 'customer-001',
          lineUserId: 'U1234567890abcdef',
          name: 'บริษัท ABC จำกัด',
          phone: '+66-2-123-4567',
          email: 'contact@abc-company.com',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          notes: 'ลูกค้า VIP - ต้องการบริการพิเศษ',
          status: 'ACTIVE',
        },
      }),
      prisma.customer.create({
        data: {
          id: 'customer-002',
          lineUserId: 'U0987654321fedcba',
          name: 'ห้างหุ้นส่วน XYZ',
          phone: '+66-2-987-6543',
          email: 'info@xyz-partnership.com',
          address: '456 ถนนพหลโยธิน กรุงเทพฯ 10400',
          status: 'ACTIVE',
        },
      }),
      prisma.customer.create({
        data: {
          id: 'customer-003',
          lineUserId: 'U1122334455667788',
          name: 'ร้านค้าปลีก DEF',
          phone: '+66-81-555-1234',
          email: 'owner@def-retail.com',
          address: '789 ซอยรามคำแหง กรุงเทพฯ 10310',
          notes: 'ลูกค้าใหม่ - ต้องการคำแนะนำ',
          status: 'ACTIVE',
        },
      }),
      prisma.customer.create({
        data: {
          id: 'customer-004',
          lineUserId: 'U9988776655443322',
          name: 'โรงงาน GHI อุตสาหกรรม',
          phone: '+66-2-444-5555',
          email: 'factory@ghi-industrial.com',
          address: '321 ถนนกิ่งแก้ว สมุทรปราการ 10540',
          status: 'INACTIVE',
        },
      }),
    ]);

    console.log(`✅ Created ${customers.length} customers`);

    // =======================================================================
    // CREATE QUALITY CHECKLISTS
    // =======================================================================
    console.log('📋 Creating quality checklists...');

    const checklists = await Promise.all([
      prisma.qualityChecklist.create({
        data: {
          id: 'checklist-standard',
          name: 'มาตรฐานการให้บริการทั่วไป',
          description: 'เช็คลิสต์มาตรฐานสำหรับการให้บริการทุกประเภท',
          items: [
            { item: 'ตรวจสอบความถูกต้องของข้อมูลลูกค้า', required: true },
            { item: 'ยืนยันความต้องการของลูกค้า', required: true },
            { item: 'ดำเนินการให้บริการตามมาตรฐาน', required: true },
            { item: 'ตรวจสอบความพึงพอใจของลูกค้า', required: true },
            { item: 'จัดทำเอกสารสรุปการให้บริการ', required: false },
          ],
          isActive: true,
        },
      }),
      prisma.qualityChecklist.create({
        data: {
          id: 'checklist-premium',
          name: 'มาตรฐานการให้บริการระดับพรีเมียม',
          description: 'เช็คลิสต์สำหรับลูกค้า VIP และบริการพิเศษ',
          items: [
            { item: 'ตรวจสอบความถูกต้องของข้อมูลลูกค้า', required: true },
            { item: 'ยืนยันความต้องการของลูกค้า', required: true },
            { item: 'เตรียมทีมงานพิเศษ', required: true },
            { item: 'ดำเนินการให้บริการตามมาตรฐาน Premium', required: true },
            { item: 'ติดตามการให้บริการอย่างใกล้ชิด', required: true },
            { item: 'ตรวจสอบความพึงพอใจของลูกค้า', required: true },
            { item: 'จัดทำรายงานการให้บริการ', required: true },
            { item: 'ติดตามหลังการให้บริการ', required: false },
          ],
          isActive: true,
        },
      }),
      prisma.qualityChecklist.create({
        data: {
          id: 'checklist-training',
          name: 'เช็คลิสต์การฝึกอบรม',
          description: 'เช็คลิสต์สำหรับงานที่ต้องมีการฝึกอบรม',
          items: [
            { item: 'ตรวจสอบความพร้อมของผู้เข้ารับการฝึกอบรม', required: true },
            { item: 'เตรียมเอกสารการฝึกอบรม', required: true },
            { item: 'ดำเนินการฝึกอบรมตามหลักสูตร', required: true },
            { item: 'ประเมินผลการฝึกอบรม', required: true },
            { item: 'จัดทำใบประกาศนียบัตร', required: false },
          ],
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ Created ${checklists.length} quality checklists`);

    // =======================================================================
    // CREATE JOBS
    // =======================================================================
    console.log('💼 Creating jobs...');

    const jobs = await Promise.all([
      // Completed job
      prisma.job.create({
        data: {
          id: 'job-001',
          customerId: customers[0].id,
          serviceType: 'การปรึกษาทางธุรกิจ',
          description: 'ปรึกษาเรื่องการขยายธุรกิจและการจัดการองค์กร',
          status: 'COMPLETED',
          priority: 'HIGH',
          scheduledAt: new Date('2024-01-15T09:00:00Z'),
          completedAt: new Date('2024-01-15T17:00:00Z'),
          assignedToId: operationsUsers[0].id,
          n8nWorkflowId: 'workflow-123',
          webhookData: {
            source: 'LINE_OA',
            messageId: 'msg-001',
            timestamp: '2024-01-14T10:00:00Z',
          },
        },
      }),

      // In progress job
      prisma.job.create({
        data: {
          id: 'job-002',
          customerId: customers[1].id,
          serviceType: 'การฝึกอบรมพนักงาน',
          description: 'อบรมพนักงานเรื่องระบบการจัดการคุณภาพ ISO 9001',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          scheduledAt: new Date('2024-01-20T08:00:00Z'),
          assignedToId: operationsUsers[1].id,
          n8nWorkflowId: 'workflow-124',
          webhookData: {
            source: 'LINE_OA',
            messageId: 'msg-002',
            timestamp: '2024-01-18T14:30:00Z',
          },
        },
      }),

      // New job
      prisma.job.create({
        data: {
          id: 'job-003',
          customerId: customers[2].id,
          serviceType: 'การตรวจสอบและประเมิน',
          description: 'ตรวจสอบระบบการจัดการสินค้าคงคลังและให้คำแนะนำ',
          status: 'NEW',
          priority: 'MEDIUM',
          scheduledAt: new Date('2024-01-25T10:00:00Z'),
          n8nWorkflowId: 'workflow-125',
          webhookData: {
            source: 'LINE_OA',
            messageId: 'msg-003',
            timestamp: '2024-01-19T11:15:00Z',
          },
        },
      }),

      // High priority job
      prisma.job.create({
        data: {
          id: 'job-004',
          customerId: customers[0].id,
          serviceType: 'การแก้ไขปัญหาเร่งด่วน',
          description: 'แก้ไขปัญหาระบบ ERP ที่ขัดข้อง',
          status: 'NEW',
          priority: 'URGENT',
          scheduledAt: new Date('2024-01-22T08:00:00Z'),
          n8nWorkflowId: 'workflow-126',
          webhookData: {
            source: 'LINE_OA',
            messageId: 'msg-004',
            timestamp: '2024-01-21T16:45:00Z',
          },
        },
      }),
    ]);

    console.log(`✅ Created ${jobs.length} jobs`);

    // =======================================================================
    // CREATE QUALITY CHECKS
    // =======================================================================
    console.log('✅ Creating quality checks...');

    const qualityChecks = await Promise.all([
      // Completed quality check
      prisma.qualityCheck.create({
        data: {
          id: 'qc-001',
          jobId: jobs[0].id, // Completed job
          checklistId: checklists[1].id, // Premium checklist
          status: 'PASSED',
          completedBy: qcUser.id,
          completedAt: new Date('2024-01-15T18:00:00Z'),
          notes: 'ลูกค้าพึงพอใจมาก บริการตรงความต้องการ',
        },
      }),

      // In progress quality check
      prisma.qualityCheck.create({
        data: {
          id: 'qc-002',
          jobId: jobs[1].id, // In progress job
          checklistId: checklists[2].id, // Training checklist
          status: 'IN_PROGRESS',
          notes: 'อยู่ระหว่างการตรวจสอบผลการฝึกอบรม',
        },
      }),

      // Pending quality check
      prisma.qualityCheck.create({
        data: {
          id: 'qc-003',
          jobId: jobs[2].id, // New job
          checklistId: checklists[0].id, // Standard checklist
          status: 'PENDING',
        },
      }),
    ]);

    console.log(`✅ Created ${qualityChecks.length} quality checks`);

    // =======================================================================
    // CREATE TRAINING WORKFLOWS
    // =======================================================================
    console.log('🎓 Creating training workflows...');

    const trainingWorkflows = await Promise.all([
      // Completed training
      prisma.trainingWorkflow.create({
        data: {
          id: 'training-001',
          jobId: jobs[0].id, // Completed job
          status: 'COMPLETED',
          documentsReceived: true,
          trainingCompleted: true,
          notes: 'การฝึกอบรมเสร็จสิ้นเรียบร้อย ผลการประเมินดีมาก',
        },
      }),

      // In progress training
      prisma.trainingWorkflow.create({
        data: {
          id: 'training-002',
          jobId: jobs[1].id, // In progress job
          status: 'TRAINING_IN_PROGRESS',
          documentsReceived: true,
          trainingCompleted: false,
          notes: 'อยู่ระหว่างการฝึกอบรม คาดว่าจะเสร็จในสัปดาห์หน้า',
        },
      }),
    ]);

    console.log(`✅ Created ${trainingWorkflows.length} training workflows`);

    // =======================================================================
    // CREATE WEBHOOK LOGS
    // =======================================================================
    console.log('📡 Creating webhook logs...');

    const webhookLogs = await Promise.all([
      prisma.webhookLog.create({
        data: {
          id: 'webhook-001',
          source: 'N8N',
          workflowId: 'workflow-123',
          executionId: 'exec-001',
          payload: {
            customer: {
              lineUserId: 'U1234567890abcdef',
              displayName: 'บริษัท ABC จำกัด',
              phone: '+66-2-123-4567',
            },
            booking: {
              serviceType: 'การปรึกษาทางธุรกิจ',
              description: 'ปรึกษาเรื่องการขยายธุรกิจ',
              priority: 'HIGH',
            },
          },
          status: 'PROCESSED',
          processedAt: new Date('2024-01-14T10:01:00Z'),
          createdJobId: jobs[0].id,
        },
      }),

      prisma.webhookLog.create({
        data: {
          id: 'webhook-002',
          source: 'N8N',
          workflowId: 'workflow-124',
          executionId: 'exec-002',
          payload: {
            customer: {
              lineUserId: 'U0987654321fedcba',
              displayName: 'ห้างหุ้นส่วน XYZ',
            },
            booking: {
              serviceType: 'การฝึกอบรมพนักงาน',
              description: 'อบรมเรื่อง ISO 9001',
              priority: 'MEDIUM',
            },
          },
          status: 'PROCESSED',
          processedAt: new Date('2024-01-18T14:31:00Z'),
          createdJobId: jobs[1].id,
        },
      }),
    ]);

    console.log(`✅ Created ${webhookLogs.length} webhook logs`);

    // =======================================================================
    // SUMMARY
    // =======================================================================
    console.log('\n🎉 Seed data generation completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${1 + operationsUsers.length + 2}`);
    console.log(`   🏢 Customers: ${customers.length}`);
    console.log(`   📋 Quality Checklists: ${checklists.length}`);
    console.log(`   💼 Jobs: ${jobs.length}`);
    console.log(`   ✅ Quality Checks: ${qualityChecks.length}`);
    console.log(`   🎓 Training Workflows: ${trainingWorkflows.length}`);
    console.log(`   📡 Webhook Logs: ${webhookLogs.length}`);
    console.log('\n🚀 Tinedy CRM is ready for development!');

  } catch (error) {
    console.error('❌ Error during seed data generation:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

/**
 * Generate random Thai company names
 */
function generateCompanyName(): string {
  const prefixes = ['บริษัท', 'ห้างหุ้นส่วน', 'ร้าน', 'โรงงาน', 'ศูนย์'];
  const names = ['ABC', 'XYZ', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU'];
  const suffixes = ['จำกัด', 'จำกัด (มหาชน)', 'อุตสาหกรรม', 'การค้า', 'บริการ'];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return `${prefix} ${name} ${suffix}`;
}

/**
 * Generate random LINE User ID
 */
function generateLineUserId(): string {
  const chars = '0123456789abcdef';
  let result = 'U';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random phone number
 */
function generatePhoneNumber(): string {
  const prefixes = ['+66-2', '+66-81', '+66-82', '+66-83'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}-${number.toString().slice(0, 3)}-${number.toString().slice(3)}`;
}

export { generateCompanyName, generateLineUserId, generatePhoneNumber };