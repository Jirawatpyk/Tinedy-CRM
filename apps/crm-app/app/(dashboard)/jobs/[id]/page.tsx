import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JobService } from '@/lib/services/JobService'
import { JobDetailsManagement } from '@/components/jobs/JobDetailsManagement'
import { JobChecklistSection } from '@/components/shared/JobChecklistSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  FileText,
  DollarSign,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

interface JobDetailsPageProps {
  params: {
    id: string
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'NEW':
      return 'secondary'
    case 'ASSIGNED':
      return 'secondary'
    case 'IN_PROGRESS':
      return 'default'
    case 'DONE':
      return 'default'
    case 'COMPLETED':
      return 'default'
    case 'CANCELLED':
      return 'destructive'
    case 'ON_HOLD':
      return 'outline'
    default:
      return 'secondary'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'NEW':
      return 'งานใหม่'
    case 'ASSIGNED':
      return 'มอบหมายแล้ว'
    case 'IN_PROGRESS':
      return 'กำลังดำเนินการ'
    case 'DONE':
      return 'เสร็จแล้ว'
    case 'COMPLETED':
      return 'เสร็จแล้ว'
    case 'CANCELLED':
      return 'ยกเลิก'
    case 'ON_HOLD':
      return 'หยุดชั่วคราว'
    default:
      return status
  }
}

function getPriorityBadgeVariant(priority: string) {
  switch (priority) {
    case 'LOW':
      return 'secondary'
    case 'MEDIUM':
      return 'outline'
    case 'HIGH':
      return 'default'
    case 'URGENT':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case 'LOW':
      return 'ต่ำ'
    case 'MEDIUM':
      return 'ปานกลาง'
    case 'HIGH':
      return 'สูง'
    case 'URGENT':
      return 'เร่งด่วน'
    default:
      return priority
  }
}

