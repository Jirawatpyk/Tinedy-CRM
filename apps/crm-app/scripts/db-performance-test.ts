import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function runPerformanceTests() {
  console.log('🔍 Running Database Performance Tests...\n')

  try {
    // Test 1: Customer Search Performance
    console.log('📊 Testing Customer Search Performance:')
    const searchStart = Date.now()

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { phone: { contains: '123', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true,
      },
      take: 20,
    })

    const searchTime = Date.now() - searchStart
    console.log(`  - Search query completed in: ${searchTime}ms`)
    console.log(`  - Found ${customers.length} customers`)

    // Test 2: Job Listing Performance
    console.log('\n📋 Testing Job Listing Performance:')
    const jobsStart = Date.now()

    const jobs = await prisma.job.findMany({
      where: {
        status: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS'] },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        assignedUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    const jobsTime = Date.now() - jobsStart
    console.log(`  - Jobs query completed in: ${jobsTime}ms`)
    console.log(`  - Found ${jobs.length} jobs`)

    // Test 3: Complex Join Performance
    console.log('\n🔗 Testing Complex Join Performance:')
    const complexStart = Date.now()

    const customersWithJobs = await prisma.customer.findMany({
      include: {
        jobs: {
          include: {
            assignedUser: {
              select: {
                name: true,
              },
            },
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      take: 10,
    })

    const complexTime = Date.now() - complexStart
    console.log(`  - Complex join query completed in: ${complexTime}ms`)
    console.log(
      `  - Found ${customersWithJobs.length} customers with their jobs`
    )

    // Test 4: Count Operations Performance
    console.log('\n📊 Testing Count Operations:')
    const countStart = Date.now()

    const [customerCount, jobCount, activeJobCount] = await Promise.all([
      prisma.customer.count(),
      prisma.job.count(),
      prisma.job.count({
        where: {
          status: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS'] },
        },
      }),
    ])

    const countTime = Date.now() - countStart
    console.log(`  - Count operations completed in: ${countTime}ms`)
    console.log(`  - Total customers: ${customerCount}`)
    console.log(`  - Total jobs: ${jobCount}`)
    console.log(`  - Active jobs: ${activeJobCount}`)

    // Summary
    console.log('\n📈 Performance Summary:')
    console.log(
      `  - Customer Search: ${searchTime}ms ${searchTime < 100 ? '✅' : searchTime < 300 ? '⚠️' : '❌'}`
    )
    console.log(
      `  - Job Listing: ${jobsTime}ms ${jobsTime < 100 ? '✅' : jobsTime < 300 ? '⚠️' : '❌'}`
    )
    console.log(
      `  - Complex Joins: ${complexTime}ms ${complexTime < 200 ? '✅' : complexTime < 500 ? '⚠️' : '❌'}`
    )
    console.log(
      `  - Count Operations: ${countTime}ms ${countTime < 50 ? '✅' : countTime < 100 ? '⚠️' : '❌'}`
    )

    const avgTime = (searchTime + jobsTime + complexTime + countTime) / 4
    console.log(
      `\n🎯 Overall Database Performance: ${avgTime.toFixed(2)}ms average`
    )

    if (avgTime < 100) {
      console.log('🟢 EXCELLENT - Database performance is optimal')
    } else if (avgTime < 300) {
      console.log('🟡 GOOD - Database performance is acceptable')
    } else {
      console.log(
        '🔴 NEEDS ATTENTION - Database performance requires optimization'
      )
    }
  } catch (error) {
    console.error('❌ Database performance test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

runPerformanceTests()
