'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import { JobStatusDropdown } from '@/components/shared/JobStatusDropdown'
import { useSession } from 'next-auth/react'
import { JobStatus } from '@prisma/client'

interface JobWithRelations {
  id: string
  customerId: string
  serviceType: string
  scheduledDate: string
  price: number
  status: string
  notes?: string
  description?: string
  priority: string
  customer: {
    id: string
    name: string
    phone: string
    address?: string
    status: string
  }
  assignedUser?: {
    id: string
    name: string
    email: string
    role: string
  } | null
  createdAt: string
  updatedAt: string
}

interface JobsListResult {
  jobs: JobWithRelations[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const serviceTypeLabels: Record<string, string> = {
  CLEANING: 'ทำความสะอาด',
  TRAINING: 'ฝึกอบรม',
}

const statusLabels: Record<string, string> = {
  NEW: 'ใหม่',
  ASSIGNED: 'มอบหมายแล้ว',
  IN_PROGRESS: 'กำลังดำเนินการ',
  DONE: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิก',
  ON_HOLD: 'หยุดชั่วคราว',
}

const statusVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  NEW: 'outline',
  ASSIGNED: 'secondary',
  IN_PROGRESS: 'default',
  DONE: 'default',
  CANCELLED: 'destructive',
  ON_HOLD: 'secondary',
}

const priorityLabels: Record<string, string> = {
  LOW: 'ต่ำ',
  MEDIUM: 'ปานกลาง',
  HIGH: 'สูง',
  URGENT: 'เร่งด่วน',
}

const priorityVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'default',
  URGENT: 'destructive',
}

function JobsTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function JobsTable() {
  const { data: session } = useSession()
  const [data, setData] = useState<JobsListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [retrying, setRetrying] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')

  const fetchJobs = useCallback(
    async (
      page: number = 1,
      searchTerm: string = '',
      status: string = '',
      serviceType: string = ''
    ) => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
        })

        if (searchTerm) params.append('search', searchTerm)
        if (status && status !== 'all') params.append('status', status)
        if (serviceType && serviceType !== 'all')
          params.append('serviceType', serviceType)

        const response = await fetch(`/api/jobs?${params.toString()}`)

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('ไม่ได้รับอนุญาต')
          }
          if (response.status === 403) {
            throw new Error('ไม่มีสิทธิ์เข้าถึง')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        // Jobs API returns { jobs: [...], pagination: {...} } format
        if (result.jobs) {
          setData(result)
        } else if (result.success) {
          // Handle legacy format with success field
          setData(result.data)
        } else {
          throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        }
        setCurrentPage(page)
      } catch (err) {
        console.error('Error fetching jobs:', err)
        setError(
          err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
        )
      } finally {
        setLoading(false)
        setRetrying(false)
      }
    },
    []
  )

  const handleRetry = () => {
    setRetrying(true)
    fetchJobs(currentPage, search, statusFilter, serviceTypeFilter)
  }

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage, search, statusFilter, serviceTypeFilter)
  }

  const handleSearch = () => {
    fetchJobs(1, search, statusFilter, serviceTypeFilter)
  }

  const handleFilterChange = () => {
    fetchJobs(1, search, statusFilter, serviceTypeFilter)
  }

  // Check if user can update a job's status
  const canUpdateJobStatus = useCallback(
    (job: JobWithRelations): boolean => {
      if (!session?.user) return false

      const isAdmin = session.user.role === 'ADMIN'
      const isAssignedUser = session.user.id === job.assignedUser?.id

      return isAdmin || isAssignedUser
    },
    [session]
  )

  // Handle status change from dropdown
  const handleStatusChange = useCallback(
    (jobId: string, newStatus: JobStatus) => {
      // Refresh the table after status update
      fetchJobs(currentPage, search, statusFilter, serviceTypeFilter)
    },
    [currentPage, search, statusFilter, serviceTypeFilter, fetchJobs]
  )

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  if (loading && !retrying) {
    return <JobsTableSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                กำลังลองใหม่...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                ลองใหม่
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!data || data.jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ยังไม่มีงานบริการ
        </h3>
        <p className="text-gray-500">เริ่มต้นโดยการสร้างงานบริการแรก</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ค้นหางาน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} size="sm">
            ค้นหา
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setTimeout(handleFilterChange, 0)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="NEW">ใหม่</SelectItem>
              <SelectItem value="ASSIGNED">มอบหมายแล้ว</SelectItem>
              <SelectItem value="IN_PROGRESS">กำลังดำเนินการ</SelectItem>
              <SelectItem value="DONE">เสร็จสิ้น</SelectItem>
              <SelectItem value="ON_HOLD">หยุดชั่วคราว</SelectItem>
              <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={serviceTypeFilter}
            onValueChange={(value) => {
              setServiceTypeFilter(value)
              setTimeout(handleFilterChange, 0)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ประเภทบริการ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกประเภท</SelectItem>
              <SelectItem value="CLEANING">ทำความสะอาด</SelectItem>
              <SelectItem value="TRAINING">ฝึกอบรม</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสงาน</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>ประเภทบริการ</TableHead>
              <TableHead>วันที่นัด</TableHead>
              <TableHead>ราคา</TableHead>
              <TableHead>อัปเดตสถานะ</TableHead>
              <TableHead>ความสำคัญ</TableHead>
              <TableHead>ผู้รับผิดชอบ</TableHead>
              <TableHead>การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-sm">
                  {job.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{job.customer.name}</div>
                    <div className="text-sm text-gray-500">
                      {job.customer.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {serviceTypeLabels[job.serviceType] || job.serviceType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(job.scheduledDate).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {job.price.toLocaleString('th-TH')} บาท
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {canUpdateJobStatus(job) ? (
                    <JobStatusDropdown
                      jobId={job.id}
                      currentStatus={job.status as JobStatus}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(job.id, newStatus)
                      }
                    />
                  ) : (
                    <Badge variant={statusVariants[job.status]}>
                      {statusLabels[job.status] || job.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariants[job.priority]}>
                    {priorityLabels[job.priority] || job.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.assignedUser ? (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{job.assignedUser.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      ยังไม่มอบหมาย
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      ดูรายละเอียด
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            แสดง {(data.pagination.page - 1) * data.pagination.limit + 1}-
            {Math.min(
              data.pagination.page * data.pagination.limit,
              data.pagination.totalCount
            )}
            จาก {data.pagination.totalCount} รายการ
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!data.pagination.hasPreviousPage || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              ก่อนหน้า
            </Button>

            <div className="flex items-center space-x-1">
              <span className="text-sm">
                หน้า {data.pagination.page} จาก {data.pagination.totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!data.pagination.hasNextPage || loading}
            >
              ถัดไป
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
