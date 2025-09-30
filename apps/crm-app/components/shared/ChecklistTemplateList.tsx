// ChecklistTemplateList Component
// Story 2.5: Table view for checklist templates with actions
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/hooks/use-toast'
import { Pencil, Trash2, Search, Filter } from 'lucide-react'
import { ServiceType } from '@prisma/client'
import { logError } from '@/lib/logger'

interface ChecklistTemplate {
  id: string
  name: string
  description?: string
  serviceType: ServiceType
  items: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    jobsUsingTemplate: number
  }
}

export function ChecklistTemplateList() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Filters
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (serviceTypeFilter !== 'all') {
        params.append('serviceType', serviceTypeFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/checklist-templates?${params}`)
      const result = await response.json()

      if (response.ok) {
        setTemplates(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch templates')
      }
    } catch (error: any) {
      logError('Error fetching checklist templates', error, {
        component: 'ChecklistTemplateList',
        filters: { serviceTypeFilter, searchQuery },
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

  useEffect(() => {
    fetchTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceTypeFilter, searchQuery])

  const handleEdit = (id: string) => {
    router.push(`/settings/checklist-templates/edit/${id}`)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/checklist-templates/${deleteId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: result.message,
        })
        fetchTemplates()
      } else {
        throw new Error(result.error || 'Failed to delete template')
      }
    } catch (error: any) {
      logError('Error deleting checklist template', error, {
        component: 'ChecklistTemplateList',
        templateId: deleteId,
      })
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const getServiceTypeLabel = (serviceType: ServiceType) => {
    return serviceType === 'CLEANING' ? 'Cleaning' : 'Training'
  }

  const getServiceTypeBadgeVariant = (serviceType: ServiceType) => {
    return serviceType === 'CLEANING' ? 'default' : 'secondary'
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            value={serviceTypeFilter}
            onValueChange={setServiceTypeFilter}
          >
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CLEANING">Cleaning</SelectItem>
              <SelectItem value="TRAINING">Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading templates...
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No templates found. Create your first template!
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      {template.description && (
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getServiceTypeBadgeVariant(template.serviceType)}
                    >
                      {getServiceTypeLabel(template.serviceType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.items.length} items</TableCell>
                  <TableCell>
                    {template._count.jobsUsingTemplate > 0 ? (
                      <span className="text-sm">
                        {template._count.jobsUsingTemplate} job(s)
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Not used
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {template.isActive ? (
                      <Badge variant="outline" className="bg-green-50">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(template.id)}
                        title="Edit template"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(template.id)}
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checklist Template?</AlertDialogTitle>
            <AlertDialogDescription>
              {templates.find((t) => t.id === deleteId)?._count
                .jobsUsingTemplate
                ? 'This template is currently being used by jobs. It will be deactivated instead of deleted.'
                : 'This action cannot be undone. This will permanently delete the template.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
