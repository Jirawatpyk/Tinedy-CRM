'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  phone: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface JobFormData {
  customerId: string
  serviceType: string
  scheduledDate: string
  price: number
  description: string
  notes: string
  priority: string
  assignedUserId: string
}

const serviceTypes = [
  { value: 'CLEANING', label: 'ทำความสะอาด' },
  { value: 'TRAINING', label: 'ฝึกอบรม' },
]

const priorities = [
  { value: 'LOW', label: 'ต่ำ' },
  { value: 'MEDIUM', label: 'ปานกลาง' },
  { value: 'HIGH', label: 'สูง' },
  { value: 'URGENT', label: 'เร่งด่วน' },
]

export function JobForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [formData, setFormData] = useState<JobFormData>({
    customerId: '',
    serviceType: '',
    scheduledDate: '',
    price: 0,
    description: '',
    notes: '',
    priority: 'MEDIUM',
    assignedUserId: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchData() {
      try {
        const [customersRes, usersRes] = await Promise.all([
          fetch('/api/customers?limit=100'),
          fetch('/api/users?role=OPERATIONS'),
        ])

        if (customersRes.ok) {
          const customersData = await customersRes.json()
          setCustomers(customersData.customers || [])
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          // API returns array directly for getOperationsUsers
          setUsers(Array.isArray(usersData) ? usersData : usersData.users || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setErrors({})

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          assignedUserId: formData.assignedUserId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setError(data.error || 'เกิดข้อผิดพลาดในการสร้างงาน')
        }
        return
      }

      router.push('/jobs')
    } catch (error) {
      console.error('Error creating job:', error)
      setError('เกิดข้อผิดพลาดที่ไม่คาดคิด')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="customerId">ลูกค้า *</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => handleChange('customerId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกลูกค้า" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-sm text-red-500">{errors.customerId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">ประเภทบริการ *</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => handleChange('serviceType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทบริการ" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-sm text-red-500">{errors.serviceType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledDate">วันที่นัดหมาย</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => handleChange('scheduledDate', e.target.value)}
            />
            {errors.scheduledDate && (
              <p className="text-sm text-red-500">{errors.scheduledDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">ราคา (บาท) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', Number(e.target.value))}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">ความสำคัญ</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกความสำคัญ" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedUserId">มอบหมายให้</Label>
            <Select
              value={formData.assignedUserId}
              onValueChange={(value) => handleChange('assignedUserId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกผู้รับผิดชอบ (ไม่บังคับ)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ไม่มอบหมาย</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">รายละเอียดงาน</Label>
          <Textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="กรอกรายละเอียดของงาน..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">หมายเหตุ</Label>
          <Textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="หมายเหตุเพิ่มเติม..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <Link href="/jobs">
            <Button type="button" variant="outline">
              ยกเลิก
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังสร้าง...
              </>
            ) : (
              'สร้างงาน'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
