'use client'

import { useState, useEffect } from 'react'
import { User } from '@prisma/client'
import { JobStatusDropdown } from '@/components/shared/JobStatusDropdown'
import { UserAssignmentDropdown } from '@/components/shared/UserAssignmentDropdown'
import { JobNotesEditor } from '@/components/shared/JobNotesEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface JobDetailsManagementProps {
  jobId: string
  currentStatus: string
  currentAssignedUser?: {
    id: string
    name: string
    email: string
    role: string
  } | null
  initialNotes: string
}

export function JobDetailsManagement({
  jobId,
  currentStatus,
  currentAssignedUser,
  initialNotes,
}: JobDetailsManagementProps) {
  const [operationsUsers, setOperationsUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Fetch operations users for assignment dropdown
  useEffect(() => {
    async function fetchOperationsUsers() {
      try {
        setIsLoadingUsers(true)
        const response = await fetch('/api/users?role=OPERATIONS')

        if (!response.ok) {
          throw new Error('Failed to fetch operations users')
        }

        const users = await response.json()
        setOperationsUsers(users)
      } catch (error) {
        console.error('Error fetching operations users:', error)
        setUsersError(
          error instanceof Error
            ? error.message
            : 'ไม่สามารถโหลดรายชื่อทีมปฏิบัติการได้'
        )
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchOperationsUsers()
  }, [])

  return (
    <div className="space-y-6">
      {/* Job Status Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">จัดการสถานะงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <JobStatusDropdown
            jobId={jobId}
            currentStatus={currentStatus as any}
          />
        </CardContent>
      </Card>

      {/* Assignment Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">การมอบหมายงาน</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : usersError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{usersError}</AlertDescription>
            </Alert>
          ) : (
            <UserAssignmentDropdown
              jobId={jobId}
              currentAssignedUser={currentAssignedUser}
              operationsUsers={operationsUsers}
            />
          )}
        </CardContent>
      </Card>

      {/* Notes Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">หมายเหตุงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <JobNotesEditor jobId={jobId} initialNotes={initialNotes} />
        </CardContent>
      </Card>
    </div>
  )
}