async function JobDetails({ jobId }: { jobId: string }) {
  try {
    const job = await JobService.getJobById(jobId)

    if (!job) {
      notFound()
    }

    return (
      <div className="space-y-6">
        {/* Job Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">ข้อมูลงาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  รหัสงาน
                </label>
                <p className="font-mono text-sm">{job.id}</p>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  ประเภทบริการ
                </label>
                <p className="font-semibold">
                  {job.serviceType === 'CLEANING'
                    ? 'ทำความสะอาด'
                    : job.serviceType === 'TRAINING'
                      ? 'ฝึกอบรม'
                      : job.serviceType}
                </p>
              </div>

              {/* Price */}
              {job.price && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    ราคา
                  </label>
                  <p className="font-semibold text-lg">
                    {parseFloat(job.price.toString()).toLocaleString('th-TH')}{' '}
                    บาท
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  สถานะ
                </label>
                <div>
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {getStatusLabel(job.status)}
                  </Badge>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  ลำดับความสำคัญ
                </label>
                <div>
                  <Badge variant={getPriorityBadgeVariant(job.priority)}>
                    {getPriorityLabel(job.priority)}
                  </Badge>
                </div>
              </div>

              {/* Scheduled Date */}
              {job.scheduledDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    วันที่นัดหมาย
                  </label>
                  <p>
                    {new Date(job.scheduledDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              {/* Completed Date */}
              {job.completedAt && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    วันที่เสร็จ
                  </label>
                  <p>
                    {new Date(job.completedAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              {/* Created Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  <Clock className="w-4 h-4 inline mr-1" />
                  วันที่สร้าง
                </label>
                <p>
                  {new Date(job.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Updated Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  วันที่อัปเดต
                </label>
                <p>
                  {new Date(job.updatedAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  <FileText className="w-4 h-4 inline mr-1" />
                  รายละเอียดงาน
                </label>
                <p className="p-3 bg-muted rounded-md">{job.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">ข้อมูลลูกค้า</CardTitle>
              <Link href={`/customers/${job.customer.id}`}>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  ดูรายละเอียดลูกค้า
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  ชื่อลูกค้า
                </label>
                <p className="text-lg font-semibold">{job.customer.name}</p>
              </div>

              {/* Customer Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  สถานะลูกค้า
                </label>
                <div>
                  <Badge
                    variant={
                      job.customer.status === 'ACTIVE' ? 'default' : 'secondary'
                    }
                  >
                    {job.customer.status === 'ACTIVE' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </Badge>
                </div>
              </div>

              {/* Phone */}
              {job.customer.phone && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    <Phone className="w-4 h-4 inline mr-1" />
                    เบอร์โทรศัพท์
                  </label>
                  <p className="font-mono">{job.customer.phone}</p>
                </div>
              )}

              {/* Address */}
              {job.customer.address && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    ที่อยู่
                  </label>
                  <p>{job.customer.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Job Management Section */}
        <JobDetailsManagement
          jobId={job.id}
          currentStatus={job.status}
          currentAssignedUser={job.assignedUser}
          initialNotes={job.notes || ''}
        />

        {/* Quality Control Checklist Section */}
        <JobChecklistSection
          jobId={job.id}
          serviceType={job.serviceType}
          isAdmin={true}
        />
      </div>
    )
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลงาน:', error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          เกิดข้อผิดพลาดในการโหลดข้อมูลงาน กรุณาลองใหม่อีกครั้ง
        </AlertDescription>
      </Alert>
    )
  }
}

function JobDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Job Information Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Notes Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export async function generateMetadata({
  params,
}: JobDetailsPageProps): Promise<Metadata> {
  try {
    const job = await JobService.getJobById(params.id)

    if (!job) {
      return {
        title: 'ไม่พบงาน | Tinedy CRM',
        description: 'ไม่พบข้อมูลงานที่ต้องการ',
      }
    }

    return {
      title: `งาน #${job.id.slice(-8)} | รายละเอียดงาน | Tinedy CRM`,
      description: `รายละเอียดงาน ${job.serviceType} สำหรับลูกค้า ${job.customer.name}`,
    }
  } catch (error) {
    return {
      title: 'รายละเอียดงาน | Tinedy CRM',
      description: 'ดูรายละเอียดและจัดการข้อมูลงาน',
    }
  }
}

async function JobDetailsPageHeader({ jobId }: { jobId: string }) {
  try {
    const job = await JobService.getJobById(jobId)

    if (!job) {
      return (
        <div className="mb-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground">
              หน้าหลัก
            </Link>
            <span>/</span>
            <Link href="/customers" className="hover:text-foreground">
              รายการลูกค้า
            </Link>
            <span>/</span>
            <span className="text-foreground">
              รายละเอียดงาน #{jobId.slice(-8)}
            </span>
          </nav>
        </div>
      )
    }

    return (
      <div className="mb-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">
            หน้าหลัก
          </Link>
          <span>/</span>
          <Link href="/customers" className="hover:text-foreground">
            รายการลูกค้า
          </Link>
          <span>/</span>
          <Link
            href={`/customers/${job.customer.id}`}
            className="hover:text-foreground"
          >
            {job.customer.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">
            รายละเอียดงาน #{jobId.slice(-8)}
          </span>
        </nav>

        <div className="space-y-3">
          <Link href={`/customers/${job.customer.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าลูกค้า
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">รายละเอียดงาน</h1>
            <p className="text-sm text-muted-foreground">
              ดูรายละเอียดและจัดการข้อมูลงาน สำหรับลูกค้า {job.customer.name}
            </p>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="mb-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">
            หน้าหลัก
          </Link>
          <span>/</span>
          <Link href="/customers" className="hover:text-foreground">
            รายการลูกค้า
          </Link>
          <span>/</span>
          <span className="text-foreground">
            รายละเอียดงาน #{jobId.slice(-8)}
          </span>
        </nav>

        <div className="space-y-3">
          <Link href="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปรายการลูกค้า
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">รายละเอียดงาน</h1>
            <p className="text-sm text-muted-foreground">
              ดูรายละเอียดและจัดการข้อมูลงาน
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  return (
    <div className="container mx-auto py-4">
      {/* Breadcrumbs Navigation */}
      <Suspense
        fallback={
          <div className="mb-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground">
                หน้าหลัก
              </Link>
              <span>/</span>
              <Link href="/customers" className="hover:text-foreground">
                รายการลูกค้า
              </Link>
              <span>/</span>
              <span className="text-foreground">
                รายละเอียดงาน #{params.id.slice(-8)}
              </span>
            </nav>
            <div className="space-y-3">
              <Link href="/customers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับไปรายการลูกค้า
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  รายละเอียดงาน
                </h1>
                <p className="text-sm text-muted-foreground">
                  ดูรายละเอียดและจัดการข้อมูลงาน
                </p>
              </div>
            </div>
          </div>
        }
      >
        <JobDetailsPageHeader jobId={params.id} />
      </Suspense>

      {/* Job Details Content */}
      <Suspense fallback={<JobDetailsSkeleton />}>
        <JobDetails jobId={params.id} />
      </Suspense>
    </div>
  )
}
