import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import { JobService } from '@/lib/services/job'
import { prisma } from '@/lib/db'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    job: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

describe('JobService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getJobsByCustomerId', () => {
    it('should fetch jobs for a specific customer with pagination', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          customerId: 'customer-1',
          serviceType: 'CLEANING',
          scheduledDate: new Date('2024-09-30'),
          price: 2500,
          status: 'NEW',
          notes: 'Test note',
          assignedUserId: null,
          customer: {
            id: 'customer-1',
            name: 'Test Customer',
            phone: '02-123-4567',
          },
          assignedUser: null,
        },
      ]

      const mockCount = 5

      ;(prisma.job.findMany as jest.Mock).mockResolvedValue(mockJobs)
      ;(prisma.job.count as jest.Mock).mockResolvedValue(mockCount)

      const result = await JobService.getJobsByCustomerId('customer-1', 1, 20)

      expect(prisma.job.findMany).toHaveBeenCalledWith({
        where: { customerId: 'customer-1' },
        skip: 0,
        take: 20,
        orderBy: {
          scheduledDate: 'desc',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      expect(prisma.job.count).toHaveBeenCalledWith({
        where: { customerId: 'customer-1' },
      })

      expect(result).toEqual({
        jobs: mockJobs,
        totalCount: mockCount,
        hasNextPage: false,
      })
    })

    it('should handle pagination correctly', async () => {
      const mockJobs = Array.from({ length: 20 }, (_, i) => ({
        id: `job-${i}`,
        customerId: 'customer-1',
        serviceType: 'CLEANING',
        scheduledDate: new Date(),
        price: 2500,
        status: 'NEW',
        notes: null,
        assignedUserId: null,
        customer: {
          id: 'customer-1',
          name: 'Test Customer',
          phone: '02-123-4567',
        },
        assignedUser: null,
      }))

      const mockCount = 45

      ;(prisma.job.findMany as jest.Mock).mockResolvedValue(mockJobs)
      ;(prisma.job.count as jest.Mock).mockResolvedValue(mockCount)

      const result = await JobService.getJobsByCustomerId('customer-1', 2, 20)

      expect(prisma.job.findMany).toHaveBeenCalledWith({
        where: { customerId: 'customer-1' },
        skip: 20, // Page 2, skip first 20
        take: 20,
        orderBy: {
          scheduledDate: 'desc',
        },
        include: expect.any(Object),
      })

      expect(result.hasNextPage).toBe(true) // 45 total, page 2 of 20 = more pages exist
    })

    it('should return empty array when no jobs exist', async () => {
      ;(prisma.job.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.job.count as jest.Mock).mockResolvedValue(0)

      const result = await JobService.getJobsByCustomerId('customer-1', 1, 20)

      expect(result).toEqual({
        jobs: [],
        totalCount: 0,
        hasNextPage: false,
      })
    })
  })

  describe('getJobById', () => {
    it('should fetch a job by id with relations', async () => {
      const mockJob = {
        id: 'job-1',
        customerId: 'customer-1',
        serviceType: 'CLEANING',
        scheduledDate: new Date('2024-09-30'),
        price: 2500,
        status: 'NEW',
        notes: 'Test note',
        assignedUserId: 'user-1',
        customer: {
          id: 'customer-1',
          name: 'Test Customer',
          phone: '02-123-4567',
        },
        assignedUser: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@test.com',
        },
      }

      ;(prisma.job.findUnique as jest.Mock).mockResolvedValue(mockJob)

      const result = await JobService.getJobById('job-1')

      expect(prisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      expect(result).toEqual(mockJob)
    })

    it('should return null when job not found', async () => {
      ;(prisma.job.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await JobService.getJobById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('createJob', () => {
    it('should create a new job', async () => {
      const jobData = {
        customerId: 'customer-1',
        serviceType: 'CLEANING' as const,
        scheduledDate: new Date('2024-09-30'),
        price: 2500,
        notes: 'New job',
      }

      const mockCreatedJob = {
        id: 'new-job-1',
        ...jobData,
        status: 'NEW',
        assignedUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.job.create as jest.Mock).mockResolvedValue(mockCreatedJob)

      const result = await JobService.createJob(jobData)

      expect(prisma.job.create).toHaveBeenCalledWith({
        data: {
          ...jobData,
          status: 'NEW',
        },
      })

      expect(result).toEqual(mockCreatedJob)
    })
  })

  describe('updateJobStatus', () => {
    it('should update job status', async () => {
      const mockUpdatedJob = {
        id: 'job-1',
        status: 'IN_PROGRESS',
      }

      ;(prisma.job.update as jest.Mock).mockResolvedValue(mockUpdatedJob)

      const result = await JobService.updateJobStatus('job-1', 'IN_PROGRESS')

      expect(prisma.job.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: { status: 'IN_PROGRESS' },
      })

      expect(result.status).toBe('IN_PROGRESS')
    })
  })
})
