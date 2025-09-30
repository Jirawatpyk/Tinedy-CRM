// ChecklistExecutor Component
// Story 2.5: Operations team checklist execution interface
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { logError } from '@/lib/logger'

interface ChecklistExecutorProps {
  jobId: string
  templateName: string
  items: string[]
  currentStatus?: Record<string, boolean>
  readonly?: boolean
  onStatusUpdate?: () => void
}

export function ChecklistExecutor({
  jobId,
  templateName,
  items,
  currentStatus = {},
  readonly = false,
  onStatusUpdate,
}: ChecklistExecutorProps) {
  const { toast } = useToast()
  const [itemStatus, setItemStatus] =
    useState<Record<string, boolean>>(currentStatus)
  const [saving, setSaving] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  )
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize status from props
  useEffect(() => {
    setItemStatus(currentStatus)
  }, [currentStatus])

  // Calculate progress
  const completedCount = Object.values(itemStatus).filter(Boolean).length
  const totalCount = items.length
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const isFullyCompleted = completedCount === totalCount && totalCount > 0

  // Auto-save function with AbortController support
  const saveStatus = async (newStatus: Record<string, boolean>) => {
    if (readonly) return

    // Cancel previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setSaving(true)
      const response = await fetch(`/api/jobs/${jobId}/checklist-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemStatus: newStatus }),
        signal: controller.signal,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Saved',
          description: 'Checklist progress saved successfully',
        })
        if (onStatusUpdate) {
          onStatusUpdate()
        }
      } else {
        throw new Error(result.error || 'Failed to save checklist status')
      }
    } catch (error: any) {
      // Don't show error toast if request was aborted (normal behavior)
      if (error.name === 'AbortError') {
        return
      }

      logError('Error saving checklist status', error, {
        component: 'ChecklistExecutor',
        jobId,
        templateName,
      })
      toast({
        title: 'Error',
        description: error.message || 'Failed to save checklist status',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle checkbox change with auto-save debounce
  const handleToggleItem = (item: string, checked: boolean) => {
    if (readonly) return

    const newStatus = {
      ...itemStatus,
      [item]: checked,
    }

    setItemStatus(newStatus)

    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    // Set new auto-save timer (1 second delay)
    const timer = setTimeout(() => {
      saveStatus(newStatus)
    }, 1000)

    setAutoSaveTimer(timer)
  }

  // Manual save button
  const handleManualSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      setAutoSaveTimer(null)
    }
    saveStatus(itemStatus)
  }

  // Cleanup timer and abort pending requests on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [autoSaveTimer])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {isFullyCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              {templateName}
            </CardTitle>
            <CardDescription>
              Quality control checklist for this job
            </CardDescription>
          </div>
          {isFullyCompleted && (
            <Badge variant="default" className="bg-green-600">
              Completed
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedCount} / {totalCount} ({progressPercentage}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Checklist Items */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const isChecked = itemStatus[item] || false
            return (
              <div
                key={`${item}-${index}`}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  isChecked
                    ? 'bg-green-50 border-green-200'
                    : 'bg-background border-border hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  id={`item-${index}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleToggleItem(item, checked as boolean)
                  }
                  disabled={readonly || saving}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`item-${index}`}
                  className={`flex-1 text-sm leading-relaxed cursor-pointer ${
                    isChecked ? 'text-green-900 font-medium' : 'text-foreground'
                  } ${readonly ? 'cursor-default' : ''}`}
                >
                  <span className="mr-2 text-muted-foreground">
                    {index + 1}.
                  </span>
                  {item}
                </label>
                {isChecked && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                )}
              </div>
            )
          })}
        </div>

        {/* Save Status */}
        {!readonly && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {saving && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {!saving && autoSaveTimer && (
                <>
                  <Circle className="h-4 w-4" />
                  <span>Changes pending...</span>
                </>
              )}
              {!saving && !autoSaveTimer && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>All changes saved</span>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={saving || !autoSaveTimer}
            >
              Save Now
            </Button>
          </div>
        )}

        {/* Readonly Notice */}
        {readonly && (
          <div className="text-sm text-muted-foreground text-center pt-2 border-t">
            View only - Contact admin to update checklist
          </div>
        )}
      </CardContent>
    </Card>
  )
}
