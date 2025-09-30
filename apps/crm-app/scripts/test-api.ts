import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Test functions
async function setupTestUser() {
  console.log('🔧 Setting up test user...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  try {
    const user = await prisma.user.upsert({
      where: { email: 'admin@tinedy.com' },
      update: {},
      create: {
        id: 'admin-test-user',
        email: 'admin@tinedy.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
        updatedAt: new Date(),
      },
    })

    console.log('✅ Test user created:', user.email, user.role)
    return user
  } catch (error) {
    console.error('❌ Error creating test user:', error)
    return null
  }
}

async function setupTestData() {
  console.log('🔧 Setting up test data...')

  try {
    // Create test customer
    const customer = await prisma.customer.upsert({
      where: { phone: '0851234567' },
      update: {},
      create: {
        id: 'test-customer-1',
        name: 'ทดสอบ ลูกค้า',
        phone: '0851234567',
        address: '123 ถนนทดสอบ กรุงเทพฯ',
        contactChannel: 'LINE',
        status: 'ACTIVE',
      },
    })

    console.log('✅ Test customer created:', customer.name)

    // Create test job
    const job = await prisma.job.upsert({
      where: { id: 'test-job-1' },
      update: {},
      create: {
        id: 'test-job-1',
        customerId: customer.id,
        serviceType: 'CLEANING',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        price: 1500.0,
        status: 'NEW',
        description: 'ทดสอบงานทำความสะอาด',
        priority: 'MEDIUM',
        updatedAt: new Date(),
      },
    })

    console.log('✅ Test job created:', job.description)

    return { customer, job }
  } catch (error) {
    console.error('❌ Error creating test data:', error)
    return null
  }
}

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')

  try {
    const userCount = await prisma.user.count()
    const customerCount = await prisma.customer.count()
    const jobCount = await prisma.job.count()

    console.log('✅ Database connected successfully')
    console.log(
      `📊 Current records: Users: ${userCount}, Customers: ${customerCount}, Jobs: ${jobCount}`
    )

    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

async function testUpdatedAtFields() {
  console.log('🔍 Testing updatedAt fields...')

  try {
    // Find existing customer to update
    const customer = await prisma.customer.findFirst({
      where: { phone: '0851234567' },
    })

    if (customer) {
      const originalUpdatedAt = customer.updatedAt

      // Wait a moment then update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedCustomer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name: customer.name + ' - Updated' },
      })

      const isUpdated = updatedCustomer.updatedAt > originalUpdatedAt
      console.log('✅ updatedAt field works:', isUpdated)

      // Revert changes
      await prisma.customer.update({
        where: { id: customer.id },
        data: { name: customer.name.replace(' - Updated', '') },
      })

      return isUpdated
    }

    return false
  } catch (error) {
    console.error('❌ Error testing updatedAt fields:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Starting API and Database Tests\n')

  // Test 1: Database connection
  const dbConnected = await testDatabaseConnection()
  if (!dbConnected) {
    console.error('❌ Cannot proceed without database connection')
    process.exit(1)
  }

  console.log('\n---\n')

  // Test 2: Setup test user
  await setupTestUser()

  console.log('\n---\n')

  // Test 3: Setup test data
  await setupTestData()

  console.log('\n---\n')

  // Test 4: Test updatedAt fields
  await testUpdatedAtFields()

  console.log('\n✅ All database tests completed!')
  console.log('\n📝 Next steps:')
  console.log('1. Login with: admin@tinedy.com / admin123')
  console.log('2. Test frontend pages: /customers, /jobs')
  console.log('3. Test API endpoints with authentication\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
