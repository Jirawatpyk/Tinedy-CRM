'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { Customer } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function EditCustomerPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('ไม่พบข้อมูลลูกค้า')
          }
          throw new Error('ไม่สามารถโหลดข้อมูลลูกค้าได้')
        }

        const customerData = await response.json()
        setCustomer(customerData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCustomer()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>กำลังโหลดข้อมูลลูกค้า...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">เกิดข้อผิดพลาด</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/customers">กลับสู่รายการลูกค้า</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูลลูกค้า</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              ไม่พบข้อมูลลูกค้าที่คุณค้นหา
            </p>
            <Button variant="outline" asChild>
              <Link href="/customers">กลับสู่รายการลูกค้า</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              กลับสู่รายการลูกค้า
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">แก้ไขข้อมูลลูกค้า</h1>
        <p className="text-muted-foreground">
          แก้ไขข้อมูลลูกค้า {customer.name}
        </p>
      </div>

      <CustomerForm mode="edit" customer={customer} />
    </div>
  )
}
