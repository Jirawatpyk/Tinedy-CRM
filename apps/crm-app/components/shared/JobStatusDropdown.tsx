'use client'

import { useState, useMemo } from 'react'
import { JobStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { getValidNextStatuses } from '@/lib/utils/jobStatus'

interface JobStatusDropdownProps {
  jobId: string
  currentStatus: JobStatus
  onStatusChange?: (newStatus: JobStatus) => void
}

function getStatusLabel(status: JobStatus): string {
  switch (status) {
    case 'NEW':
      return 'งานใหม่'
    case 'ASSIGNED':
      return 'ได้รับมอบหมาย'
    case 'IN_PROGRESS':
      return 'กำลังดำเนินการ'
    case 'COMPLETED':
      return 'เสร็จแล้ว'
    case 'DONE':
      return 'เสร็จแล้ว'
    case 'CANCELLED':
      return 'ยกเลิก'
    case 'ON_HOLD':
      return 'หยุดชั่วคราว'
    default:
      return status
  }
}

function getStatusBadgeVariant(status: JobStatus) {
  switch (status) {
    case 'NEW':
      return 'secondary'
    case 'ASSIGNED':
      return 'outline'
    case 'IN_PROGRESS':
      return 'default'
    case 'COMPLETED':
      return 'default'
    case 'DONE':
      return 'default'
    case 'CANCELLED':
      return 'destructive'
    case 'ON_HOLD':
      return 'outline'
    default:
      return 'secondary'
  }
}

function getStatusChangeConfirmation(
  fromStatus: JobStatus,
  toStatus: JobStatus
): {
  title: string
  description: string
  confirmText: string
} {
  if (toStatus === 'COMPLETED') {
    return {
      title: 'ยืนยันการเสร็จสิ้นงาน',
      description:
        'คุณต้องการเปลี่ยนสถานะงานเป็น "เสร็จแล้ว" ใช่หรือไม่? วันที่เสร็จจะถูกบันทึกโดยอัตโนมัติ',
      confirmText: 'เสร็จแล้ว',
    }
  }

  if (toStatus === 'CANCELLED') {
    return {
      title: 'ยืนยันการยกเลิกงาน',
      description:
        'คุณต้องการยกเลิกงานนี้ใช่หรือไม่? การยกเลิกจะส่งผลต่อการติดตามงานและรายงาน',
      confirmText: 'ยกเลิกงาน',
    }
  }

  if (fromStatus === 'DONE' && toStatus !== 'DONE') {
    return {
      title: 'ยืนยันการเปลี่ยนสถานะ',
      description:
        'งานนี้เสร็จแล้ว คุณต้องการเปลี่ยนสถานะกลับเป็น "ยังไม่เสร็จ" ใช่หรือไม่?',
      confirmText: 'เปลี่ยนสถานะ',
    }
  }

  return {
    title: 'ยืนยันการเปลี่ยนสถานะ',
    description: `คุณต้องการเปลี่ยนสถานะจาก "${getStatusLabel(fromStatus)}" เป็น "${getStatusLabel(toStatus)}" ใช่หรือไม่?`,
    confirmText: 'เปลี่ยนสถานะ',
  }
}

const statusOptions: { value: JobStatus; label: string }[] = [
  { value: 'NEW', label: 'งานใหม่' },
  { value: 'ASSIGNED', label: 'ได้รับมอบหมาย' },
  { value: 'IN_PROGRESS', label: 'กำลังดำเนินการ' },
  { value: 'DONE', label: 'เสร็จแล้ว' },
  { value: 'ON_HOLD', label: 'หยุดชั่วคราว' },
  { value: 'CANCELLED', label: 'ยกเลิก' },
]

export function JobStatusDropdown({
  jobId,
  currentStatus,
  onStatusChange,
}: JobStatusDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Filter status options to show only valid next statuses
  const filteredStatusOptions = useMemo(() => {
    const validNextStatuses = getValidNextStatuses(currentStatus)

    // Include current status in the options for display purposes
    const validStatusesSet = new Set([currentStatus, ...validNextStatuses])

    return statusOptions.filter((option) => validStatusesSet.has(option.value))
  }, [currentStatus])

  const handleStatusSelect = (newStatus: string) => {
    const status = newStatus as JobStatus
    if (status === currentStatus) return

    setSelectedStatus(status)
    setShowConfirmDialog(true)
  }

  const handleConfirmStatusChange = async () => {
    if (!selectedStatus) return

    setIsLoading(true)
    setShowConfirmDialog(false)

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ')
      }

      const updatedJob = await response.json()

      toast.success('อัปเดตสถานะงานสำเร็จ', {
        description: `เปลี่ยนสถานะเป็น "${getStatusLabel(selectedStatus)}" แล้ว`,
      })

      // Call the callback if provided
      if (onStatusChange) {
        onStatusChange(selectedStatus)
      }

      // Refresh the page to update all related data
      window.location.reload()
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('เกิดข้อผิดพลาด', {
        description:
          error instanceof Error ? error.message : 'ไม่สามารถอัปเดตสถานะงานได้',
      })
    } finally {
      setIsLoading(false)
      setSelectedStatus(null)
    }
  }

  const handleCancelStatusChange = () => {
    setShowConfirmDialog(false)
    setSelectedStatus(null)
  }

  const confirmation = selectedStatus
    ? getStatusChangeConfirmation(currentStatus, selectedStatus)
    : { title: '', description: '', confirmText: '' }

  return (
    <>
      <div className="flex items-center gap-3">
        <Badge variant={getStatusBadgeVariant(currentStatus)}>
          {getStatusLabel(currentStatus)}
        </Badge>

        <Select
          value={currentStatus}
          onValueChange={handleStatusSelect}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px]">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังอัปเดต...</span>
              </div>
            ) : (
              <SelectValue placeholder="เลือกสถานะ" />
            )}
          </SelectTrigger>
          <SelectContent>
            {filteredStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelStatusChange}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              {confirmation.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
