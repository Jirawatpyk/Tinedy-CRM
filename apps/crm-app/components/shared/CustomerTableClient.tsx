'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
} from 'lucide-react'
import Link from 'next/link'
import { Customer } from '@prisma/client'

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

interface CustomerTableClientProps {
  initialData: CustomerApiResponse
}

export function CustomerTableClient({ initialData }: CustomerTableClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [apiResponse, setApiResponse] =
    useState<CustomerApiResponse>(initialData)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized values for better performance
  const customers = useMemo(
    () => apiResponse?.customers || [],
    [apiResponse?.customers]
  )
  const pagination = useMemo(
    () => apiResponse?.pagination,
    [apiResponse?.pagination]
  )

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
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

      // Reset to page 1 when search changes
      params.delete('page')

      router.push(`/customers?${params.toString()}`, { scroll: false })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter, router, searchParams])

  // Optimized status badge with memoization
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">ใช้งานอยู่</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">ไม่ใช้งาน</Badge>
      case 'BLOCKED':
        return <Badge variant="destructive">ถูกบล็อก</Badge>
      default:
        return <Badge variant="outline">ไม่ทราบสถานะ</Badge>
    }
  }, [])

  // Optimized page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', page.toString())
      router.push(`/customers?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('')
    router.push('/customers')
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลลูกค้า...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <User className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => router.refresh()} variant="default">
          ลองใหม่
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มลูกค้าใหม่
          </Button>
        </Link>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination ? (
            <>
              แสดง {(pagination.currentPage - 1) * pagination.limit + 1}-
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalCount
              )}{' '}
              จาก {pagination.totalCount} ลูกค้า
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

      {/* Table with optimized rendering */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อลูกค้า</TableHead>
              <TableHead>เบอร์โทรศัพท์</TableHead>
              <TableHead>ช่องทางติดต่อ</TableHead>
              <TableHead>ที่อยู่</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่สร้าง</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-2" />
                    {searchQuery || statusFilter
                      ? 'ไม่พบลูกค้าที่ตรงกับตัวกรอง'
                      : 'ยังไม่มีข้อมูลลูกค้า'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.contactChannel || '-'}</TableCell>
                  <TableCell>{customer.address || '-'}</TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>
                    {new Date(customer.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm" title="ดูรายละเอียด">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">ดูรายละเอียดลูกค้า</span>
                        </Button>
                      </Link>
                      <Link href={`/customers/${customer.id}/edit`}>
                        <Button variant="ghost" size="sm" title="แก้ไขข้อมูล">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">แก้ไขข้อมูลลูกค้า</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Optimized Pagination */}
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
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  const distance = Math.abs(page - pagination.currentPage)
                  return (
                    distance === 0 ||
                    distance === 1 ||
                    page === 1 ||
                    page === pagination.totalPages
                  )
                })
                .map((page, index, filteredPages) => (
                  <div key={`page-${page}`} className="flex items-center">
                    {index > 0 && filteredPages[index - 1] !== page - 1 && (
                      <span className="text-gray-400 mx-1">...</span>
                    )}
                    <Button
                      variant={
                        pagination.currentPage === page ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
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
