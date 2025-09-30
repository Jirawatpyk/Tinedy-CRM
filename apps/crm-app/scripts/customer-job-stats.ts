// Script to get detailed customer-job statistics and check data visibility
import { prisma } from '../lib/db'

async function getCustomerJobStats() {
  console.log('📊 Customer-Job Data Statistics\n')

  try {
    // Basic counts
    const [totalCustomers, totalJobs] = await Promise.all([
      prisma.customer.count(),
      prisma.job.count(),
    ])

    console.log('📈 Basic Counts:')
    console.log(`   Total Customers: ${totalCustomers}`)
    console.log(`   Total Jobs: ${totalJobs}`)

    // Customers with and without jobs
    const customersWithJobs = await prisma.customer.count({
      where: {
        jobs: {
          some: {},
        },
      },
    })

    const customersWithoutJobs = totalCustomers - customersWithJobs

    console.log('\n👥 Customer Distribution:')
    console.log(`   Customers with Jobs: ${customersWithJobs}`)
    console.log(`   Customers without Jobs: ${customersWithoutJobs}`)

    // Get sample customers from job page (what users see in /jobs)
    const jobsWithCustomers = await prisma.job.findMany({
      take: 10,
      select: {
        id: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(
      '\n💼 Sample Jobs with Customer Data (what shows on /jobs page):'
    )
    jobsWithCustomers.forEach((job, index) => {
      console.log(
        `   ${index + 1}. Job ${job.id.slice(0, 8)}... -> Customer: ${job.customer.name} (${job.customer.phone}) [${job.customer.status}]`
      )
    })

    // Get sample customers from customer page (what users see in /customers)
    const customersFromPage = await prisma.customer.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(
      '\n👤 Sample Customers from Customer Page (what shows on /customers page):'
    )
    customersFromPage.forEach((customer, index) => {
      console.log(
        `   ${index + 1}. ${customer.name} (${customer.phone}) [${customer.status}] - ${customer._count.jobs} jobs`
      )
    })

    // Check for specific customer sync issue
    const customersReferencedInJobs = await prisma.job.findMany({
      select: {
        customerId: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      distinct: ['customerId'],
      take: 5,
    })

    console.log(
      '\n🔍 Customer Data Verification (checking if job customers exist in customer table):'
    )
    for (const job of customersReferencedInJobs) {
      const customerExistsInTable = await prisma.customer.findUnique({
        where: { id: job.customerId },
        select: { id: true, name: true, phone: true, status: true },
      })

      if (customerExistsInTable) {
        console.log(
          `   ✅ Customer ${job.customer.name} exists in both /jobs and /customers`
        )
      } else {
        console.log(
          `   ❌ Customer ${job.customerId} shown in jobs but MISSING from customer table!`
        )
      }
    }

    // Check customer status distribution
    const customerStatusCounts = await prisma.customer.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    console.log('\n📊 Customer Status Distribution:')
    customerStatusCounts.forEach(({ status, _count }) => {
      console.log(`   ${status}: ${_count.id} customers`)
    })

    // Check if there are any filtering issues in customer query
    console.log('\n🔎 Testing Customer Queries:')

    // Test default customer query (what the customer page uses)
    const defaultCustomerQuery = await prisma.customer.findMany({
      where: {},
      select: { id: true, name: true, status: true },
      take: 5,
    })
    console.log(
      `   Default query returns: ${defaultCustomerQuery.length} customers`
    )

    // Test active customers only
    const activeCustomers = await prisma.customer.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, status: true },
      take: 5,
    })
    console.log(`   Active customers only: ${activeCustomers.length} customers`)
  } catch (error) {
    console.error('❌ Error getting stats:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  getCustomerJobStats()
    .then(() => {
      console.log('\n✨ Stats completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Stats failed:', error)
      process.exit(1)
    })
}

export { getCustomerJobStats }
