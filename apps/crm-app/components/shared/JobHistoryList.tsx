'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  FileText,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface JobWithRelations {
  id: string
  serviceType: string
  scheduledDate: string
  price: number
  status: string
  notes?: string
  customer: {
    id: string
    name: string
    phone: string
  }
  assignedUser?: {
    id: string
    name: string
    email: string
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

interface JobHistoryListProps {
  customerId: string
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
}

function JobHistoryListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function JobHistoryList({ customerId }: JobHistoryListProps) {
  const [data, setData] = useState<JobsListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [retrying, setRetrying] = useState(false)

  const fetchJobs = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/customers/${customerId}/jobs?page=${page}&limit=20`
        )

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('ไม่พบข้อมูลลูกค้า')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
        }

        setData(result.data)
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
    [customerId]
  )

  const handleRetry = () => {
    setRetrying(true)
    fetchJobs(currentPage)
  }

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage)
  }

  useEffect(() => {
    fetchJobs()
  }, [customerId, fetchJobs])

  if (loading && !retrying) {
    return <JobHistoryListSkeleton />
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
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              ยังไม่มีประวัติการให้บริการ
            </p>
            <p className="text-sm">ลูกค้าท่านนี้ยังไม่เคยใช้บริการของเรา</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสงาน</TableHead>
              <TableHead>ประเภทบริการ</TableHead>
              <TableHead>วันที่นัด</TableHead>
              <TableHead>ราคา</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>ผู้รับผิดชอบ</TableHead>
              <TableHead>หมายเหตุ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-sm">
                  {job.id.slice(0, 8)}...
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
                  <Badge variant={statusVariants[job.status]}>
                    {statusLabels[job.status] || job.status}
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
                  <span className="text-sm text-muted-foreground">
                    {job.notes || '-'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-mono text-muted-foreground">
                  ID: {job.id.slice(0, 8)}...
                </div>
                <Badge variant={statusVariants[job.status]}>
                  {statusLabels[job.status] || job.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    ประเภทบริการ:
                  </span>
                  <Badge variant="outline">
                    {serviceTypeLabels[job.serviceType] || job.serviceType}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    วันที่นัด:
                  </span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(job.scheduledDate).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ราคา:</span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {job.price.toLocaleString('th-TH')} บาท
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    ผู้รับผิดชอบ:
                  </span>
                  {job.assignedUser ? (
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{job.assignedUser.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      ยังไม่มอบหมาย
                    </span>
                  )}
                </div>

                {job.notes && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      หมายเหตุ:
                    </span>
                    <p className="text-sm mt-1">{job.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
