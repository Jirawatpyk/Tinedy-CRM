import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CustomerService } from '@/lib/services/customer'
import { JobHistoryList } from '@/components/shared/JobHistoryList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Edit,
  Phone,
  MapPin,
  MessageCircle,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

interface CustomerDetailsPageProps {
  params: {
    id: string
  }
}

async function CustomerDetails({ customerId }: { customerId: string }) {
  try {
    const customer = await CustomerService.getCustomerById(customerId)

    if (!customer) {
      notFound()
    }

    return (
      <div className="space-y-6">
        {/* Customer Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">ข้อมูลลูกค้า</CardTitle>
              <Link href={`/customers/${customer.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไขข้อมูล
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
                <p className="text-lg font-semibold">{customer.name}</p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  สถานะ
                </label>
                <div>
                  <Badge
                    variant={
                      customer.status === 'ACTIVE' ? 'default' : 'secondary'
                    }
                  >
                    {customer.status === 'ACTIVE' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </Badge>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  <Phone className="w-4 h-4 inline mr-1" />
                  เบอร์โทรศัพท์
                </label>
                <p className="font-mono">{customer.phone}</p>
              </div>

              {/* Contact Channel */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  ช่องทางติดต่อ
                </label>
                <p>{customer.contactChannel}</p>
              </div>

              {/* Address */}
              {customer.address && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    ที่อยู่
                  </label>
                  <p>{customer.address}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  วันที่สร้าง
                </label>
                <p>
                  {new Date(customer.createdAt).toLocaleDateString('th-TH', {
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
                  {new Date(customer.updatedAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job History Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">ประวัติการให้บริการ</CardTitle>
          </CardHeader>
          <CardContent>
            <JobHistoryList customerId={customer.id} />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า:', error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า กรุณาลองใหม่อีกครั้ง
        </AlertDescription>
      </Alert>
    )
  }
}

function CustomerDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export async function generateMetadata({
  params,
}: CustomerDetailsPageProps): Promise<Metadata> {
  try {
    const customer = await CustomerService.getCustomerById(params.id)

    if (!customer) {
      return {
        title: 'ไม่พบลูกค้า | Tinedy CRM',
        description: 'ไม่พบข้อมูลลูกค้าที่ต้องการ',
      }
    }

    return {
      title: `${customer.name} | รายละเอียดลูกค้า | Tinedy CRM`,
      description: `ข้อมูลและประวัติการให้บริการของลูกค้า ${customer.name}`,
    }
  } catch (error) {
    return {
      title: 'รายละเอียดลูกค้า | Tinedy CRM',
      description: 'ดูข้อมูลและประวัติการให้บริการของลูกค้า',
    }
  }
}

export default function CustomerDetailsPage({
  params,
}: CustomerDetailsPageProps) {
  return (
    <div className="container mx-auto py-4">
      {/* Breadcrumbs Navigation */}
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
          <span className="text-foreground">รายละเอียดลูกค้า</span>
        </nav>

        <div className="space-y-3">
          <Link href="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับสู่รายการลูกค้า
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              รายละเอียดลูกค้า
            </h1>
            <p className="text-sm text-muted-foreground">
              ดูข้อมูลและประวัติการให้บริการของลูกค้า
            </p>
          </div>
        </div>
      </div>

      {/* Customer Details Content */}
      <Suspense fallback={<CustomerDetailsSkeleton />}>
        <CustomerDetails customerId={params.id} />
      </Suspense>
    </div>
  )
}
