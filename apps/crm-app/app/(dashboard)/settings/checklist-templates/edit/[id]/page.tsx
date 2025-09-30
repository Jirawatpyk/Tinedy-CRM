// Settings Page: Edit Checklist Template
// Story 2.5: Best Practice - Server Component fetches data, Client Component handles interaction
import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ChecklistTemplateForm } from '@/components/shared/ChecklistTemplateForm'
import { headers } from 'next/headers'
import { ServiceType } from '@prisma/client'

interface Template {
  id: string
  name: string
  description?: string
  serviceType: ServiceType
  items: string[]
}

// Server Component - Fetches data at request time
async function getTemplate(id: string): Promise<Template | null> {
  try {
    // Get the host from headers for dynamic URL
    const headersList = headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`

    const response = await fetch(`${baseUrl}/api/checklist-templates/${id}`, {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        Cookie: headersList.get('cookie') || '', // Forward auth cookies
      },
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Error fetching template:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const template = await getTemplate(params.id)

  return {
    title: template
      ? `แก้ไข ${template.name} | Tinedy CRM`
      : 'แก้ไข Template | Tinedy CRM',
    description: 'แก้ไข checklist template',
  }
}

// Main Server Component
export default async function EditChecklistTemplatePage({
  params,
}: {
  params: { id: string }
}) {
  const template = await getTemplate(params.id)

  if (!template) {
    notFound()
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      {/* Back Button - Static, no interaction needed */}
      <Link href="/settings/checklist-templates">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปรายการ Template
        </Button>
      </Link>

      {/* Page Header - Static content */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          แก้ไข Checklist Template
        </h1>
        <p className="text-muted-foreground mt-2">
          แก้ไขรายละเอียด template และรายการ checklist
        </p>
      </div>

      {/* Form - Client Component handles all interactions */}
      <div className="border rounded-lg p-6 bg-card">
        <ChecklistTemplateForm
          initialData={{
            id: template.id,
            name: template.name,
            description: template.description,
            serviceType: template.serviceType,
            items: template.items as string[],
          }}
        />
      </div>
    </div>
  )
}
