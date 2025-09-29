import { NextRequest } from 'next/server'
import { GET, PATCH } from '@/app/api/jobs/[id]/route'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { JobStatus, UserRole } from '@prisma/client'

// Mock dependencies
jest.mock('@/auth')
jest.mock('@/lib/db', () => ({
  prisma: {
    job: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const mockAuth = jest.mocked(auth)
const mockPrisma = jest.mocked(prisma)

describe('/api/jobs/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/jobs/[id]', () => {
    const mockJobData = {
      id: 'job-123',
      customerId: 'customer-123',
      serviceType: 'CLEANING',
      description: 'Test job description',
      status: JobStatus.NEW,
      priority: 'MEDIUM',
      scheduledAt: new Date('2024-01-15T10:00:00Z'),
      completedAt: null,
      assignedToId: 'user-123',
      notes: 'Test notes',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      customer: {
        id: 'customer-123',
        name: 'John Doe',
        phone: '0812345678',
        address: '123 Test St',
        status: 'ACTIVE',
      },
      assignedTo: {
        id: 'user-123',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: UserRole.OPERATIONS,
      },
    }

    it('should return job details when authenticated as admin', async () => {
      // Mock authentication
      mockAuth.mockResolvedValue({
        user: { id: 'admin-123', role: UserRole.ADMIN },
      } as any)

      // Mock database query
      mockPrisma.job.findUnique.mockResolvedValue(mockJobData as any)

      const request = new NextRequest('http://localhost/api/jobs/job-123')
      const response = await GET(request, { params: { id: 'job-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual(mockJobData)
      expect(mockPrisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-123' },
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
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      })
    })

    test('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/jobs/job-123')
      const response = await GET(request, { params: { id: 'job-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.error).toBe('Unauthorized')
    })

    test('should return 403 when not admin', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-123', role: UserRole.OPERATIONS },
      } as any)

      const request = new NextRequest('http://localhost/api/jobs/job-123')
      const response = await GET(request, { params: { id: 'job-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(403)
      expect(responseData.error).toBe('Forbidden - Admin access required')
    })

    test('should return 404 when job not found', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin-123', role: UserRole.ADMIN },
      } as any)

      mockPrisma.job.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/jobs/job-123')
      const response = await GET(request, { params: { id: 'job-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Job not found')
    })
  })

  describe('PATCH /api/jobs/[id]', () => {
    const mockExistingJob = {
      id: 'job-123',
      status: JobStatus.NEW,
      assignedToId: null,
      notes: null,
      completedAt: null,
    }

    const mockUpdatedJob = {
      ...mockExistingJob,
      status: JobStatus.IN_PROGRESS,
      assignedToId: 'user-123',
      notes: 'Updated notes',
      customer: {
        id: 'customer-123',
        name: 'John Doe',
        phone: '0812345678',
        address: '123 Test St',
        status: 'ACTIVE',
      },
      assignedTo: {
        id: 'user-123',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: UserRole.OPERATIONS,
      },
    }

    test('should update job status successfully', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin-123', role: UserRole.ADMIN },
      } as any)

      mockPrisma.job.findUnique.mockResolvedValue(mockExistingJob as any)
      mockPrisma.job.update.mockResolvedValue(mockUpdatedJob as any)

      const request = new NextRequest('http://localhost/api/jobs/job-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: JobStatus.IN_PROGRESS }),
      })

      const response = await PATCH(request, { params: { id: 'job-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.status).toBe(JobStatus.IN_PROGRESS)
      expect(mockPrisma.job.update).toHaveBeenCalledWith({
        where: { id: 'job-123' },
        data: { status: JobStatus.IN_PROGRESS },
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
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      })
    })

    test('should update job assignment successfully', async () => {
      const mockOperationsUser = {
        id: 'user-123',
        role: UserRole.OPERATIONS,
        isActive: true,
      }

      mockAuth.mockResolvedValue({
        user: { id: 'admin-123', role: UserRole.ADMIN },
      } as any)

      mockPrisma.job.findUnique.mockResolvedValue(mockExistingJob as any)
      mockPrisma.user.findUnique.mockResolvedValue(mockOperationsUser as any)
      mockPrisma.job.update.mockResolvedValue(mockUpdatedJob as any)

      const request = new NextRequest('http://localhost/api/jobs/job-123', {
        method: 'PATCH',
        body: JSON.stringify({ assignedToId: 'user-123' }),
      })

      const response = await PATCH(request, { params: { id: 'job-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.assignedTo.id).toBe('user-123')
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'user-123',
          role: UserRole.OPERATIONS,
          isActive: true,
        },
      })
    })

    test('should auto-set completedAt when status is COMPLETED', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin-123', role: UserRole.ADMIN },
      } as any)

      mockPrisma.job.findUnique.mockResolvedValue(mockExistingJob as any)
      mockPrisma.job.update.mockResolvedValue({
        ...mockUpdatedJob,
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
      } as any)

      const request = new NextRequest('http://localhost/api/jobs/job-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: JobStatus.COMPLETED }),
      })

      const response = await PATCH(request, { params: { id: 'job-123' } })

      expect(response.status).toBe(200)
      expect(mockPrisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: JobStatus.COMPLETED,
            completedAt: expect.any(Date),
          }),
        })
      )
    })

    test('should return 400 for invalid assignment user', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin-123', role: UserRole.ADMIN },
      } as any)

      mockPrisma.job.findUnique.mockResolvedValue(mockExistingJob as any)
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/jobs/job-123', {
        method: 'PATCH',
        body: JSON.stringify({ assignedToId: 'invalid-user' }),
      })

      const response = await PATCH(request, { params: { id: 'job-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Validation failed')
      expect(responseData.errors.assignedToId).toContain(
        'Invalid user assignment'
      )
    })

    test('should return 404 when job not found', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin-123', role: UserRole.ADMIN },
      } as any)

      mockPrisma.job.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/jobs/job-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: JobStatus.IN_PROGRESS }),
      })

      const response = await PATCH(request, { params: { id: 'job-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Job not found')
    })

    test('should validate job status enum', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin-123', role: UserRole.ADMIN },
      } as any)

      mockPrisma.job.findUnique.mockResolvedValue(mockExistingJob as any)

      const request = new NextRequest('http://localhost/api/jobs/job-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'INVALID_STATUS' }),
      })

      const response = await PATCH(request, { params: { id: 'job-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Validation failed')
    })
  })
})
