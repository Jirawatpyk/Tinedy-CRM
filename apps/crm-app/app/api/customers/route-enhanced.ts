import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import {
  customerCreateSchema,
  customerQuerySchema,
} from '@/lib/validation/customer-schemas'
import {
  withErrorHandling,
  checkRateLimit,
  CustomApiError,
} from '@/lib/utils/error-handler'

export const GET = withErrorHandling(async (request: NextRequest) => {
  // ตรวจสอบ authentication
  const session = await auth()
  if (!session?.user) {
    throw new CustomApiError('Unauthorized', 401)
  }

  // ตรวจสอบ role permission (Admin only)
  if (session.user.role !== UserRole.ADMIN) {
    throw new CustomApiError('Forbidden - Admin access required', 403)
  }

  // Rate limiting
  checkRateLimit(`customer-list-${session.user.id}`, 50, 60000) // 50 requests per minute

  // Parse และ validate query parameters
  const { searchParams } = new URL(request.url)
  const queryData = {
    q: searchParams.get('q') || undefined,
    status: searchParams.get('status') || undefined,
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '10',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  }

  const validatedQuery = customerQuerySchema.parse(queryData)

  // สร้าง where conditions สำหรับ search
  const whereConditions: any = {}

  // Filter by status if provided
  if (validatedQuery.status) {
    whereConditions.status = validatedQuery.status
  }

  // Search conditions - ใช้ case-insensitive search
  if (validatedQuery.q) {
    whereConditions.OR = [
      {
        name: {
          contains: validatedQuery.q,
          mode: 'insensitive',
        },
      },
      {
        phone: {
          contains: validatedQuery.q,
          mode: 'insensitive',
        },
      },
    ]
  }

  // Calculate offset for pagination
  const offset = (validatedQuery.page - 1) * validatedQuery.limit

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
        [validatedQuery.sortBy]: validatedQuery.sortOrder,
      },
      skip: offset,
      take: validatedQuery.limit,
    }),
    // Get total count for pagination
    prisma.customer.count({
      where: whereConditions,
    }),
  ])

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / validatedQuery.limit)
  const hasNextPage = validatedQuery.page < totalPages
  const hasPrevPage = validatedQuery.page > 1

  return NextResponse.json({
    customers,
    pagination: {
      currentPage: validatedQuery.page,
      totalPages,
      totalCount,
      limit: validatedQuery.limit,
      hasNextPage,
      hasPrevPage,
    },
    filters: {
      query: validatedQuery.q || null,
      status: validatedQuery.status || null,
      sortBy: validatedQuery.sortBy,
      sortOrder: validatedQuery.sortOrder,
    },
  })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  // ตรวจสอบ authentication
  const session = await auth()
  if (!session?.user) {
    throw new CustomApiError('Unauthorized', 401)
  }

  // ตรวจสอบ role permission (Admin only)
  if (session.user.role !== UserRole.ADMIN) {
    throw new CustomApiError('Forbidden - Admin access required', 403)
  }

  // Rate limiting for creation
  checkRateLimit(`customer-create-${session.user.id}`, 20, 60000) // 20 creations per minute

  // Parse และ validate request body
  const body = await request.json()
  const validatedData = customerCreateSchema.parse(body)

  // Check phone uniqueness
  const existingCustomer = await prisma.customer.findUnique({
    where: { phone: validatedData.phone },
  })

  if (existingCustomer) {
    throw new CustomApiError(
      'Phone number already exists',
      400,
      'DUPLICATE_PHONE',
      { field: 'phone' }
    )
  }

  // Create customer with validated data
  const customer = await prisma.customer.create({
    data: {
      name: validatedData.name,
      phone: validatedData.phone,
      address: validatedData.address,
      contactChannel: validatedData.contactChannel,
    },
  })

  return NextResponse.json(customer, { status: 201 })
})
