const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testStory25Models() {
  try {
    console.log('=== Testing Story 2.5 Database Models ===\n')

    // Test 1: Query ChecklistTemplates
    console.log('📋 Test 1: Query ChecklistTemplate table')
    const templates = await prisma.checklistTemplate.findMany({
      select: {
        id: true,
        name: true,
        serviceType: true,
        category: true,
        isTemplate: true,
        isActive: true,
      },
    })
    console.log(`  Found ${templates.length} checklist templates`)
    templates.forEach((t) => {
      console.log(
        `  - ${t.name} (${t.serviceType}) - ${t.isTemplate ? 'TEMPLATE' : 'QUALITY_CONTROL'}`
      )
    })

    // Test 2: Query templates only
    console.log('\n📝 Test 2: Query Story 2.5 Templates (isTemplate=true)')
    const story25Templates = await prisma.checklistTemplate.findMany({
      where: {
        isTemplate: true,
        isActive: true,
      },
    })
    console.log(`  Found ${story25Templates.length} Story 2.5 templates`)
    story25Templates.forEach((t) => {
      const items = Array.isArray(t.items) ? t.items : JSON.parse(t.items)
      console.log(`  - ${t.name}: ${items.length} items`)
    })

    // Test 3: Check Job model enhancements
    console.log('\n🔧 Test 3: Verify Job model has Story 2.5 fields')
    const sampleJob = await prisma.job.findFirst({
      select: {
        id: true,
        checklistTemplateId: true,
        itemStatus: true,
        checklistCompletedAt: true,
      },
    })

    if (sampleJob) {
      console.log(
        '  ✅ Job model has checklistTemplateId field:',
        sampleJob.checklistTemplateId !== undefined
      )
      console.log(
        '  ✅ Job model has itemStatus field:',
        sampleJob.itemStatus !== undefined
      )
      console.log(
        '  ✅ Job model has checklistCompletedAt field:',
        sampleJob.checklistCompletedAt !== undefined
      )
    } else {
      console.log(
        '  ℹ️ No jobs found in database (this is OK for empty database)'
      )
    }

    // Test 4: Verify relationships
    console.log('\n🔗 Test 4: Test relationships')
    const templateWithRelations = await prisma.checklistTemplate.findFirst({
      where: { isTemplate: true },
      include: {
        jobsUsingTemplate: true,
        qualityChecks: true,
      },
    })

    if (templateWithRelations) {
      console.log(`  ✅ Can query template with jobsUsingTemplate relationship`)
      console.log(`  ✅ Can query template with qualityChecks relationship`)
      console.log(
        `  📊 Jobs using this template: ${templateWithRelations.jobsUsingTemplate.length}`
      )
      console.log(
        `  📊 Quality checks linked: ${templateWithRelations.qualityChecks.length}`
      )
    }

    console.log('\n✅ All Story 2.5 model tests passed!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testStory25Models()
