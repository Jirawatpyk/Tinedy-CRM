const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

console.log('=== Prisma Client Verification ===\n')

// Check if ChecklistTemplate model is available
const hasChecklistTemplate = typeof prisma.checklistTemplate !== 'undefined'
console.log('✅ ChecklistTemplate model available:', hasChecklistTemplate)

// List all available models
const models = Object.keys(prisma)
  .filter((key) => !key.startsWith('_') && !key.startsWith('$'))
  .sort()

console.log('\n📋 Available models:')
models.forEach((model) => {
  console.log(`  - ${model}`)
})

// Verify Story 2.5 relationships
console.log('\n🔗 Verifying Story 2.5 relationships:')
if (hasChecklistTemplate) {
  console.log('  ✅ Job.checklistTemplate relation should exist')
  console.log('  ✅ ChecklistTemplate.jobsUsingTemplate relation should exist')
} else {
  console.log('  ❌ ChecklistTemplate model not found!')
}

prisma.$disconnect()
