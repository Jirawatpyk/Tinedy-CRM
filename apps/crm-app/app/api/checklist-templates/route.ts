// API Routes: /api/checklist-templates
// Story 2.5: Quality Control Checklist Management
// Handles GET (list) and POST (create) operations

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ChecklistTemplateService } from '@/lib/services/checklistTemplate'
import { ServiceType } from '@prisma/client'
import { logError } from '@/lib/logger'

/**
 * GET /api/checklist-templates
 * Get all checklist templates with optional filtering
 * Query params: serviceType, search, isActive
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Admin can access checklist templates
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const serviceType = searchParams.get('serviceType') as ServiceType | null
    const search = searchParams.get('search') || undefined
    const isActiveParam = searchParams.get('isActive')
    const isActive =
      isActiveParam === 'true'
        ? true
        : isActiveParam === 'false'
          ? false
          : undefined

    // Build filters
    const filters: any = {}
    if (serviceType) {
      if (!['CLEANING', 'TRAINING'].includes(serviceType)) {
        return NextResponse.json(
          { error: 'Invalid service type. Must be CLEANING or TRAINING' },
          { status: 400 }
        )
      }
      filters.serviceType = serviceType
    }
    if (search) filters.search = search
    if (isActive !== undefined) filters.isActive = isActive

    // Get templates
    const templates = await ChecklistTemplateService.getAll(filters)

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
    })
  } catch (error) {
    logError('Error fetching checklist templates', error, {
      endpoint: 'GET /api/checklist-templates',
    })
    return NextResponse.json(
      { error: 'Failed to fetch checklist templates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/checklist-templates
 * Create a new checklist template
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Admin can create checklist templates
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, description, serviceType, items } = body

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Template name is required and must be a string' },
        { status: 400 }
      )
    }

    if (!serviceType || !['CLEANING', 'TRAINING'].includes(serviceType)) {
      return NextResponse.json(
        { error: 'Valid service type is required (CLEANING or TRAINING)' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one checklist item is required' },
        { status: 400 }
      )
    }

    // Validate items are all strings
    const allStrings = items.every(
      (item) => typeof item === 'string' && item.trim().length > 0
    )
    if (!allStrings) {
      return NextResponse.json(
        { error: 'All checklist items must be non-empty strings' },
        { status: 400 }
      )
    }

    // Create template
    const template = await ChecklistTemplateService.create({
      name: name.trim(),
      description: description?.trim(),
      serviceType,
      items: items.map((item: string) => item.trim()),
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Checklist template created successfully',
        data: template,
      },
      { status: 201 }
    )
  } catch (error: any) {
    logError('Error creating checklist template', error, {
      endpoint: 'POST /api/checklist-templates',
    })

    // Handle specific errors
    if (error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    if (error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create checklist template' },
      { status: 500 }
    )
  }
}
