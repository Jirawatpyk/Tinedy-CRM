// Simple test script to check Prisma client import
console.log('Testing Prisma client import...')

try {
  const { PrismaClient } = require('@prisma/client')
  console.log('✅ PrismaClient imported successfully')

  const prisma = new PrismaClient()
  console.log('✅ PrismaClient instance created')

  // Test basic connection
  prisma
    .$connect()
    .then(() => {
      console.log('✅ Database connection successful')
      return prisma.$disconnect()
    })
    .then(() => {
      console.log('✅ Database disconnection successful')
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error)
    })
} catch (error) {
  console.error('❌ Failed to import PrismaClient:', error)
}
