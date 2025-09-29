import { Metadata } from 'next'
import { CustomerTableServer } from '@/components/shared/CustomerTableServer'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'รายการลูกค้า | Tinedy CRM',
  description: 'จัดการข้อมูลลูกค้าทั้งหมดในระบบ',
}

interface CustomersPageProps {
  searchParams?: {
    q?: string
    status?: string
    page?: string
    limit?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
}

export default function CustomersPage({ searchParams }: CustomersPageProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">รายการลูกค้า</h1>
        <p className="text-muted-foreground">
          จัดการและติดตามข้อมูลลูกค้าทั้งหมดในระบบ
        </p>
      </div>

      <CustomerTableServer searchParams={searchParams} />
    </div>
  )
}
