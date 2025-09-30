// Checklist Template Service
// Story 2.5: Quality Control Checklist Management
// Service layer for managing checklist templates

import { prisma } from '@/lib/db'
import { ServiceType } from '@prisma/client'

export interface ChecklistTemplateCreateInput {
  name: string
  description?: string
  serviceType: ServiceType
  items: string[]
}

export interface ChecklistTemplateUpdateInput {
  name?: string
  description?: string
  serviceType?: ServiceType
  items?: string[]
  isActive?: boolean
}

export interface ChecklistTemplateFilters {
  serviceType?: ServiceType
  search?: string
  isActive?: boolean
}

export class ChecklistTemplateService {
  /**
   * Get all checklist templates with optional filtering
   */
  static async getAll(filters?: ChecklistTemplateFilters) {
    const where: any = {
      isTemplate: true, // Only Story 2.5 templates
      category: 'TEMPLATE',
    }

    if (filters?.serviceType) {
      where.serviceType = filters.serviceType
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    const templates = await prisma.checklistTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        serviceType: true,
        items: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            jobsUsingTemplate: true,
          },
        },
      },
    })

    return templates
  }

  /**
   * Get a single checklist template by ID
   */
  static async getById(id: string) {
    const template = await prisma.checklistTemplate.findFirst({
      where: {
        id,
        isTemplate: true,
        category: 'TEMPLATE',
      },
      include: {
        _count: {
          select: {
            jobsUsingTemplate: true,
          },
        },
      },
    })

    if (!template) {
      throw new Error('Checklist template not found')
    }

    return template
  }

  /**
   * Create a new checklist template
   */
  static async create(data: ChecklistTemplateCreateInput) {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Template name is required')
    }

    if (!data.serviceType) {
      throw new Error('Service type is required')
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('At least one checklist item is required')
    }

    // Check for duplicate name within same service type
    const existingTemplate = await prisma.checklistTemplate.findFirst({
      where: {
        name: data.name,
        serviceType: data.serviceType,
        isTemplate: true,
      },
    })

    if (existingTemplate) {
      throw new Error(
        `Template with name "${data.name}" already exists for ${data.serviceType} service type`
      )
    }

    // Create template
    const template = await prisma.checklistTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        serviceType: data.serviceType,
        items: data.items,
        category: 'TEMPLATE',
        isTemplate: true,
        isActive: true,
      },
    })

    return template
  }

  /**
   * Update an existing checklist template
   */
  static async update(id: string, data: ChecklistTemplateUpdateInput) {
    // Check if template exists
    const existingTemplate = await this.getById(id)

    // If updating name or service type, check for duplicates
    if (data.name || data.serviceType) {
      const checkName = data.name || existingTemplate.name
      const checkServiceType = data.serviceType || existingTemplate.serviceType

      const duplicate = await prisma.checklistTemplate.findFirst({
        where: {
          name: checkName,
          serviceType: checkServiceType,
          isTemplate: true,
          id: { not: id },
        },
      })

      if (duplicate) {
        throw new Error(
          `Template with name "${checkName}" already exists for ${checkServiceType} service type`
        )
      }
    }

    // Validate items if provided
    if (data.items && data.items.length === 0) {
      throw new Error('At least one checklist item is required')
    }

    // Update template
    const template = await prisma.checklistTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.serviceType && { serviceType: data.serviceType }),
        ...(data.items && { items: data.items }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return template
  }

  /**
   * Delete a checklist template (soft delete by setting isActive to false)
   */
  static async delete(id: string) {
    // Check if template exists
    await this.getById(id)

    // Check if template is being used by any jobs
    const jobCount = await prisma.job.count({
      where: { checklistTemplateId: id },
    })

    if (jobCount > 0) {
      // Soft delete - set isActive to false
      const template = await prisma.checklistTemplate.update({
        where: { id },
        data: { isActive: false },
      })

      return {
        success: true,
        message: `Template deactivated (${jobCount} jobs are using this template)`,
        template,
      }
    }

    // Hard delete if no jobs are using it
    await prisma.checklistTemplate.delete({
      where: { id },
    })

    return {
      success: true,
      message: 'Template deleted successfully',
      template: null,
    }
  }

  /**
   * Get templates by service type (for template selector)
   */
  static async getByServiceType(serviceType: ServiceType) {
    const templates = await prisma.checklistTemplate.findMany({
      where: {
        serviceType,
        isTemplate: true,
        category: 'TEMPLATE',
        isActive: true,
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        items: true,
      },
    })

    return templates
  }
}
