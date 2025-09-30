// ChecklistTemplateSelector Component
// Story 2.5: Select checklist template for job attachment
'use client'

import React, { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Link as LinkIcon } from 'lucide-react'
import { ServiceType } from '@prisma/client'
import { logError } from '@/lib/logger'

interface ChecklistTemplate {
  id: string
  name: string
  description?: string
  items: string[]
}

interface ChecklistTemplateSelectorProps {
  jobId: string
  serviceType: ServiceType
  currentTemplateId?: string | null
  onAttached?: () => void
}

export function ChecklistTemplateSelector({
  jobId,
  serviceType,
  currentTemplateId,
  onAttached,
}: ChecklistTemplateSelectorProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch templates when dialog opens
  useEffect(() => {
    if (open) {
      fetchTemplates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, serviceType])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/checklist-templates?serviceType=${serviceType}&isActive=true`
      )
      const result = await response.json()

      if (response.ok) {
        setTemplates(result.data)
        if (currentTemplateId) {
          setSelectedTemplateId(currentTemplateId)
        }
      } else {
        throw new Error(result.error || 'Failed to fetch templates')
      }
    } catch (error: any) {
      logError('Error fetching checklist templates', error, {
        component: 'ChecklistTemplateSelector',
        serviceType,
        jobId,
      })
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch templates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAttach = async () => {
    if (!selectedTemplateId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a checklist template',
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/jobs/${jobId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplateId }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: result.message,
        })
        setOpen(false)
        if (onAttached) {
          onAttached()
        }
      } else {
        throw new Error(result.error || 'Failed to attach template')
      }
    } catch (error: any) {
      logError('Error attaching checklist template', error, {
        component: 'ChecklistTemplateSelector',
        jobId,
        templateId: selectedTemplateId,
      })
      toast({
        title: 'Error',
        description: error.message || 'Failed to attach template',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {currentTemplateId ? (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              Change Checklist
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Attach Checklist
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Checklist Template</DialogTitle>
          <DialogDescription>
            Choose a quality control checklist for this job
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading templates...
            </p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No templates available for {serviceType} service type
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="template">Checklist Template</Label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
                disabled={submitting}
              >
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        {template.description && (
                          <span className="text-xs text-muted-foreground">
                            {template.description}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {template.items.length} items
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAttach}
            disabled={!selectedTemplateId || submitting || loading}
          >
            {submitting ? 'Attaching...' : 'Attach Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
