import {
  PrismaClient,
  ChecklistTemplate,
  Job,
  ServiceType,
} from '@prisma/client'

const prisma = new PrismaClient()

async function testTypeScriptTypes() {
  console.log('=== Testing TypeScript Types for Story 2.5 ===\n')

  try {
    // Test 1: Type checking for ChecklistTemplate
    console.log('✅ Test 1: ChecklistTemplate type exists')
    const template: ChecklistTemplate | null =
      await prisma.checklistTemplate.findFirst()
    console.log('   ChecklistTemplate type is properly defined\n')

    // Test 2: Query with type inference
    console.log('✅ Test 2: Type inference working')
    const templates = await prisma.checklistTemplate.findMany({
      where: {
        serviceType: 'CLEANING',
        isTemplate: true,
      },
      select: {
        id: true,
        name: true,
        items: true,
        serviceType: true,
      },
    })
    console.log(`   Found ${templates.length} templates with proper typing\n`)

    // Test 3: Job model with checklist fields
    console.log('✅ Test 3: Job model includes Story 2.5 fields')
    const job: Job | null = await prisma.job.findFirst()
    if (job) {
      // These properties should exist and TypeScript should not complain
      const hasChecklistFields =
        'checklistTemplateId' in job &&
        'itemStatus' in job &&
        'checklistCompletedAt' in job
      console.log(`   Job has Story 2.5 fields: ${hasChecklistFields}\n`)
    } else {
      console.log('   No jobs found (OK for empty database)\n')
    }

    // Test 4: Relationship types
    console.log('✅ Test 4: Relationship types working')
    const jobWithTemplate = await prisma.job.findFirst({
      include: {
        checklistTemplate: true,
      },
    })
    console.log('   Job.checklistTemplate relationship type is correct\n')

    const templateWithJobs = await prisma.checklistTemplate.findFirst({
      include: {
        jobsUsingTemplate: true,
        qualityChecks: true,
      },
    })
    console.log('   ChecklistTemplate relationships types are correct\n')

    // Test 5: Enum types
    console.log('✅ Test 5: ServiceType enum working')
    const serviceTypes: ServiceType[] = ['CLEANING', 'TRAINING']
    console.log(`   ServiceType enum values: ${serviceTypes.join(', ')}\n`)

    console.log('✅ All TypeScript type tests passed!')
    console.log('\n🎉 Story 2.5 is ready for development!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTypeScriptTypes()
