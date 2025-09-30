// API Route: /api/jobs/[id]/checklist
// Story 2.5: Attach/detach checklist template to job

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { JobService } from '@/lib/services/job'
import { logError } from '@/lib/logger'

/**
 * PATCH /api/jobs/[id]/checklist
 * Attach or detach checklist template to job
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

    // Only Admin can manage checklist templates
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { templateId } = body

    // Validate input
    if (templateId !== null && typeof templateId !== 'string') {
      return NextResponse.json(
        { error: 'templateId must be a string or null' },
        { status: 400 }
      )
    }

    // Attach/detach template
    const job = await JobService.attachChecklistTemplate(params.id, templateId)

    return NextResponse.json({
      success: true,
      message: templateId
        ? 'Checklist template attached successfully'
        : 'Checklist template detached successfully',
      data: job,
    })
  } catch (error: any) {
    logError('Error managing job checklist', error, {
      endpoint: 'PATCH /api/jobs/[id]/checklist',
      jobId: params.id,
    })

    if (error.message === 'Job not found') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (error.message.includes('template not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to manage checklist template' },
      { status: 500 }
    )
  }
}
