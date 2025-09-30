// ChecklistTemplateForm Component
// Story 2.5: Form for creating/editing checklist templates
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ChecklistItemsEditor } from './ChecklistItemsEditor'
import { useToast } from '@/hooks/use-toast'
import { ServiceType } from '@prisma/client'
import { logError } from '@/lib/logger'

interface ChecklistTemplateFormProps {
  initialData?: {
    id?: string
    name: string
    description?: string
    serviceType: ServiceType
    items: string[]
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ChecklistTemplateForm({
  initialData,
  onSuccess,
  onCancel,
}: ChecklistTemplateFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    serviceType: initialData?.serviceType || ('CLEANING' as ServiceType),
    items: initialData?.items || [''],
  })

  const isEditMode = !!initialData?.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Template name is required',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      const validItems = formData.items.filter((item) => item.trim())
      if (validItems.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one checklist item is required',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      // Prepare payload
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        serviceType: formData.serviceType,
        items: validItems,
      }

      // API call
      const url = isEditMode
        ? `/api/checklist-templates/${initialData.id}`
        : '/api/checklist-templates'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save template')
      }

      toast({
        title: 'Success',
        description:
          result.message ||
          `Template ${isEditMode ? 'updated' : 'created'} successfully`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/settings/checklist-templates')
        router.refresh()
      }
    } catch (error: any) {
      logError('Error saving checklist template', error, {
        component: 'ChecklistTemplateForm',
        mode: isEditMode ? 'edit' : 'create',
        templateId: initialData?.id,
      })
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Template Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Standard Cleaning Checklist"
          required
          disabled={loading}
        />
      </div>

      {/* Service Type */}
      <div className="space-y-2">
        <Label htmlFor="serviceType">
          Service Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value: ServiceType) =>
            setFormData({ ...formData, serviceType: value })
          }
          disabled={loading}
        >
          <SelectTrigger id="serviceType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CLEANING">Cleaning (ทำความสะอาด)</SelectItem>
            <SelectItem value="TRAINING">Training (ฝึกอบรม)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Brief description of what this checklist covers"
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Checklist Items */}
      <ChecklistItemsEditor
        items={formData.items}
        onChange={(items) => setFormData({ ...formData, items })}
        disabled={loading}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Saving...'
            : isEditMode
              ? 'Update Template'
              : 'Create Template'}
        </Button>
      </div>
    </form>
  )
}
