import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserAssignmentDropdown } from '@/components/shared/UserAssignmentDropdown'
import { UserRole } from '@prisma/client'

// Mock fetch
global.fetch = vi.fn()

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
})

describe('UserAssignmentDropdown', () => {
  const mockOperationsUsers = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: UserRole.OPERATIONS,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: UserRole.OPERATIONS,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const mockProps = {
    jobId: 'job-123',
    currentAssignedUser: null,
    operationsUsers: mockOperationsUsers,
    onAssignmentChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('renders unassigned state correctly', () => {
    render(<UserAssignmentDropdown {...mockProps} />)

    expect(screen.getByText('ผู้รับผิดชอบปัจจุบัน')).toBeInTheDocument()
    expect(screen.getByText('ยังไม่ได้มอบหมาย')).toBeInTheDocument()
    expect(screen.getByText('เปลี่ยนผู้รับผิดชอบ')).toBeInTheDocument()
  })

  test('renders assigned state correctly', () => {
    const propsWithAssignedUser = {
      ...mockProps,
      currentAssignedUser: mockOperationsUsers[0],
    }

    render(<UserAssignmentDropdown {...propsWithAssignedUser} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('(john@example.com)')).toBeInTheDocument()
    expect(screen.getByText('ยกเลิกมอบหมาย')).toBeInTheDocument()
  })

  test('displays all operations users in dropdown', async () => {
    render(<UserAssignmentDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('ยกเลิกการมอบหมาย')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  test('shows no users message when no operations users available', async () => {
    const propsWithNoUsers = {
      ...mockProps,
      operationsUsers: [],
    }

    render(<UserAssignmentDropdown {...propsWithNoUsers} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('ไม่มีผู้ใช้ทีมปฏิบัติการ')).toBeInTheDocument()
    })
  })

  test('shows assignment confirmation dialog', async () => {
    render(<UserAssignmentDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const johnOption = screen.getByText('John Doe')
      fireEvent.click(johnOption)
    })

    await waitFor(() => {
      expect(screen.getByText('ยืนยันการมอบหมายงาน')).toBeInTheDocument()
      expect(screen.getByText(/มอบหมายงานให้ "John Doe"/)).toBeInTheDocument()
    })
  })

  test('shows reassignment confirmation dialog', async () => {
    const propsWithAssignedUser = {
      ...mockProps,
      currentAssignedUser: mockOperationsUsers[0],
    }

    render(<UserAssignmentDropdown {...propsWithAssignedUser} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const janeOption = screen.getByText('Jane Smith')
      fireEvent.click(janeOption)
    })

    await waitFor(() => {
      expect(
        screen.getByText('ยืนยันการเปลี่ยนผู้รับผิดชอบ')
      ).toBeInTheDocument()
      expect(
        screen.getByText(/เปลี่ยนผู้รับผิดชอบจาก "John Doe" เป็น "Jane Smith"/)
      ).toBeInTheDocument()
    })
  })

  test('shows unassignment confirmation dialog', async () => {
    const propsWithAssignedUser = {
      ...mockProps,
      currentAssignedUser: mockOperationsUsers[0],
    }

    render(<UserAssignmentDropdown {...propsWithAssignedUser} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const unassignOption = screen.getByText('ยกเลิกการมอบหมาย')
      fireEvent.click(unassignOption)
    })

    await waitFor(() => {
      expect(screen.getByText('ยืนยันการยกเลิกมอบหมาย')).toBeInTheDocument()
      expect(
        screen.getByText(/ยกเลิกการมอบหมายงานจาก "John Doe"/)
      ).toBeInTheDocument()
    })
  })

  test('successfully assigns user via API', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assignedToId: 'user-1' }),
    } as Response)

    render(<UserAssignmentDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const johnOption = screen.getByText('John Doe')
      fireEvent.click(johnOption)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('มอบหมายงาน')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedToId: 'user-1',
        }),
      })
    })
  })

  test('successfully unassigns user via API', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assignedToId: null }),
    } as Response)

    const propsWithAssignedUser = {
      ...mockProps,
      currentAssignedUser: mockOperationsUsers[0],
    }

    render(<UserAssignmentDropdown {...propsWithAssignedUser} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const unassignOption = screen.getByText('ยกเลิกการมอบหมาย')
      fireEvent.click(unassignOption)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('ยกเลิกมอบหมาย')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedToId: null,
        }),
      })
    })
  })

  test('handles API error gracefully', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Assignment failed' }),
    } as Response)

    render(<UserAssignmentDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const johnOption = screen.getByText('John Doe')
      fireEvent.click(johnOption)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('มอบหมายงาน')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  test('quick unassign button works', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assignedToId: null }),
    } as Response)

    const propsWithAssignedUser = {
      ...mockProps,
      currentAssignedUser: mockOperationsUsers[0],
    }

    render(<UserAssignmentDropdown {...propsWithAssignedUser} />)

    const quickUnassignButton = screen.getByText('ยกเลิกมอบหมาย')
    fireEvent.click(quickUnassignButton)

    await waitFor(() => {
      expect(screen.getByText('ยืนยันการยกเลิกมอบหมาย')).toBeInTheDocument()
    })

    const confirmButton = screen.getByText('ยกเลิกมอบหมาย')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedToId: null,
        }),
      })
    })
  })

  test('calls onAssignmentChange callback when provided', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ assignedToId: 'user-1' }),
    } as Response)

    render(<UserAssignmentDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const johnOption = screen.getByText('John Doe')
      fireEvent.click(johnOption)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('มอบหมายงาน')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockProps.onAssignmentChange).toHaveBeenCalledWith(
        mockOperationsUsers[0]
      )
    })
  })

  test('cancels assignment when clicking cancel', async () => {
    render(<UserAssignmentDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const johnOption = screen.getByText('John Doe')
      fireEvent.click(johnOption)
    })

    await waitFor(() => {
      const cancelButton = screen.getByText('ยกเลิก')
      fireEvent.click(cancelButton)
    })

    await waitFor(() => {
      expect(screen.queryByText('ยืนยันการมอบหมายงาน')).not.toBeInTheDocument()
    })
  })
})
