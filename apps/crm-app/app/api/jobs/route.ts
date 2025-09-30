import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { JobService } from '@/lib/services/JobService'
import { UserRole, ServiceType, Priority } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
const jobCreateSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  serviceType: z.nativeEnum(ServiceType),
  scheduledDate: z.string().optional(),
  scheduledAt: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  notes: z.string().optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedUserId: z.string().optional(),
})

const jobListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? parseInt(val) : 20)),
  status: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  customerId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  assignedUserId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  serviceType: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  search: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
})

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ตรวจสอบ role permission (Admin, Operations, Training, และ QC_Manager)
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryData = jobListQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      customerId: searchParams.get('customerId'),
      assignedUserId: searchParams.get('assignedUserId'),
      serviceType: searchParams.get('serviceType'),
      search: searchParams.get('search'),
    })

    // Use JobService to get jobs
    const filters: any = {}
    if (queryData.customerId) filters.customerId = queryData.customerId
    if (queryData.assignedUserId)
      filters.assignedUserId = queryData.assignedUserId
    if (queryData.status) filters.status = [queryData.status]
    if (queryData.serviceType) filters.serviceType = [queryData.serviceType]
    if (queryData.search) filters.search = queryData.search

    const pagination = { page: queryData.page, limit: queryData.limit }
    const result = await JobService.getJobs(filters, pagination)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ตรวจสอบ role permission (Admin only)
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()

    try {
      const validatedData = jobCreateSchema.parse(body)

      // Convert date strings to Date objects
      const jobData: any = {
        customerId: validatedData.customerId,
        serviceType: validatedData.serviceType,
        price: validatedData.price,
        notes: validatedData.notes,
        description: validatedData.description,
        priority: validatedData.priority,
        assignedUserId: validatedData.assignedUserId,
      }

      // Handle scheduled date - use scheduledAt to match database schema
      if (validatedData.scheduledDate) {
        jobData.scheduledAt = new Date(validatedData.scheduledDate)
      } else if (validatedData.scheduledAt) {
        jobData.scheduledAt = new Date(validatedData.scheduledAt)
      }

      // Use JobService to create job - use scheduledAt to match interface
      const newJob = await JobService.createJob({
        customerId: jobData.customerId,
        serviceType: jobData.serviceType,
        scheduledDate: jobData.scheduledAt,
        price: jobData.price,
        description: jobData.description,
        notes: jobData.notes,
        priority: jobData.priority,
        assignedUserId: jobData.assignedUserId,
      })

      return NextResponse.json(newJob, { status: 201 })
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
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
