'use client'

import { useState } from 'react'
import { User } from '@prisma/client'

type AssignedUser = {
  id: string
  name: string
  email: string
  role: string
}
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
import { Loader2, User as UserIcon, UserX } from 'lucide-react'

interface UserAssignmentDropdownProps {
  jobId: string
  currentAssignedUser?: AssignedUser | null
  operationsUsers: User[]
  onAssignmentChange?: (newAssignedUser: User | null) => void
}

export function UserAssignmentDropdown({
  jobId,
  currentAssignedUser,
  operationsUsers,
  onAssignmentChange,
}: UserAssignmentDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleUserSelect = (value: string) => {
    const userId = value === 'unassign' ? null : value

    // Don't show dialog if selecting same user
    if (userId === currentAssignedUser?.id) return

    setSelectedUserId(userId)
    setShowConfirmDialog(true)
  }

  const handleConfirmAssignment = async () => {
    setIsLoading(true)
    setShowConfirmDialog(false)

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedToId: selectedUserId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการมอบหมายงาน')
      }

      const updatedJob = await response.json()

      const assignedUser = selectedUserId
        ? operationsUsers.find((user) => user.id === selectedUserId)
        : null

      if (selectedUserId) {
        toast.success('มอบหมายงานสำเร็จ', {
          description: `มอบหมายงานให้ ${assignedUser?.name} แล้ว`,
        })
      } else {
        toast.success('ยกเลิกการมอบหมายสำเร็จ', {
          description: 'ยกเลิกการมอบหมายงานแล้ว',
        })
      }

      // Call the callback if provided
      if (onAssignmentChange) {
        onAssignmentChange(assignedUser || null)
      }

      // Refresh the page to update all related data
      window.location.reload()
    } catch (error) {
      console.error('Error updating job assignment:', error)
      toast.error('เกิดข้อผิดพลาด', {
        description:
          error instanceof Error ? error.message : 'ไม่สามารถมอบหมายงานได้',
      })
    } finally {
      setIsLoading(false)
      setSelectedUserId(null)
    }
  }

  const handleCancelAssignment = () => {
    setShowConfirmDialog(false)
    setSelectedUserId(null)
  }

  const selectedUser = selectedUserId
    ? operationsUsers.find((user) => user.id === selectedUserId)
    : null

  const getConfirmationContent = () => {
    if (selectedUserId === null) {
      return {
        title: 'ยืนยันการยกเลิกมอบหมาย',
        description: `คุณต้องการยกเลิกการมอบหมายงานจาก "${currentAssignedUser?.name}" ใช่หรือไม่?`,
        confirmText: 'ยกเลิกมอบหมาย',
      }
    }

    if (currentAssignedUser) {
      return {
        title: 'ยืนยันการเปลี่ยนผู้รับผิดชอบ',
        description: `คุณต้องการเปลี่ยนผู้รับผิดชอบจาก "${currentAssignedUser.name}" เป็น "${selectedUser?.name}" ใช่หรือไม่?`,
        confirmText: 'เปลี่ยนผู้รับผิดชอบ',
      }
    }

    return {
      title: 'ยืนยันการมอบหมายงาน',
      description: `คุณต้องการมอบหมายงานให้ "${selectedUser?.name}" ใช่หรือไม่?`,
      confirmText: 'มอบหมายงาน',
    }
  }

  const confirmation = getConfirmationContent()

  return (
    <>
      <div className="space-y-4">
        {/* Current Assignment Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            ผู้รับผิดชอบปัจจุบัน
          </label>
          {currentAssignedUser ? (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                {currentAssignedUser.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ({currentAssignedUser.email})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <UserX className="w-3 h-3" />
                ยังไม่ได้มอบหมาย
              </Badge>
            </div>
          )}
        </div>

        {/* Assignment Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            เปลี่ยนผู้รับผิดชอบ
          </label>
          <Select
            value={currentAssignedUser?.id || ''}
            onValueChange={handleUserSelect}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังอัปเดต...</span>
                </div>
              ) : (
                <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
              )}
            </SelectTrigger>
            <SelectContent>
              {/* Unassign option */}
              <SelectItem value="unassign">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  ยกเลิกการมอบหมาย
                </div>
              </SelectItem>

              {/* Available operations users */}
              {operationsUsers.length > 0 ? (
                operationsUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-users" disabled>
                  ไม่มีผู้ใช้ทีมปฏิบัติการ
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Actions */}
        {currentAssignedUser && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUserSelect('unassign')}
              disabled={isLoading}
            >
              <UserX className="w-4 h-4 mr-2" />
              ยกเลิกมอบหมาย
            </Button>
          </div>
        )}
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
            <AlertDialogCancel onClick={handleCancelAssignment}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAssignment}>
              {confirmation.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
