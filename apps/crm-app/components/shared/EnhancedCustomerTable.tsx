'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FixedSizeList as List } from 'react-window'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { Customer } from '@prisma/client'
import { useCustomerCache } from '@/lib/hooks/useCustomerCache'
import { usePerformanceMonitor } from '@/lib/utils/performance'

interface CustomerApiResponse {
  customers: Customer[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: {
    query: string | null
    status: string | null
    sortBy: string
    sortOrder: string
  }
}

interface EnhancedCustomerTableProps {
  initialData: CustomerApiResponse
}

interface CustomerRowProps {
  index: number
  style: React.CSSProperties
  data: {
    customers: Customer[]
    getStatusBadge: (status: string) => JSX.Element
    isLoading: boolean
  }
}

// Enhanced customer row with loading placeholder
const CustomerRow = ({ index, style, data }: CustomerRowProps) => {
  const { customers, getStatusBadge, isLoading } = data
  const customer = customers[index]

  if (!customer && isLoading) {
    return (
      <div style={style} className="flex items-center border-b bg-gray-50/50">
        <div className="flex items-center w-full px-4 py-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded flex-[2] mr-4"></div>
          <div className="h-4 bg-gray-200 rounded flex-[1.5] mr-4"></div>
          <div className="h-4 bg-gray-200 rounded flex-[1.5] mr-4"></div>
          <div className="h-4 bg-gray-200 rounded flex-[2] mr-4"></div>
          <div className="h-4 bg-gray-200 rounded flex-1 mr-4"></div>
          <div className="h-4 bg-gray-200 rounded flex-[1.5] mr-4"></div>
          <div className="h-4 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    )
  }

  if (!customer) return null

  return (
    <div
      style={style}
      className="flex items-center border-b hover:bg-muted/50 transition-colors duration-150"
    >
      <div className="flex items-center w-full px-4 py-3">
        <div className="font-medium flex-[2] min-w-0 pr-4 truncate">
          {customer.name}
        </div>
        <div className="flex-[1.5] min-w-0 pr-4 truncate text-gray-600">
          {customer.phone || '-'}
        </div>
        <div className="flex-[1.5] min-w-0 pr-4 truncate text-gray-600">
          {customer.contactChannel || '-'}
        </div>
        <div className="flex-[2] min-w-0 pr-4 truncate text-gray-600">
          {customer.address || '-'}
        </div>
        <div className="flex-1 pr-4">{getStatusBadge(customer.status)}</div>
        <div className="flex-[1.5] pr-4 text-sm text-gray-500">
          {new Date(customer.createdAt).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Link href={`/customers/${customer.id}`}>
              <Button
                variant="ghost"
                size="sm"
                title="ดูรายละเอียด"
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">ดูรายละเอียดลูกค้า</span>
              </Button>
            </Link>
            <Link href={`/customers/${customer.id}/edit`}>
              <Button
                variant="ghost"
                size="sm"
                title="แก้ไขข้อมูล"
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">แก้ไขข้อมูลลูกค้า</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EnhancedCustomerTable({
  initialData,
}: EnhancedCustomerTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchCustomers, loading, error, prefetchCustomers, invalidateCache } =
    useCustomerCache()
  const { startMark, endMark } = usePerformanceMonitor()

  const [apiResponse, setApiResponse] =
    useState<CustomerApiResponse>(initialData)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || ''
  )
  const [isSearching, setIsSearching] = useState(false)
  const listRef = useRef<List>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Memoized values for better performance
  const customers = useMemo(
    () => apiResponse?.customers || [],
    [apiResponse?.customers]
  )
  const pagination = useMemo(
    () => apiResponse?.pagination,
    [apiResponse?.pagination]
  )

  // Smart search with immediate UI feedback
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Show searching state immediately for better UX
    if (searchQuery !== (searchParams.get('q') || '')) {
      setIsSearching(true)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const params = new URLSearchParams(searchParams.toString())

      if (searchQuery) {
        params.set('q', searchQuery)
      } else {
        params.delete('q')
      }

      if (statusFilter) {
        params.set('status', statusFilter)
      } else {
        params.delete('status')
      }

      params.delete('page') // Reset to page 1

      const newUrl = `/customers?${params.toString()}`

      try {
        // Fetch data with cache
        const searchParamsObj = {
          q: searchQuery || undefined,
          status: statusFilter || undefined,
          page: '1',
          limit: '10',
        }

        const newData = await fetchCustomers(searchParamsObj, {
          useCache: true,
          cacheTTL: searchQuery ? 60000 : 300000, // Shorter cache for search
        })

        if (newData) {
          setApiResponse(newData)
        }

        router.push(newUrl, { scroll: false })
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 150) // Faster response time

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, statusFilter, router, searchParams, fetchCustomers])

  // Prefetch adjacent pages for faster navigation
  useEffect(() => {
    if (pagination) {
      const prefetchParams = []

      // Prefetch next page
      if (pagination.hasNextPage) {
        prefetchParams.push({
          q: searchQuery || undefined,
          status: statusFilter || undefined,
          page: (pagination.currentPage + 1).toString(),
          limit: '10',
        })
      }

      // Prefetch previous page
      if (pagination.hasPrevPage) {
        prefetchParams.push({
          q: searchQuery || undefined,
          status: statusFilter || undefined,
          page: (pagination.currentPage - 1).toString(),
          limit: '10',
        })
      }

      if (prefetchParams.length > 0) {
        prefetchCustomers(prefetchParams)
      }
    }
  }, [pagination, searchQuery, statusFilter, prefetchCustomers])

