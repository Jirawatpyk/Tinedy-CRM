import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/customers/[id]/jobs/route'
import { auth } from '@/auth'
import { CustomerService } from '@/lib/services/customer'
import { JobService } from '@/lib/services/job'

// Mock dependencies
jest.mock('@/auth')
jest.mock('@/lib/services/customer')
jest.mock('@/lib/services/job')

describe('/api/customers/[id]/jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      ;(auth as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs'
      )
      const response = await GET(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 if user is not admin', async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'user-1', role: 'OPERATIONS' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs'
      )
      const response = await GET(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Forbidden - Admin role required')
    })

    it('should return 404 if customer not found', async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })
      ;(CustomerService.getCustomerById as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs'
      )
      const response = await GET(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Customer not found')
    })

    it('should return jobs for valid customer with pagination', async () => {
      const mockCustomer = {
        id: 'customer-1',
        name: 'Test Customer',
        phone: '02-123-4567',
      }

      const mockJobsResult = {
        jobs: [
          {
            id: 'job-1',
            customerId: 'customer-1',
            serviceType: 'CLEANING',
            scheduledDate: new Date('2024-09-30'),
            price: 2500,
            status: 'NEW',
            notes: 'Test note',
            assignedUserId: null,
            customer: mockCustomer,
            assignedUser: null,
          },
        ],
        totalCount: 1,
        hasNextPage: false,
      }

      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })
      ;(CustomerService.getCustomerById as jest.Mock).mockResolvedValue(
        mockCustomer
      )
      ;(JobService.getJobsByCustomerId as jest.Mock).mockResolvedValue(
        mockJobsResult
      )

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs?page=1&limit=20'
      )
      const response = await GET(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.jobs).toEqual(mockJobsResult.jobs)
      expect(data.data.pagination).toEqual({
        page: 1,
        limit: 20,
        totalCount: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      })

      expect(JobService.getJobsByCustomerId).toHaveBeenCalledWith(
        'customer-1',
        1,
        20
      )
    })

    it('should handle pagination parameters correctly', async () => {
      const mockCustomer = { id: 'customer-1', name: 'Test Customer' }
      const mockJobsResult = {
        jobs: Array.from({ length: 20 }, (_, i) => ({ id: `job-${i}` })),
        totalCount: 45,
        hasNextPage: true,
      }

      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })
      ;(CustomerService.getCustomerById as jest.Mock).mockResolvedValue(
        mockCustomer
      )
      ;(JobService.getJobsByCustomerId as jest.Mock).mockResolvedValue(
        mockJobsResult
      )

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs?page=2&limit=20'
      )
      const response = await GET(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data.data.pagination).toEqual({
        page: 2,
        limit: 20,
        totalCount: 45,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      })

      expect(JobService.getJobsByCustomerId).toHaveBeenCalledWith(
        'customer-1',
        2,
        20
      )
    })

    it('should validate page parameter', async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs?page=0'
      )
      const response = await GET(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Page must be greater than 0')
    })

    it('should validate limit parameter', async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs?limit=0'
      )
      const response = await GET(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Limit must be greater than 0')
    })

    it('should limit maximum page size to 100', async () => {
      const mockCustomer = { id: 'customer-1', name: 'Test Customer' }
      const mockJobsResult = { jobs: [], totalCount: 0, hasNextPage: false }

      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })
      ;(CustomerService.getCustomerById as jest.Mock).mockResolvedValue(
        mockCustomer
      )
      ;(JobService.getJobsByCustomerId as jest.Mock).mockResolvedValue(
        mockJobsResult
      )

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs?limit=200'
      )
      const response = await GET(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(200)
      // Should be capped at 100
      expect(JobService.getJobsByCustomerId).toHaveBeenCalledWith(
        'customer-1',
        1,
        100
      )
    })

    it('should handle server errors gracefully', async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })
      ;(CustomerService.getCustomerById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs'
      )
      const response = await GET(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
      expect(data.message).toBe('Failed to fetch customer jobs')
    })
  })

  describe('POST', () => {
    it('should create a new job for customer', async () => {
      const mockCustomer = {
        id: 'customer-1',
        name: 'Test Customer',
        phone: '02-123-4567',
      }

      const jobData = {
        serviceType: 'CLEANING',
        scheduledDate: '2024-09-30T00:00:00.000Z',
        price: 2500,
        notes: 'New job',
        assignedUserId: 'user-1',
      }

      const mockCreatedJob = {
        id: 'new-job-1',
        customerId: 'customer-1',
        ...jobData,
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockJobWithRelations = {
        ...mockCreatedJob,
        customer: mockCustomer,
        assignedUser: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@test.com',
        },
      }

      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })
      ;(CustomerService.getCustomerById as jest.Mock).mockResolvedValue(
        mockCustomer
      )
      ;(JobService.createJob as jest.Mock).mockResolvedValue(mockCreatedJob)
      ;(JobService.getJobById as jest.Mock).mockResolvedValue(
        mockJobWithRelations
      )

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs',
        {
          method: 'POST',
          body: JSON.stringify(jobData),
        }
      )

      const response = await POST(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(201)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockJobWithRelations)
      expect(data.message).toBe('Job created successfully')

      expect(JobService.createJob).toHaveBeenCalledWith({
        customerId: 'customer-1',
        serviceType: 'CLEANING',
        scheduledDate: new Date('2024-09-30T00:00:00.000Z'),
        price: 2500,
        notes: 'New job',
        assignedUserId: 'user-1',
      })
    })

    it('should require authentication for job creation', async () => {
      ;(auth as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs',
        {
          method: 'POST',
          body: JSON.stringify({ serviceType: 'CLEANING' }),
        }
      )

      const response = await POST(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should validate required fields', async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })
      ;(CustomerService.getCustomerById as jest.Mock).mockResolvedValue({
        id: 'customer-1',
      })

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      )

      const response = await POST(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Service type is required')
    })

    it('should validate price is a positive number', async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })
      ;(CustomerService.getCustomerById as jest.Mock).mockResolvedValue({
        id: 'customer-1',
      })

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs',
        {
          method: 'POST',
          body: JSON.stringify({
            serviceType: 'CLEANING',
            scheduledDate: '2024-09-30',
            price: -100,
          }),
        }
      )

      const response = await POST(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Price must be a positive number')
    })

    it('should validate service type', async () => {
      ;(auth as jest.Mock).mockResolvedValue({
        user: { id: 'admin-1', role: 'ADMIN' },
      })
      ;(CustomerService.getCustomerById as jest.Mock).mockResolvedValue({
        id: 'customer-1',
      })

      const request = new NextRequest(
        'http://localhost:3000/api/customers/customer-1/jobs',
        {
          method: 'POST',
          body: JSON.stringify({
            serviceType: 'INVALID_TYPE',
            scheduledDate: '2024-09-30',
            price: 2500,
          }),
        }
      )

      const response = await POST(request, { params: { id: 'customer-1' } })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid service type')
    })
  })
})
