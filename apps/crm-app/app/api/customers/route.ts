import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
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

    // Optimized search conditions leveraging specialized indexes
    if (query) {
      // Use startsWith for better index utilization when possible
      const isPhoneNumber = /^\d+$/.test(query)
      const useStartsWith = query.length >= 2

      if (isPhoneNumber) {
        // Phone number search - use index-optimized startsWith first, then contains
        whereConditions.OR = [
          {
            phone: {
              startsWith: query,
            },
          },
          {
            phone: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ]
      } else if (useStartsWith) {
        // Name search - leverage name indexes with startsWith + contains
        whereConditions.OR = [
          {
            name: {
              startsWith: query,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          // Phone fallback for mixed searches
          {
            phone: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ]
      } else {
        // Short query fallback - minimal search scope
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

    // Create cache key based on query parameters
    const cacheKey = [
      'customers',
      JSON.stringify(whereConditions),
      finalSortBy,
      sortOrder,
      offset.toString(),
      limit.toString(),
    ]

    // Cached customer data fetcher with optimized queries
    const getCachedCustomerData = unstable_cache(
      async () => {
        // Execute queries in parallel for better performance
        const [customers, totalCount] = await Promise.all([
          // Get paginated customers with optimized select and cursor-based pagination for large datasets
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
            orderBy: [
              { [finalSortBy]: sortOrder },
              { id: 'desc' }, // Secondary sort for consistent pagination
            ],
            skip: offset,
            take: limit,
          }),
          // Optimize count query - use estimate for large datasets
          offset === 0 && !query && !status
            ? // Fast count estimation for first page without filters
              prisma.$queryRaw`
                SELECT CAST(
                  CASE
                    WHEN reltuples > 1000
                    THEN reltuples
                    ELSE (SELECT COUNT(*) FROM "Customer")
                  END AS INTEGER
                ) as count
                FROM pg_class
                WHERE relname = 'Customer'
              `.then((result: any) => result[0]?.count || 0)
            : // Accurate count for filtered results
              prisma.customer.count({
                where: whereConditions,
              }),
        ])

        return { customers, totalCount }
      },
      cacheKey,
      {
        revalidate: query ? 30 : 300, // Shorter cache for search queries, longer for static lists
        tags: ['customers', ...(query ? [`search:${query}`] : [])],
      }
    )

    const { customers, totalCount } = await getCachedCustomerData()

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = NextResponse.json({
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

    // Add performance optimization headers
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60')
    response.headers.set('Vary', 'Authorization')

    return response
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

    // Parse request body
    const body = await request.json()
    const { name, phone, address, contactChannel } = body

    // Validate required fields
    const errors: Record<string, string> = {}

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Name is required'
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      errors.phone = 'Phone number is required'
    }

    if (
      !contactChannel ||
      typeof contactChannel !== 'string' ||
      contactChannel.trim().length === 0
    ) {
      errors.contactChannel = 'Contact channel is required'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      )
    }

    // Check phone uniqueness
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone: phone.trim() },
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

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        id: 'customer-' + Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        contactChannel: contactChannel.trim(),
        updatedAt: new Date(),
      },
    })

    // Revalidate customer list to ensure fresh data
    revalidatePath('/customers')

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