  // Optimized status badge with memoization
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="default" className="text-xs">
            ใช้งานอยู่
          </Badge>
        )
      case 'INACTIVE':
        return (
          <Badge variant="secondary" className="text-xs">
            ไม่ใช้งาน
          </Badge>
        )
      case 'BLOCKED':
        return (
          <Badge variant="destructive" className="text-xs">
            ถูกบล็อก
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            ไม่ทราบสถานะ
          </Badge>
        )
    }
  }, [])

  // Enhanced page change with prefetching
  const handlePageChange = useCallback(
    async (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', page.toString())

      try {
        const newData = await fetchCustomers(
          {
            q: searchQuery || undefined,
            status: statusFilter || undefined,
            page: page.toString(),
            limit: '10',
          },
          { useCache: true }
        )

        if (newData) {
          setApiResponse(newData)
          router.push(`/customers?${params.toString()}`, { scroll: false })

          // Scroll to top
          if (listRef.current) {
            listRef.current.scrollToItem(0, 'start')
          }
        }
      } catch (err) {
        console.error('Page change error:', err)
      }
    },
    [router, searchParams, searchQuery, statusFilter, fetchCustomers]
  )

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('')
    invalidateCache(['search:'])
    router.push('/customers')
  }, [router, invalidateCache])

  // Force refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      invalidateCache()
      const newData = await fetchCustomers(
        {
          q: searchQuery || undefined,
          status: statusFilter || undefined,
          page: pagination?.currentPage.toString() || '1',
          limit: '10',
        },
        { force: true }
      )

      if (newData) {
        setApiResponse(newData)
      }
    } catch (err) {
      console.error('Refresh error:', err)
    }
  }, [fetchCustomers, invalidateCache, searchQuery, statusFilter, pagination])

  // Memoized data for virtualized list with render performance tracking
  const listData = useMemo(() => {
    startMark('customerRender')
    const data = {
      customers,
      getStatusBadge,
      isLoading: loading || isSearching,
    }
    endMark('customerRender')
    return data
  }, [customers, getStatusBadge, loading, isSearching, startMark, endMark])

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <User className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={handleRefresh} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          ลองใหม่
        </Button>
      </div>
    )
  }

  const ROW_HEIGHT = 60
  const TABLE_HEIGHT = Math.min(
    600,
    Math.max(300, customers.length * ROW_HEIGHT + 100)
  )

  return (
    <div className="space-y-4">
      {/* Enhanced Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-3 h-4 w-4 ${isSearching ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <Input
            placeholder="ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
            disabled={loading}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          รีเฟรช
        </Button>
        <Link href="/customers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มลูกค้าใหม่
          </Button>
        </Link>
      </div>

      {/* Enhanced Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination ? (
            <>
              แสดง {(pagination.currentPage - 1) * pagination.limit + 1}-
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalCount
              )}{' '}
              จาก {pagination.totalCount.toLocaleString()} ลูกค้า
              {isSearching && (
                <span className="text-blue-600 ml-2">(กำลังค้นหา...)</span>
              )}
            </>
          ) : (
            'กำลังโหลด...'
          )}
        </p>
        <div className="flex items-center space-x-2">
          {(searchQuery || statusFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ล้างตัวกรอง
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Virtualized Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50/80 px-4 py-3 border-b">
          <div className="flex items-center">
            <div className="font-semibold flex-[2] min-w-0 pr-4 text-gray-800">
              ชื่อลูกค้า
            </div>
            <div className="font-semibold flex-[1.5] min-w-0 pr-4 text-gray-800">
              เบอร์โทรศัพท์
            </div>
            <div className="font-semibold flex-[1.5] min-w-0 pr-4 text-gray-800">
              ช่องทางติดต่อ
            </div>
            <div className="font-semibold flex-[2] min-w-0 pr-4 text-gray-800">
              ที่อยู่
            </div>
            <div className="font-semibold flex-1 pr-4 text-gray-800">สถานะ</div>
            <div className="font-semibold flex-[1.5] pr-4 text-gray-800">
              วันที่สร้าง
            </div>
            <div className="font-semibold flex-1 text-gray-800">การจัดการ</div>
          </div>
        </div>

        {/* Table Body */}
        {customers.length === 0 && !loading && !isSearching ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                {searchQuery || statusFilter
                  ? 'ไม่พบลูกค้าที่ตรงกับตัวกรอง'
                  : 'ยังไม่มีข้อมูลลูกค้า'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchQuery || statusFilter
                  ? 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง'
                  : 'เริ่มต้นด้วยการเพิ่มลูกค้าใหม่'}
              </p>
            </div>
          </div>
        ) : (
          <List
            ref={listRef}
            height={TABLE_HEIGHT}
            width="100%"
            itemCount={Math.max(customers.length, loading ? 10 : 0)} // Show placeholders while loading
            itemSize={ROW_HEIGHT}
            itemData={listData}
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {CustomerRow}
          </List>
        )}
      </div>

      {/* Enhanced Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            หน้า {pagination.currentPage} จาก {pagination.totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </Button>

            {/* Smart pagination display */}
            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const startPage = Math.max(1, pagination.currentPage - 2)
                  const page = startPage + i
                  if (page > pagination.totalPages) return null

                  return (
                    <Button
                      key={page}
                      variant={
                        pagination.currentPage === page ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10 h-10"
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  )
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
