const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedStory25Templates() {
  try {
    console.log('=== Seeding Story 2.5 Checklist Templates ===\n')

    // Insert Basic Cleaning Checklist Template
    const cleaningTemplate = await prisma.checklistTemplate.upsert({
      where: { id: 'clt_cleaning_basic_001' },
      update: {},
      create: {
        id: 'clt_cleaning_basic_001',
        name: 'Basic Cleaning Checklist',
        description:
          'Standard cleaning checklist for general cleaning services',
        items: [
          'เช็ดกระจก',
          'ดูดฝุ่น',
          'ถูพื้น',
          'เช็ดโต๊ะ',
          'จัดระเบียบ',
          'ทำความสะอาดห้องน้ำ',
        ],
        serviceType: 'CLEANING',
        category: 'TEMPLATE',
        isTemplate: true,
        isActive: true,
      },
    })
    console.log('✅ Created/Updated: Basic Cleaning Checklist Template')
    console.log(`   ID: ${cleaningTemplate.id}`)
    console.log(`   Items: ${JSON.stringify(cleaningTemplate.items)}`)

    // Insert Basic Training Checklist Template
    const trainingTemplate = await prisma.checklistTemplate.upsert({
      where: { id: 'clt_training_basic_001' },
      update: {},
      create: {
        id: 'clt_training_basic_001',
        name: 'Basic Training Checklist',
        description: 'Standard training checklist for new employee training',
        items: [
          'ตรวจสอบเอกสาร',
          'อบรมเบื้องต้น',
          'ทดสอบความรู้',
          'ฝึกปฏิบัติ',
          'ประเมินผล',
          'รับรอง',
        ],
        serviceType: 'TRAINING',
        category: 'TEMPLATE',
        isTemplate: true,
        isActive: true,
      },
    })
    console.log('\n✅ Created/Updated: Basic Training Checklist Template')
    console.log(`   ID: ${trainingTemplate.id}`)
    console.log(`   Items: ${JSON.stringify(trainingTemplate.items)}`)

    // Verify templates
    console.log('\n📊 Verification:')
    const templateCount = await prisma.checklistTemplate.count({
      where: { isTemplate: true, isActive: true },
    })
    console.log(`   Total active templates: ${templateCount}`)

    console.log('\n✅ Story 2.5 template seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding templates:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

seedStory25Templates()
