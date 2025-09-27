import { Suspense } from 'react'
import { Metadata } from 'next'
import { CustomerTable } from '@/components/shared/CustomerTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'รายการลูกค้า | Tinedy CRM',
  description: 'จัดการข้อมูลลูกค้าทั้งหมดในระบบ',
}

export default function CustomersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">รายการลูกค้า</h1>
        <p className="text-muted-foreground">
          จัดการและติดตามข้อมูลลูกค้าทั้งหมดในระบบ
        </p>
      </div>

      <Suspense fallback={<div>กำลังโหลดข้อมูลลูกค้า...</div>}>
        <CustomerTable />
      </Suspense>
    </div>
  )
}
