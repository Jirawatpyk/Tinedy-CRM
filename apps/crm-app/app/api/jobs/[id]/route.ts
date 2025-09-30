import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { JobService } from '@/lib/services/JobService'
import { UserRole, JobStatus } from '@prisma/client'
import { z } from 'zod'
import {
  isValidTransition,
  getTransitionErrorMessage,
} from '@/lib/utils/jobStatus'

// Validation schemas
const jobUpdateSchema = z.object({
  status: z.nativeEnum(JobStatus).optional(),
  assignedUserId: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(), // Support both field names
  notes: z.string().nullable().optional(),
  description: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ตรวจสอบ role permission (Admin, Operations, Training, QC_Manager)
    if (
      ![
        UserRole.ADMIN,
        UserRole.OPERATIONS,
        UserRole.TRAINING,
        UserRole.QC_MANAGER,
      ].includes(session.user.role)
    ) {
      return NextResponse.json(
        {
          error:
            'Forbidden - Admin, Operations, Training, or QC Manager access required',
        },
        { status: 403 }
      )
    }

    const { id } = params

    // Use JobService to get job by ID
    const job = await JobService.getJobById(id)

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check if job exists using JobService
    const existingJob = await JobService.getJobById(id)

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // ตรวจสอบ role permission (Admin OR assigned Operations user)
    const isAdmin = session.user.role === UserRole.ADMIN
    const allowedRoles: UserRole[] = [
      UserRole.OPERATIONS,
      UserRole.TRAINING,
      UserRole.QC_MANAGER,
    ]
    const isAssignedUser =
      session.user.id === existingJob.assignedUserId &&
      allowedRoles.includes(session.user.role)

    if (!isAdmin && !isAssignedUser) {
      return NextResponse.json(
        {
          error:
            'Forbidden - Only Admin or assigned team member can update this job',
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()

    try {
      const validatedData = jobUpdateSchema.parse(body)

      // Validate status transition if status is being updated
      if (validatedData.status !== undefined) {
        const currentStatus = existingJob.status
        const newStatus = validatedData.status

        if (!isValidTransition(currentStatus, newStatus)) {
          const errorMessage = getTransitionErrorMessage(
            currentStatus,
            newStatus
          )
          return NextResponse.json(
            {
              error: 'Invalid status transition',
              message: errorMessage,
              currentStatus,
              attemptedStatus: newStatus,
            },
            { status: 400 }
          )
        }
      }

      // Additional validation for assignedUserId will be handled by JobService

      // Prepare update data
      const updateData: any = {}

      if (validatedData.status !== undefined) {
        updateData.status = validatedData.status
      }

      // Support both assignedUserId and assignedToId field names
      if (validatedData.assignedUserId !== undefined) {
        updateData.assignedUserId = validatedData.assignedUserId
      } else if (validatedData.assignedToId !== undefined) {
        updateData.assignedUserId = validatedData.assignedToId
      }

      if (validatedData.notes !== undefined) {
        updateData.notes = validatedData.notes
      }

      if (validatedData.description !== undefined) {
        updateData.description = validatedData.description
      }

      // Use JobService to update job
      const updatedJob = await JobService.updateJob(id, updateData)

      return NextResponse.json(updatedJob)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors = validationError.issues.reduce(
          (acc, error) => {
            const path = error.path.join('.')
            acc[path] = error.message
            return acc
          },
          {} as Record<string, string>
        )

        return NextResponse.json(
          { error: 'Validation failed', errors },
          { status: 400 }
        )
      }
      throw validationError
    }
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
