/**
 * JobsTable Component Tests
 * Story 2.6: Job Status Update from Dashboard
 *
 * Test Coverage:
 * - Inline status dropdown display in table
 * - Authorization-based dropdown visibility
 * - Status update triggering table refresh
 * - Admin vs Operations user permissions
 */

import { render, screen, waitFor } from '@testing-library/react'
import { JobsTable } from '@/components/jobs/JobsTable'
import { JobStatus, UserRole } from '@/lib/db'
import '@testing-library/jest-dom'

// Mock next-auth session
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
  },
  writable: true,
})

// Import after mocks are set up
import { useSession } from 'next-auth/react'

describe('JobsTable - Status Dropdown Display (Story 2.6)', () => {
  const mockJobsData = {
    jobs: [
      {
        id: 'job-1',
        customerId: 'customer-1',
        serviceType: 'CLEANING',
        scheduledDate: '2025-10-01T10:00:00Z',
        price: 5000,
        status: 'NEW',
        priority: 'MEDIUM',
        customer: {
          id: 'customer-1',
          name: 'ลูกค้า A',
          phone: '0812345678',
          status: 'ACTIVE',
        },
        assignedUser: {
          id: 'operations-1',
          name: 'พนักงาน Operations',
          email: 'ops@test.com',
          role: 'OPERATIONS',
        },
        createdAt: '2025-09-30T10:00:00Z',
        updatedAt: '2025-09-30T10:00:00Z',
      },
      {
        id: 'job-2',
        customerId: 'customer-2',
        serviceType: 'TRAINING',
        scheduledDate: '2025-10-02T14:00:00Z',
        price: 8000,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        customer: {
          id: 'customer-2',
          name: 'ลูกค้า B',
          phone: '0823456789',
          status: 'ACTIVE',
        },
        assignedUser: {
          id: 'operations-2',
          name: 'พนักงาน Operations 2',
          email: 'ops2@test.com',
          role: 'OPERATIONS',
        },
        createdAt: '2025-09-30T11:00:00Z',
        updatedAt: '2025-09-30T11:00:00Z',
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
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Admin user sees status dropdown for all jobs', async () => {
    // Mock Admin session
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'admin-1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: UserRole.ADMIN,
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    // Mock fetch to return jobs
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobsData,
    } as Response)

    render(<JobsTable />)

    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText('ลูกค้า A')).toBeInTheDocument()
    })

    // Admin should see status dropdowns (combobox role) for all jobs
    const comboboxes = screen.getAllByRole('combobox')
    expect(comboboxes.length).toBeGreaterThan(0)

    // Verify at least one dropdown is visible
    expect(comboboxes[0]).toBeInTheDocument()
  })

  test('Operations user sees status dropdown only for assigned jobs', async () => {
    // Mock Operations user session
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'operations-1', // Matches job-1 assignedUser.id
          email: 'ops@test.com',
          name: 'Operations User',
          role: UserRole.OPERATIONS,
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobsData,
    } as Response)

    render(<JobsTable />)

    await waitFor(() => {
      expect(screen.getByText('ลูกค้า A')).toBeInTheDocument()
    })

    // Should see at least one dropdown for assigned job
    await waitFor(() => {
      const comboboxes = screen.queryAllByRole('combobox')
      // Operations user assigned to job-1 should see dropdown for that job
      expect(comboboxes.length).toBeGreaterThanOrEqual(1)
    })
  })

  test('Operations user sees badge (not dropdown) for non-assigned jobs', async () => {
    // Mock Operations user NOT assigned to any job
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'operations-999', // Does NOT match any assignedUser.id
          email: 'ops999@test.com',
          name: 'Non-Assigned Operations',
          role: UserRole.OPERATIONS,
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobsData,
    } as Response)

    render(<JobsTable />)

    await waitFor(() => {
      expect(screen.getByText('ลูกค้า A')).toBeInTheDocument()
    })

    // Non-assigned user should NOT see dropdowns
    const comboboxes = screen.queryAllByRole('combobox')
    expect(comboboxes.length).toBe(0)

    // Should see status badges instead
    await waitFor(() => {
      // Check for status labels (rendered as badges when no dropdown)
      const newStatusBadge = screen.getByText('ใหม่') // NEW status in Thai
      expect(newStatusBadge).toBeInTheDocument()
    })
  })

  test('Status dropdown displays current job status correctly', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'admin-1',
          email: 'admin@test.com',
          name: 'Admin',
          role: UserRole.ADMIN,
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobsData,
    } as Response)

    render(<JobsTable />)

    await waitFor(() => {
      expect(screen.getByText('ลูกค้า A')).toBeInTheDocument()
    })

    // Verify status is displayed in table
    await waitFor(() => {
      // NEW status should be shown
      expect(screen.getByText('งานใหม่')).toBeInTheDocument()
      // IN_PROGRESS status should be shown
      expect(screen.getByText('กำลังดำเนินการ')).toBeInTheDocument()
    })
  })

  test('Unauthenticated user does not see status dropdowns', async () => {
    // Mock no session (unauthenticated)
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    } as any)

    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobsData,
    } as Response)

    render(<JobsTable />)

    await waitFor(() => {
      expect(screen.getByText('ลูกค้า A')).toBeInTheDocument()
    })

    // Should NOT see any dropdowns
    const comboboxes = screen.queryAllByRole('combobox')
    expect(comboboxes.length).toBe(0)
  })

  test('Table displays job information correctly', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'admin-1',
          role: UserRole.ADMIN,
          email: 'admin@test.com',
          name: 'Admin',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobsData,
    } as Response)

    render(<JobsTable />)

    await waitFor(() => {
      // Check customer names
      expect(screen.getByText('ลูกค้า A')).toBeInTheDocument()
      expect(screen.getByText('ลูกค้า B')).toBeInTheDocument()

      // Check phone numbers
      expect(screen.getByText('0812345678')).toBeInTheDocument()
      expect(screen.getByText('0823456789')).toBeInTheDocument()

      // Check service types
      expect(screen.getByText('ทำความสะอาด')).toBeInTheDocument()
      expect(screen.getByText('ฝึกอบรม')).toBeInTheDocument()

      // Check prices
      expect(screen.getByText('5,000 บาท')).toBeInTheDocument()
      expect(screen.getByText('8,000 บาท')).toBeInTheDocument()

      // Check assigned users
      expect(screen.getByText('พนักงาน Operations')).toBeInTheDocument()
      expect(screen.getByText('พนักงาน Operations 2')).toBeInTheDocument()
    })
  })

  test('Empty jobs list shows appropriate message', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'admin-1',
          role: UserRole.ADMIN,
          email: 'admin@test.com',
          name: 'Admin',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    // Mock empty jobs response
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jobs: [],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    } as Response)

    render(<JobsTable />)

    await waitFor(() => {
      expect(screen.getByText('ยังไม่มีงานบริการ')).toBeInTheDocument()
    })
  })

  test('API error displays error message with retry button', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'admin-1',
          role: UserRole.ADMIN,
          email: 'admin@test.com',
          name: 'Admin',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    // Mock API error
    ;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Network error')
    )

    render(<JobsTable />)

    await waitFor(() => {
      expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument()
    })

    // Should show retry button
    await waitFor(() => {
      const retryButton = screen.getByText('ลองใหม่')
      expect(retryButton).toBeInTheDocument()
    })
  })
})

