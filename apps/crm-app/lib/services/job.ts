import { prisma } from '@/lib/db'
import { Job, ServiceType, JobStatus, Priority, Prisma } from '@prisma/client'

export interface JobCreateInput {
  customerId: string
  serviceType: ServiceType
  scheduledDate?: Date
  price: number
  notes?: string
  assignedUserId?: string
  description?: string
  priority?: string
}

export interface JobUpdateInput {
  serviceType?: ServiceType
  scheduledDate?: Date
  price?: number
  status?: JobStatus
  notes?: string
  assignedUserId?: string
}

export interface JobWithRelations extends Job {
  customer: {
    id: string
    name: string
    phone: string
    address: string
    status: string
  }
  assignedUser?: {
    id: string
    name: string
    email: string
    role: string
  } | null
}

export interface JobsListResult {
  jobs: JobWithRelations[]
  totalCount: number
  hasNextPage: boolean
}

export class JobService {
  /**
   * ดึงรายการงานทั้งหมด
   */
  static async getAllJobs(
    page: number = 1,
    limit: number = 20
  ): Promise<JobsListResult> {
    const skip = (page - 1) * limit

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        skip,
        take: limit,
        orderBy: {
          scheduledDate: 'desc',
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
      }),
      prisma.job.count(),
    ])

    return {
      jobs,
      totalCount,
      hasNextPage: totalCount > skip + limit,
    }
  }

  /**
   * ดึงงานตาม ID
   */
  static async getJobById(id: string): Promise<JobWithRelations | null> {
    return await prisma.job.findUnique({
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
  }

  /**
   * ดึงรายการงานของลูกค้าตาม ID
   */
  static async getJobsByCustomerId(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<JobsListResult> {
    const skip = (page - 1) * limit

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: {
          scheduledDate: 'desc',
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
      }),
      prisma.job.count({
        where: { customerId },
      }),
    ])

    return {
      jobs,
      totalCount,
      hasNextPage: totalCount > skip + limit,
    }
  }

  /**
   * ดึงรายการงานที่มอบหมายให้ผู้ใช้
   */
  static async getJobsByAssignedUserId(
    assignedUserId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<JobsListResult> {
    const skip = (page - 1) * limit

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: { assignedUserId: assignedUserId },
        skip,
        take: limit,
        orderBy: {
          scheduledDate: 'desc',
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
      }),
      prisma.job.count({
        where: { assignedUserId: assignedUserId },
      }),
    ])

    return {
      jobs,
      totalCount,
      hasNextPage: totalCount > skip + limit,
    }
  }

  /**
   * ค้นหางานตามสถานะ
   */
  static async getJobsByStatus(
    status: JobStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<JobsListResult> {
    const skip = (page - 1) * limit

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: { status },
        skip,
        take: limit,
        orderBy: {
          scheduledDate: 'desc',
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
      }),
      prisma.job.count({
        where: { status },
      }),
    ])

    return {
      jobs,
      totalCount,
      hasNextPage: totalCount > skip + limit,
    }
  }

  /**
   * สร้างงานใหม่
   */
  static async createJob(data: JobCreateInput): Promise<Job> {
    const jobData: any = {
      customerId: data.customerId,
      serviceType: data.serviceType,
      price: data.price,
      notes: data.notes,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      status: 'NEW',
    }

    // เซ็ตวันเวลานัดหมาย
    if (data.scheduledDate) {
      jobData.scheduledDate = data.scheduledDate
    }

    // เซ็ตผู้รับผิดชอบ
    if (data.assignedUserId) {
      jobData.assignedUserId = data.assignedUserId
    }

    return await prisma.job.create({
      data: jobData,
    })
  }

  /**
   * อัปเดตข้อมูลงาน
   */
  static async updateJob(id: string, data: JobUpdateInput): Promise<Job> {
    return await prisma.job.update({
      where: { id },
      data,
    })
  }

  /**
   * ลบงาน
   */
  static async deleteJob(id: string): Promise<Job> {
    return await prisma.job.delete({
      where: { id },
    })
  }

  /**
   * มอบหมายงานให้ผู้ใช้
   */
  static async assignJob(jobId: string, userId: string): Promise<Job> {
    return await prisma.job.update({
      where: { id: jobId },
      data: {
        assignedUserId: userId,
        // @ts-ignore - Prisma schema update in progress
        assignedUserId: userId, // อัปเดตทั้งสองฟิลด์
        status: 'ASSIGNED',
      },
    })
  }

  /**
   * ยกเลิกการมอบหมายงาน
   */
  static async unassignJob(id: string): Promise<Job> {
    return await prisma.job.update({
      where: { id },
      data: {
        assignedUserId: null,
        status: 'NEW',
      },
    })
  }

  /**
   * อัปเดตสถานะงาน
   */
  static async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    const updateData: any = { status }

    // ถ้าสถานะเป็น DONE ให้เซ็ต completedAt
    if (status === 'DONE') {
      updateData.completedAt = new Date()
    }

    return await prisma.job.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * อัปเดตหมายเหตุงาน
   */
  static async updateJobNotes(id: string, notes: string): Promise<Job> {
    return await prisma.job.update({
      where: { id },
      data: { notes },
    })
  }

  /**
   * ดึงรายการงานของลูกค้าตาม ID (alias สำหรับ getJobsByCustomerId)
   */
  static async getJobsByCustomer(
    customerId: string,
    pagination?: { page?: number; limit?: number }
  ): Promise<JobsListResult> {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    return this.getJobsByCustomerId(customerId, page, limit)
  }

  /**
   * ค้นหางานตามเงื่อนไขต่างๆ
   */
  static async searchJobs(
    filters: {
      customerId?: string
      serviceType?: ServiceType
      status?: JobStatus
      assignedUserId?: string
      scheduledDateFrom?: Date
      scheduledDateTo?: Date
    },
    page: number = 1,
    limit: number = 20
  ): Promise<JobsListResult> {
    const skip = (page - 1) * limit
    const where: Prisma.JobWhereInput = {}

    if (filters.customerId) {
      where.customerId = filters.customerId
    }

    if (filters.serviceType) {
      where.serviceType = filters.serviceType
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.assignedUserId) {
      where.assignedUserId = filters.assignedUserId
    }

    if (filters.scheduledDateFrom || filters.scheduledDateTo) {
      where.scheduledDate = {}
      if (filters.scheduledDateFrom) {
        where.scheduledDate.gte = filters.scheduledDateFrom
      }
      if (filters.scheduledDateTo) {
        where.scheduledDate.lte = filters.scheduledDateTo
      }
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          scheduledDate: 'desc',
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
      }),
      prisma.job.count({ where }),
    ])

    return {
      jobs,
      totalCount,
      hasNextPage: totalCount > skip + limit,
    }
  }
}
