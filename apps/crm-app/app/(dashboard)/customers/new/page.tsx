'use client'

import { CustomerForm } from '@/components/forms/CustomerForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NewCustomerPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              กลับไปรายการลูกค้า
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">เพิ่มลูกค้าใหม่</h1>
        <p className="text-muted-foreground">
          สร้างข้อมูลลูกค้าใหม่ในระบบ
        </p>
      </div>

      <CustomerForm mode="create" />
    </div>
  )
}
