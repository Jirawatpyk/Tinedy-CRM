// Script to sync customer-job data and identify inconsistencies
import { prisma } from '../lib/db'

interface DataInconsistency {
  type: 'ORPHANED_JOB' | 'MISSING_CUSTOMER_REFERENCE' | 'CUSTOMER_WITHOUT_JOBS'
  jobId?: string
  customerId?: string
  details: string
}

async function findDataInconsistencies(): Promise<DataInconsistency[]> {
  const inconsistencies: DataInconsistency[] = []

  console.log('🔍 Checking for data inconsistencies...')

  // 1. Find jobs with missing customers (orphaned jobs)
  // We'll use a different approach: get all jobs and check manually
  const allJobs = await prisma.job.findMany({
    select: {
      id: true,
      customerId: true,
    },
  })

  const allCustomers = await prisma.customer.findMany({
    select: {
      id: true,
    },
  })

  const customerIds = new Set(allCustomers.map((c) => c.id))
  const orphanedJobs = allJobs.filter((job) => !customerIds.has(job.customerId))

  for (const job of orphanedJobs) {
    inconsistencies.push({
      type: 'ORPHANED_JOB',
      jobId: job.id,
      customerId: job.customerId,
      details: `Job ${job.id} references non-existent customer ${job.customerId}`,
    })
  }

  // 2. Find customers referenced in jobs but missing from customer table
  // We already have this data from step 1, so we can reuse it
  const uniqueJobCustomerIds = Array.from(
    new Set(allJobs.map((j) => j.customerId))
  )

  for (const customerId of uniqueJobCustomerIds) {
    if (!customerIds.has(customerId)) {
      inconsistencies.push({
        type: 'MISSING_CUSTOMER_REFERENCE',
        customerId,
        details: `Customer ${customerId} is referenced by jobs but doesn't exist in customer table`,
      })
    }
  }

  // 3. Count customers with no jobs (for information)
  const customersWithoutJobs = await prisma.customer.count({
    where: {
      jobs: {
        none: {},
      },
    },
  })

  if (customersWithoutJobs > 0) {
    inconsistencies.push({
      type: 'CUSTOMER_WITHOUT_JOBS',
      details: `${customersWithoutJobs} customers have no associated jobs`,
    })
  }

  return inconsistencies
}

async function syncCustomerJobData() {
  console.log('🚀 Starting Customer-Job Data Sync...\n')

  try {
    // Find inconsistencies
    const inconsistencies = await findDataInconsistencies()

    if (inconsistencies.length === 0) {
      console.log('✅ No data inconsistencies found!')
      console.log('📊 Data Summary:')

      const [customerCount, jobCount] = await Promise.all([
        prisma.customer.count(),
        prisma.job.count(),
      ])

      console.log(`   - Total Customers: ${customerCount}`)
      console.log(`   - Total Jobs: ${jobCount}`)

      // Get customers that appear in jobs
      const customersWithJobs = await prisma.customer.count({
        where: {
          jobs: {
            some: {},
          },
        },
      })

      console.log(`   - Customers with Jobs: ${customersWithJobs}`)
      console.log(
        `   - Customers without Jobs: ${customerCount - customersWithJobs}`
      )

      return
    }

    // Report inconsistencies
    console.log(`❌ Found ${inconsistencies.length} data inconsistencies:\n`)

    inconsistencies.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type}`)
      console.log(`   Details: ${issue.details}`)
      if (issue.jobId) console.log(`   Job ID: ${issue.jobId}`)
      if (issue.customerId) console.log(`   Customer ID: ${issue.customerId}`)
      console.log('')
    })

    // Fix orphaned jobs by creating placeholder customers
    const orphanedJobs = inconsistencies.filter(
      (i) => i.type === 'ORPHANED_JOB'
    )

    if (orphanedJobs.length > 0) {
      console.log(
        '🔧 Fixing orphaned jobs by creating placeholder customers...'
      )

      for (const issue of orphanedJobs) {
        if (issue.customerId && issue.jobId) {
          // Check if customer was already created by another job
          const existingCustomer = await prisma.customer.findUnique({
            where: { id: issue.customerId },
          })

          if (!existingCustomer) {
            await prisma.customer.create({
              data: {
                id: issue.customerId,
                name: `Customer ${issue.customerId.slice(0, 8)}`,
                phone: `PHONE_${issue.customerId.slice(0, 8)}`,
                contactChannel: 'SYSTEM_CREATED',
                status: 'ACTIVE',
              },
            })
            console.log(
              `   ✅ Created placeholder customer: ${issue.customerId}`
            )
          }
        }
      }
    }

    console.log('\n🎉 Data sync completed!')

    // Final verification
    const remainingIssues = await findDataInconsistencies()
    if (remainingIssues.length === 0) {
      console.log('✅ All data inconsistencies resolved!')
    } else {
      console.log(
        `⚠️  ${remainingIssues.length} issues remain and need manual attention`
      )
    }
  } catch (error) {
    console.error('❌ Error during sync:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  syncCustomerJobData()
    .then(() => {
      console.log('\n✨ Sync script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Sync script failed:', error)
      process.exit(1)
    })
}

export { syncCustomerJobData, findDataInconsistencies }
