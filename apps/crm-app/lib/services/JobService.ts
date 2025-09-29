import { prisma } from '@/lib/db'
import {
  Job as PrismaJob,
  JobStatus,
  ServiceType,
  Priority,
  Prisma,
} from '@prisma/client'

export interface JobWithRelations {
  id: string
  customerId: string
  serviceType: ServiceType
  scheduledDate: Date
  price: number
  status: JobStatus
  notes?: string
  description?: string
  priority: Priority
  completedAt?: Date
  assignedUserId?: string
  customer: {
    id: string
    name: string
    phone: string
    address?: string
    status: string
  }
  assignedUser?: {
    id: string
    name: string
    email: string
    role: string
  } | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateJobData {
  customerId: string
  serviceType: ServiceType
  scheduledDate: Date
  price: number
  description?: string
  notes?: string
  priority?: Priority
  assignedUserId?: string
}

export interface UpdateJobData {
  serviceType?: ServiceType
  scheduledDate?: Date
  price?: number
  status?: JobStatus
  description?: string
  notes?: string
  priority?: Priority
  assignedUserId?: string
  completedAt?: Date
}

export interface JobSearchFilters {
  status?: JobStatus[]
  serviceType?: ServiceType[]
  assignedUserId?: string
  customerId?: string
  startDate?: Date
  endDate?: Date
  search?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface JobsListResult {
  jobs: JobWithRelations[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export class JobService {
  static async getJobs(
    filters: JobSearchFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<JobsListResult> {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const where: Prisma.JobWhereInput = {}

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status }
    }

    if (filters.serviceType && filters.serviceType.length > 0) {
      where.serviceType = { in: filters.serviceType }
    }

    if (filters.assignedUserId) {
      where.assignedUserId = filters.assignedUserId
    }

    if (filters.customerId) {
      where.customerId = filters.customerId
    }

    if (filters.startDate && filters.endDate) {
      where.scheduledDate = {
        gte: filters.startDate,
        lte: filters.endDate,
      }
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
        {
          customer: { name: { contains: filters.search, mode: 'insensitive' } },
        },
        {
          customer: {
            phone: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ]
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
              status: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.job.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return {
      jobs: jobs as unknown as JobWithRelations[],
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }
  }

  static async getJobById(id: string): Promise<JobWithRelations | null> {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            status: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!job) return null

    // job.scheduledDate is already correct from schema
    return job as unknown as JobWithRelations
  }

  static async getJobsByCustomerId(
    customerId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<JobsListResult> {
    return this.getJobs({ customerId }, pagination)
  }

  static async createJob(data: CreateJobData): Promise<JobWithRelations> {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
      select: { id: true },
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    if (data.assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: data.assignedUserId },
        select: { id: true, role: true, isActive: true },
      })

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive')
      }

      if (user.role !== 'OPERATIONS' && user.role !== 'ADMIN') {
        throw new Error('User cannot be assigned to jobs')
      }
    }

    const job = await prisma.job.create({
      data: {
        id: 'job-' + Date.now(),
        customerId: data.customerId,
        serviceType: data.serviceType,
        scheduledDate: data.scheduledDate,
        price: data.price,
        description: data.description,
        notes: data.notes,
        priority: data.priority || Priority.MEDIUM,
        assignedUserId: data.assignedUserId,
        status: data.assignedUserId ? JobStatus.ASSIGNED : JobStatus.NEW,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            status: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return job as unknown as JobWithRelations
  }

  static async updateJob(
    id: string,
    data: UpdateJobData
  ): Promise<JobWithRelations> {
    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!existingJob) {
      throw new Error('Job not found')
    }

    if (data.assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: data.assignedUserId },
        select: { id: true, role: true, isActive: true },
      })

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive')
      }

      if (user.role !== 'OPERATIONS' && user.role !== 'ADMIN') {
        throw new Error('User cannot be assigned to jobs')
      }
    }

    const updateData: Prisma.JobUpdateInput = { ...data }

    if (
      data.status === JobStatus.DONE &&
      existingJob.status !== JobStatus.DONE
    ) {
      updateData.completedAt = new Date()
    }

    if (data.assignedUserId && !data.status) {
      updateData.status = JobStatus.ASSIGNED
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            status: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return job as unknown as JobWithRelations
  }

  static async deleteJob(id: string): Promise<void> {
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!job) {
      throw new Error('Job not found')
    }

    if (job.status === JobStatus.IN_PROGRESS) {
      throw new Error('Cannot delete job that is in progress')
    }

    await prisma.job.delete({
      where: { id },
    })
  }

  static async assignJob(
    jobId: string,
    userId: string
  ): Promise<JobWithRelations> {
    return this.updateJob(jobId, {
      assignedUserId: userId,
      status: JobStatus.ASSIGNED,
    })
  }

  static async unassignJob(jobId: string): Promise<JobWithRelations> {
    return this.updateJob(jobId, {
      assignedUserId: null,
      status: JobStatus.NEW,
    })
  }

  static async startJob(jobId: string): Promise<JobWithRelations> {
    const job = await this.getJobById(jobId)

    if (!job) {
      throw new Error('Job not found')
    }

    if (job.status !== JobStatus.ASSIGNED) {
      throw new Error('Job must be assigned before it can be started')
    }

    return this.updateJob(jobId, {
      status: JobStatus.IN_PROGRESS,
    })
  }

  static async completeJob(
    jobId: string,
    notes?: string
  ): Promise<JobWithRelations> {
    const job = await this.getJobById(jobId)

    if (!job) {
      throw new Error('Job not found')
    }

    if (job.status === JobStatus.DONE) {
      throw new Error('Job is already completed')
    }

    const updateData: UpdateJobData = {
      status: JobStatus.DONE,
      completedAt: new Date(),
    }

    if (notes) {
      updateData.notes = notes
    }

    return this.updateJob(jobId, updateData)
  }

  static async cancelJob(
    jobId: string,
    reason?: string
  ): Promise<JobWithRelations> {
    const job = await this.getJobById(jobId)

    if (!job) {
      throw new Error('Job not found')
    }

    if (job.status === JobStatus.DONE) {
      throw new Error('Cannot cancel completed job')
    }

    const updateData: UpdateJobData = {
      status: JobStatus.CANCELLED,
    }

    if (reason) {
      updateData.notes = reason
    }

    return this.updateJob(jobId, updateData)
  }

  static async getJobStats(): Promise<{
    total: number
    new: number
    assigned: number
    inProgress: number
    completed: number
    cancelled: number
  }> {
    const [total, new_, assigned, inProgress, completed, cancelled] =
      await Promise.all([
        prisma.job.count(),
        prisma.job.count({ where: { status: JobStatus.NEW } }),
        prisma.job.count({ where: { status: JobStatus.ASSIGNED } }),
        prisma.job.count({ where: { status: JobStatus.IN_PROGRESS } }),
        prisma.job.count({ where: { status: JobStatus.DONE } }),
        prisma.job.count({ where: { status: JobStatus.CANCELLED } }),
      ])

    return {
      total,
      new: new_,
      assigned,
      inProgress,
      completed,
      cancelled,
    }
  }
}
