// Settings Page: Create New Checklist Template
// Story 2.5: Page for creating new checklist templates
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ChecklistTemplateForm } from '@/components/shared/ChecklistTemplateForm'

export const metadata = {
  title: 'Create Checklist Template | Tinedy CRM',
  description: 'Create a new quality control checklist template',
}

export default function NewChecklistTemplatePage() {
  return (
    <div className="space-y-6 p-6 max-w-3xl">
      {/* Back Button */}
      <Link href="/settings/checklist-templates">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Checklist Template
        </h1>
        <p className="text-muted-foreground mt-2">
          Define a new quality control checklist for your services
        </p>
      </div>

      {/* Form */}
      <div className="border rounded-lg p-6 bg-card">
        <ChecklistTemplateForm />
      </div>
    </div>
  )
}
