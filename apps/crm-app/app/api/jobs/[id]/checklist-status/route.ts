// API Route: /api/jobs/[id]/checklist-status
// Story 2.5: Update checklist item status (for Operations team)

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { JobService } from '@/lib/services/job'
import { logError } from '@/lib/logger'

/**
 * PATCH /api/jobs/[id]/checklist-status
 * Update checklist item completion status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin and Operations can update checklist status
    if (!['ADMIN', 'OPERATIONS'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Operations access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { itemStatus } = body

    // Validate input
    if (!itemStatus || typeof itemStatus !== 'object') {
      return NextResponse.json(
        {
          error:
            'itemStatus must be an object with item names as keys and boolean values',
        },
        { status: 400 }
      )
    }

    // Update checklist status
    const result = await JobService.updateChecklistItemStatus(
      params.id,
      itemStatus
    )

    return NextResponse.json({
      success: true,
      message: 'Checklist status updated successfully',
      data: result.job,
      progress: result.progress,
    })
  } catch (error: any) {
    logError('Error updating checklist status', error, {
      endpoint: 'PATCH /api/jobs/[id]/checklist-status',
      jobId: params.id,
    })

    if (error.message === 'Job not found') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (error.message.includes('does not have a checklist')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update checklist status' },
      { status: 500 }
    )
  }
}
