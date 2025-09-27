import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { customerCreateSchema, customerQuerySchema } from '@/lib/validation/customer-schemas'
import { withErrorHandling, checkRateLimit } from '@/lib/utils/error-handler'

export const GET = withErrorHandling(async (request: NextRequest) => { {
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

    // Parse query parameters สำหรับ search และ pagination
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''
    const status = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '10'))
    )
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    // สร้าง where conditions สำหรับ search
    const whereConditions: any = {}

    // Filter by status if provided
    if (status && ['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(status)) {
      whereConditions.status = status
    }

    // Search conditions - ใช้ case-insensitive search
    if (query) {
      whereConditions.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ]
    }

    // Validate sortBy field
    const allowedSortFields = [
      'name',
      'phone',
      'createdAt',
      'updatedAt',
      'status',
    ]
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt'

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Execute queries in parallel for better performance
    const [customers, totalCount] = await Promise.all([
      // Get paginated customers
      prisma.customer.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          contactChannel: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          [finalSortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      // Get total count for pagination
      prisma.customer.count({
        where: whereConditions,
      }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      customers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        query: query || null,
        status: status || null,
        sortBy: finalSortBy,
        sortOrder,
      },
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
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

    // Sanitize input data
    const sanitizationResult = sanitizeCustomerInput(body)
    if (sanitizationResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Input validation failed',
          errors: sanitizationResult.errors.reduce((acc, err) => {
            const field = err.includes('Name') ? 'name' :
                         err.includes('Phone') ? 'phone' :
                         err.includes('Address') ? 'address' : 'contactChannel'
            acc[field] = err
            return acc
          }, {} as Record<string, string>)
        },
        { status: 400 }
      )
    }

    const { name, phone, address, contactChannel } = sanitizationResult.data

    // Zod schema validation
    const customerSchema = z.object({
      name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
      phone: z.string().min(1, 'Phone number is required').regex(/^\+66[0-9]{9}$/, 'Invalid Thai phone format'),
      address: z.string().max(500, 'Address too long').optional(),
      contactChannel: z.enum(['LINE', 'Phone', 'Email', 'Facebook', 'Walk-in'], {
        errorMap: () => ({ message: 'Invalid contact channel' })
      })
    })

    try {
      customerSchema.parse({ name, phone, address, contactChannel })
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        const fieldErrors = zodError.errors.reduce((acc, err) => {
          if (err.path[0]) {
            acc[err.path[0] as string] = err.message
          }
          return acc
        }, {} as Record<string, string>)

        return NextResponse.json(
          { error: 'Validation failed', errors: fieldErrors },
          { status: 400 }
        )
      }
    }

    // Check phone uniqueness (phone is already sanitized)
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone },
    })

    if (existingCustomer) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: { phone: 'Phone number already exists' },
        },
        { status: 400 }
      )
    }

    // Create customer with sanitized data
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        address: address || null,
        contactChannel,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
