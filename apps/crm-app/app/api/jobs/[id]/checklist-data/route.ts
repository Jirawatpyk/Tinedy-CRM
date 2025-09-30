// API Route: /api/jobs/[id]/checklist-data
// Story 2.5: Get job checklist data with progress

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { JobService } from '@/lib/services/job'
import { logError } from '@/lib/logger'

/**
 * GET /api/jobs/[id]/checklist-data
 * Get job with checklist details and progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get job with checklist data
    const jobWithChecklist = await JobService.getJobWithChecklist(params.id)

    return NextResponse.json({
      success: true,
      data: jobWithChecklist,
    })
  } catch (error: any) {
    logError('Error fetching job checklist data', error, {
      endpoint: 'GET /api/jobs/[id]/checklist-data',
      jobId: params.id,
    })

    if (error.message === 'Job not found') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch job checklist data' },
      { status: 500 }
    )
  }
}
