// API Routes: /api/checklist-templates/[id]
// Story 2.5: Quality Control Checklist Management
// Handles GET (single), PUT (update), and DELETE operations

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ChecklistTemplateService } from '@/lib/services/checklistTemplate'
import { logError } from '@/lib/logger'

/**
 * GET /api/checklist-templates/[id]
 * Get a single checklist template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const template = await ChecklistTemplateService.getById(params.id)

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error: any) {
    logError('Error fetching checklist template', error, {
      endpoint: 'GET /api/checklist-templates/[id]',
      templateId: params.id,
    })

    if (error.message === 'Checklist template not found') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch checklist template' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/checklist-templates/[id]
 * Update an existing checklist template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Admin can update checklist templates
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, description, serviceType, items, isActive } = body

    // Validate serviceType if provided
    if (serviceType && !['CLEANING', 'TRAINING'].includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type. Must be CLEANING or TRAINING' },
        { status: 400 }
      )
    }

    // Validate items if provided
    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return NextResponse.json(
          { error: 'Items must be an array' },
          { status: 400 }
        )
      }

      if (items.length === 0) {
        return NextResponse.json(
          { error: 'At least one checklist item is required' },
          { status: 400 }
        )
      }

      const allStrings = items.every(
        (item) => typeof item === 'string' && item.trim().length > 0
      )
      if (!allStrings) {
        return NextResponse.json(
          { error: 'All checklist items must be non-empty strings' },
          { status: 400 }
        )
      }
    }

    // Update template
    const updateData: any = {}
    if (name) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim()
    if (serviceType) updateData.serviceType = serviceType
    if (items) updateData.items = items.map((item: string) => item.trim())
    if (isActive !== undefined) updateData.isActive = isActive

    const template = await ChecklistTemplateService.update(
      params.id,
      updateData
    )

    return NextResponse.json({
      success: true,
      message: 'Checklist template updated successfully',
      data: template,
    })
  } catch (error: any) {
    logError('Error updating checklist template', error, {
      endpoint: 'PUT /api/checklist-templates/[id]',
      templateId: params.id,
    })

    if (error.message === 'Checklist template not found') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    if (error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update checklist template' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/checklist-templates/[id]
 * Delete a checklist template (soft delete if in use)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Admin can delete checklist templates
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const result = await ChecklistTemplateService.delete(params.id)

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.template,
    })
  } catch (error: any) {
    logError('Error deleting checklist template', error, {
      endpoint: 'DELETE /api/checklist-templates/[id]',
      templateId: params.id,
    })

    if (error.message === 'Checklist template not found') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to delete checklist template' },
      { status: 500 }
    )
  }
}