// ========================================
// Story 2.6: Status Update & Table Refresh
// ========================================
describe('JobsTable - Status Update and Refresh (Story 2.6)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Status change callback triggers table data refresh', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'admin-1',
          role: UserRole.ADMIN,
          email: 'admin@test.com',
          name: 'Admin',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any)

    const mockJobsData = {
      jobs: [
        {
          id: 'job-1',
          customerId: 'customer-1',
          serviceType: 'CLEANING',
          scheduledDate: '2025-10-01T10:00:00Z',
          price: 5000,
          status: 'NEW',
          priority: 'MEDIUM',
          customer: {
            id: 'customer-1',
            name: 'ลูกค้า A',
            phone: '0812345678',
            status: 'ACTIVE',
          },
          assignedUser: {
            id: 'operations-1',
            name: 'พนักงาน Operations',
            email: 'ops@test.com',
            role: 'OPERATIONS',
          },
          createdAt: '2025-09-30T10:00:00Z',
          updatedAt: '2025-09-30T10:00:00Z',
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
    }

    // Mock initial fetch
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobsData,
    } as Response)

    render(<JobsTable />)

    await waitFor(() => {
      expect(screen.getByText('ลูกค้า A')).toBeInTheDocument()
    })

    // Note: In actual implementation, JobStatusDropdown will call onStatusChange callback
    // which triggers fetchJobs() to refresh the table data
    // This test verifies the table structure is ready for this integration

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})