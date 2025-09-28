'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Customer,
  CustomerCreateInput,
  CustomerUpdateInput,
} from '@/types'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const customerSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อลูกค้า'),
  phone: z.string().min(1, 'กรุณาระบุเบอร์โทรศัพท์'),
  address: z.string().optional(),
  contactChannel: z.string().min(1, 'กรุณาระบุช่องทางติดต่อ'),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  customer?: Customer
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function CustomerForm({ customer, mode, onSuccess }: CustomerFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      contactChannel: customer?.contactChannel || '',
    },
  })

  const onSubmit = async (data: CustomerFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const url =
        mode === 'create' ? '/api/customers' : `/api/customers/${customer?.id}`

      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (errorData.errors) {
          // Set field-specific errors
          Object.entries(errorData.errors).forEach(([field, message]) => {
            form.setError(field as keyof CustomerFormData, {
              message: message as string,
            })
          })
          return
        }

        throw new Error(errorData.error || 'ไม่สามารถบันทึกข้อมูลลูกค้าได้')
      }

      // Success
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/customers')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'เพิ่มลูกค้าใหม่' : 'แก้ไขข้อมูลลูกค้า'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อลูกค้า *</FormLabel>
                  <FormControl>
                    <Input placeholder="ระบุชื่อลูกค้า" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เบอร์โทรศัพท์ *</FormLabel>
                  <FormControl>
                    <Input placeholder="ระบุเบอร์โทรศัพท์" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactChannel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ช่องทางติดต่อ *</FormLabel>
                  <FormControl>
                    <Input placeholder="LINE, โทรศัพท์, อื่นๆ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ที่อยู่</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ที่อยู่ลูกค้า (เลือกได้)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    data-testid="loading-spinner"
                  />
                )}
                {mode === 'create' ? 'สร้างลูกค้า' : 'บันทึกข้อมูล'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
