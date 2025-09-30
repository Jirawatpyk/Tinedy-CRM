// JobChecklistSection Component
// Story 2.5: Checklist section for job details page
'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChecklistExecutor } from './ChecklistExecutor'
import { ChecklistTemplateSelector } from './ChecklistTemplateSelector'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, ListChecks, Trash2 } from 'lucide-react'
import { logError } from '@/lib/logger'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ServiceType } from '@prisma/client'

interface JobChecklistData {
  checklistTemplateId: string | null
  itemStatus: Record<string, boolean> | null
  checklistCompletedAt: string | null
  checklistTemplate?: {
    id: string
    name: string
    description?: string
    items: string[]
  }
  checklistProgress?: {
    completed: number
    total: number
    percentage: number
    isComplete: boolean
  }
}

interface JobChecklistSectionProps {
  jobId: string
  serviceType: ServiceType
  isAdmin: boolean
}

export function JobChecklistSection({
  jobId,
  serviceType,
  isAdmin,
}: JobChecklistSectionProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [checklistData, setChecklistData] = useState<JobChecklistData | null>(
    null
  )
  const [detaching, setDetaching] = useState(false)

  // Fetch job checklist data
  const fetchChecklistData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/jobs/${jobId}/checklist-data`)

      if (response.ok) {
        const result = await response.json()
        setChecklistData(result.data)
      } else if (response.status === 404) {
        // Job exists but no checklist attached
        setChecklistData({
          checklistTemplateId: null,
          itemStatus: null,
          checklistCompletedAt: null,
        })
      }
    } catch (error) {
      logError('Error fetching job checklist data', error, {
        component: 'JobChecklistSection',
        jobId,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChecklistData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId])

  // Handle detach checklist
  const handleDetachChecklist = async () => {
    try {
      setDetaching(true)
      const response = await fetch(`/api/jobs/${jobId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: null }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: result.message,
        })
        fetchChecklistData()
      } else {
        throw new Error(result.error || 'Failed to detach checklist')
      }
    } catch (error: any) {
      logError('Error detaching checklist', error, {
        component: 'JobChecklistSection',
        jobId,
      })
      toast({
        title: 'Error',
        description: error.message || 'Failed to detach checklist',
        variant: 'destructive',
      })
    } finally {
      setDetaching(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  // No checklist attached
  if (!checklistData?.checklistTemplateId || !checklistData.checklistTemplate) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Quality Control Checklist
              </CardTitle>
              <CardDescription className="mt-2">
                No checklist template attached to this job
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isAdmin ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Attach a checklist template to track quality control for this
                job
              </p>
              <ChecklistTemplateSelector
                jobId={jobId}
                serviceType={serviceType}
                currentTemplateId={null}
                onAttached={fetchChecklistData}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No checklist has been assigned to this job yet
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Checklist attached
  return (
    <div className="space-y-4">
      {/* Admin Controls */}
      {isAdmin && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Checklist Template Management
                </p>
                <p className="text-xs text-muted-foreground">
                  Change or remove checklist template for this job
                </p>
              </div>
              <div className="flex gap-2">
                <ChecklistTemplateSelector
                  jobId={jobId}
                  serviceType={serviceType}
                  currentTemplateId={checklistData.checklistTemplateId}
                  onAttached={fetchChecklistData}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={detaching}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Checklist?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the checklist from this job. All
                        progress will be lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDetachChecklist}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Executor */}
      <ChecklistExecutor
        jobId={jobId}
        templateName={checklistData.checklistTemplate.name}
        items={checklistData.checklistTemplate.items}
        currentStatus={checklistData.itemStatus || {}}
        readonly={!isAdmin && checklistData.checklistProgress?.isComplete}
        onStatusUpdate={fetchChecklistData}
      />

      {/* Completion Badge */}
      {checklistData.checklistCompletedAt && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Checklist Completed
                </p>
                <p className="text-xs text-green-700">
                  Completed on{' '}
                  {new Date(
                    checklistData.checklistCompletedAt
                  ).toLocaleDateString('th-TH', {
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
      )}
    </div>
  )
}
