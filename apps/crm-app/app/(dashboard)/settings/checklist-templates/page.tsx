// Settings Page: Checklist Templates Management
// Story 2.5: Main page for managing checklist templates
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ChecklistTemplateList } from '@/components/shared/ChecklistTemplateList'

export const metadata = {
  title: 'Checklist Templates | Tinedy CRM',
  description: 'Manage quality control checklist templates',
}

export default function ChecklistTemplatesPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Checklist Templates
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage quality control checklists for different service
            types
          </p>
        </div>
        <Link href="/settings/checklist-templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Template List */}
      <ChecklistTemplateList />
    </div>
  )
}
