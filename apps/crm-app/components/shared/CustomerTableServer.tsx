import { Suspense } from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { EnhancedCustomerTable } from './EnhancedCustomerTable'
import { unstable_cache } from 'next/cache'

interface CustomerTableServerProps {
  searchParams?: {
    q?: string
    status?: string
    page?: string
    limit?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
}

async function getCustomersData(
  searchParams: CustomerTableServerProps['searchParams'] = {}
) {
  const session = await auth()
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return null
  }

  const query = searchParams.q?.trim() || ''
  const status = searchParams.status || ''
  const page = Math.max(1, parseInt(searchParams.page || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.limit || '10')))
  const sortBy = searchParams.sortBy || 'createdAt'
  const sortOrder = searchParams.sortOrder === 'asc' ? 'asc' : 'desc'

  // Build where conditions
  const whereConditions: any = {}

  if (status && ['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(status)) {
    whereConditions.status = status
  }

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

  const allowedSortFields = [
    'name',
    'phone',
    'createdAt',
    'updatedAt',
    'status',
  ]
  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
  const offset = (page - 1) * limit

  // Cache customer data for better performance
  const getCachedData = unstable_cache(
    async () => {
      const [customers, totalCount] = await Promise.all([
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
        prisma.customer.count({
          where: whereConditions,
        }),
      ])

      return { customers, totalCount }
    },
    [
      'customers-server',
      JSON.stringify(whereConditions),
      finalSortBy,
      sortOrder,
      offset.toString(),
      limit.toString(),
    ],
    {
      revalidate: 30, // Cache for 30 seconds on server
      tags: ['customers'],
    }
  )

  const { customers, totalCount } = await getCachedData()

  const totalPages = Math.ceil(totalCount / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
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
  }
}

function CustomerTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 bg-gray-200 rounded-md flex-1 animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg">
        <div className="p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 py-3 border-b last:border-b-0">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/8 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/8 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-8 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export async function CustomerTableServer({
  searchParams,
}: CustomerTableServerProps) {
  return (
    <Suspense fallback={<CustomerTableSkeleton />}>
      <CustomerTableServerInner searchParams={searchParams} />
    </Suspense>
  )
}

async function CustomerTableServerInner({
  searchParams,
}: CustomerTableServerProps) {
  const data = await getCustomersData(searchParams)

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">ไม่มีสิทธิ์เข้าถึงข้อมูลลูกค้า</p>
      </div>
    )
  }

  return <EnhancedCustomerTable initialData={data} />
}
