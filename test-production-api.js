/**
 * Test Production API - Story 2.6 Job Status Update
 * Usage: node test-production-api.js
 */

const PRODUCTION_URL = 'https://crm-jvgi3ai8z-jirawatpyk-4879s-projects.vercel.app'

async function testProductionAPI() {
  console.log('🧪 Testing Story 2.6 API on Production...\n')

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...')
    const loginResponse = await fetch(
      `${PRODUCTION_URL}/api/auth/callback/credentials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@tinedy.com',
          password: 'admin123',
        }),
      }
    )

    console.log(`   Status: ${loginResponse.status}`)
    console.log(`   Headers:`, Object.fromEntries(loginResponse.headers.entries()))

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.log(`   Error: ${errorText}`)
      return
    }

    const cookies = loginResponse.headers.get('set-cookie')
    console.log(`   ✅ Login successful`)
    console.log(`   Cookies: ${cookies?.substring(0, 100)}...\n`)

    // Step 2: Get jobs list
    console.log('2️⃣ Fetching jobs list...')
    const jobsResponse = await fetch(`${PRODUCTION_URL}/api/jobs`, {
      headers: {
        Cookie: cookies || '',
      },
    })

    console.log(`   Status: ${jobsResponse.status}`)

    if (!jobsResponse.ok) {
      const errorText = await jobsResponse.text()
      console.log(`   Error: ${errorText}`)
      return
    }

    const jobs = await jobsResponse.json()
    console.log(`   ✅ Found ${jobs.length} jobs`)

    if (jobs.length === 0) {
      console.log('   ⚠️ No jobs found to test')
      return
    }

    const firstJob = jobs[0]
    console.log(`   Testing with Job ID: ${firstJob.id}`)
    console.log(`   Current Status: ${firstJob.status}\n`)

    // Step 3: Update job status
    console.log('3️⃣ Updating job status...')
    const updateResponse = await fetch(
      `${PRODUCTION_URL}/api/jobs/${firstJob.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies || '',
        },
        body: JSON.stringify({
          status: 'ASSIGNED', // Try changing to ASSIGNED
        }),
      }
    )

    console.log(`   Status: ${updateResponse.status}`)
    console.log(`   Headers:`, Object.fromEntries(updateResponse.headers.entries()))

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      console.log(`   ❌ Error:`, JSON.stringify(errorData, null, 2))
    } else {
      const updatedJob = await updateResponse.json()
      console.log(`   ✅ Job updated successfully`)
      console.log(`   New Status: ${updatedJob.status}`)
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    if (error.cause) {
      console.error('Cause:', error.cause)
    }
  }
}

testProductionAPI()
