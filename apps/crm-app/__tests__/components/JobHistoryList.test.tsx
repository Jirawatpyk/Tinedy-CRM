import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { JobHistoryList } from '@/components/shared/JobHistoryList'
import '@testing-library/jest-dom'

// Mock fetch
global.fetch = jest.fn()

describe('JobHistoryList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should display loading skeleton initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<JobHistoryList customerId="customer-1" />)

    // Should show skeleton loader
    const skeletons = document.querySelectorAll('.space-y-4')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should display jobs when data is loaded', async () => {
    const mockResponse = {
      success: true,
      data: {
        jobs: [
          {
            id: 'job-1',
            serviceType: 'CLEANING',
            scheduledDate: '2024-09-30T00:00:00.000Z',
            price: 2500,
            status: 'NEW',
            notes: 'Test note',
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
          },
          {
            id: 'job-2',
            serviceType: 'TRAINING',
            scheduledDate: '2024-09-29T00:00:00.000Z',
            price: 3500,
            status: 'IN_PROGRESS',
            notes: null,
            customer: {
              id: 'customer-1',
              name: 'Test Customer',
              phone: '02-123-4567',
            },
            assignedUser: null,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<JobHistoryList customerId="customer-1" />)

    await waitFor(() => {
      // Check for service types
      expect(screen.getByText('ทำความสะอาด')).toBeInTheDocument()
      expect(screen.getByText('ฝึกอบรม')).toBeInTheDocument()
    })

    // Check for status badges
    expect(screen.getByText('ใหม่')).toBeInTheDocument()
    expect(screen.getByText('กำลังดำเนินการ')).toBeInTheDocument()

    // Check for assigned user
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('ยังไม่มอบหมาย')).toBeInTheDocument()
  })

  it('should display empty state when no jobs exist', async () => {
    const mockResponse = {
      success: true,
      data: {
        jobs: [],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<JobHistoryList customerId="customer-1" />)

    await waitFor(() => {
      expect(screen.getByText('ยังไม่มีประวัติการให้บริการ')).toBeInTheDocument()
      expect(screen.getByText('ลูกค้าท่านนี้ยังไม่เคยใช้บริการของเรา')).toBeInTheDocument()
    })
  })

  it('should display error state when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<JobHistoryList customerId="customer-1" />)

    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาดที่ไม่คาดคิด')).toBeInTheDocument()
      expect(screen.getByText('ลองใหม่')).toBeInTheDocument()
    })
  })

  it('should handle 404 error for non-existent customer', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    render(<JobHistoryList customerId="non-existent" />)

    await waitFor(() => {
      expect(screen.getByText('ไม่พบข้อมูลลูกค้า')).toBeInTheDocument()
    })
  })

  it('should retry when retry button is clicked', async () => {
    // First call fails
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { rerender } = render(<JobHistoryList customerId="customer-1" />)

    await waitFor(() => {
      expect(screen.getByText('ลองใหม่')).toBeInTheDocument()
    })

    // Second call succeeds
    const mockResponse = {
      success: true,
      data: {
        jobs: [
          {
            id: 'job-1',
            serviceType: 'CLEANING',
            scheduledDate: '2024-09-30T00:00:00.000Z',
            price: 2500,
            status: 'NEW',
            customer: {
              id: 'customer-1',
              name: 'Test Customer',
              phone: '02-123-4567',
            },
            assignedUser: null,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    // Click retry button
    const retryButton = screen.getByText('ลองใหม่')
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('ทำความสะอาด')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should handle pagination correctly', async () => {
    const mockResponse = {
      success: true,
      data: {
        jobs: Array.from({ length: 20 }, (_, i) => ({
          id: `job-${i}`,
          serviceType: 'CLEANING',
          scheduledDate: '2024-09-30T00:00:00.000Z',
          price: 2500,
          status: 'NEW',
          customer: {
            id: 'customer-1',
            name: 'Test Customer',
            phone: '02-123-4567',
          },
          assignedUser: null,
        })),
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 45,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<JobHistoryList customerId="customer-1" />)

    await waitFor(() => {
      expect(screen.getByText('แสดง 1-20 จาก 45 รายการ')).toBeInTheDocument()
      expect(screen.getByText('หน้า 1 จาก 3')).toBeInTheDocument()
    })

    // Next page button should be enabled
    const nextButton = screen.getByText('ถัดไป')
    expect(nextButton.closest('button')).not.toBeDisabled()

    // Previous page button should be disabled
    const prevButton = screen.getByText('ก่อนหน้า')
    expect(prevButton.closest('button')).toBeDisabled()

    // Mock page 2 response
    const page2Response = {
      ...mockResponse,
      data: {
        ...mockResponse.data,
        pagination: {
          page: 2,
          limit: 20,
          totalCount: 45,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => page2Response,
    })

    // Click next page
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('แสดง 21-40 จาก 45 รายการ')).toBeInTheDocument()
      expect(screen.getByText('หน้า 2 จาก 3')).toBeInTheDocument()
    })

    // Both buttons should now be enabled
    expect(screen.getByText('ก่อนหน้า').closest('button')).not.toBeDisabled()
    expect(screen.getByText('ถัดไป').closest('button')).not.toBeDisabled()
  })

  it('should not show pagination for single page', async () => {
    const mockResponse = {
      success: true,
      data: {
        jobs: [
          {
            id: 'job-1',
            serviceType: 'CLEANING',
            scheduledDate: '2024-09-30T00:00:00.000Z',
            price: 2500,
            status: 'NEW',
            customer: {
              id: 'customer-1',
              name: 'Test Customer',
              phone: '02-123-4567',
            },
            assignedUser: null,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<JobHistoryList customerId="customer-1" />)

    await waitFor(() => {
      expect(screen.getByText('ทำความสะอาด')).toBeInTheDocument()
    })

    // Should not show pagination controls for single page
    expect(screen.queryByText('หน้า 1 จาก 1')).not.toBeInTheDocument()
    expect(screen.queryByText('ก่อนหน้า')).not.toBeInTheDocument()
    expect(screen.queryByText('ถัดไป')).not.toBeInTheDocument()
  })
})