import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobStatusDropdown } from '@/components/shared/JobStatusDropdown'
import { JobStatus } from '@prisma/client'

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

describe('JobStatusDropdown', () => {
  const mockProps = {
    jobId: 'job-123',
    currentStatus: JobStatus.NEW,
    onStatusChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('renders current status badge correctly', () => {
    render(<JobStatusDropdown {...mockProps} />)

    expect(screen.getByText('งานใหม่')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  test('displays all status options in dropdown', async () => {
    render(<JobStatusDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('งานใหม่')).toBeInTheDocument()
      expect(screen.getByText('กำลังดำเนินการ')).toBeInTheDocument()
      expect(screen.getByText('เสร็จแล้ว')).toBeInTheDocument()
      expect(screen.getByText('หยุดชั่วคราว')).toBeInTheDocument()
      expect(screen.getByText('ยกเลิก')).toBeInTheDocument()
    })
  })

  test('shows confirmation dialog when changing status', async () => {
    render(<JobStatusDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const inProgressOption = screen.getByText('กำลังดำเนินการ')
      fireEvent.click(inProgressOption)
    })

    await waitFor(() => {
      expect(screen.getByText('ยืนยันการเปลี่ยนสถานะ')).toBeInTheDocument()
      expect(
        screen.getByText(/จาก "งานใหม่" เป็น "กำลังดำเนินการ"/)
      ).toBeInTheDocument()
    })
  })

  test('shows special confirmation for COMPLETED status', async () => {
    render(<JobStatusDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const completedOption = screen.getByText('เสร็จแล้ว')
      fireEvent.click(completedOption)
    })

    await waitFor(() => {
      expect(screen.getByText('ยืนยันการเสร็จสิ้นงาน')).toBeInTheDocument()
      expect(
        screen.getByText(/วันที่เสร็จจะถูกบันทึกโดยอัตโนมัติ/)
      ).toBeInTheDocument()
    })
  })

  test('shows special confirmation for CANCELLED status', async () => {
    render(<JobStatusDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const cancelledOption = screen.getByText('ยกเลิก')
      fireEvent.click(cancelledOption)
    })

    await waitFor(() => {
      expect(screen.getByText('ยืนยันการยกเลิกงาน')).toBeInTheDocument()
      expect(
        screen.getByText(/การยกเลิกจะส่งผลต่อการติดตามงาน/)
      ).toBeInTheDocument()
    })
  })

  test('cancels status change when clicking cancel', async () => {
    render(<JobStatusDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const inProgressOption = screen.getByText('กำลังดำเนินการ')
      fireEvent.click(inProgressOption)
    })

    await waitFor(() => {
      const cancelButton = screen.getByText('ยกเลิก')
      fireEvent.click(cancelButton)
    })

    await waitFor(() => {
      expect(
        screen.queryByText('ยืนยันการเปลี่ยนสถานะ')
      ).not.toBeInTheDocument()
    })
  })

  test('successfully updates status via API', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: JobStatus.IN_PROGRESS }),
    } as Response)

    render(<JobStatusDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const inProgressOption = screen.getByText('กำลังดำเนินการ')
      fireEvent.click(inProgressOption)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('เปลี่ยนสถานะ')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: JobStatus.IN_PROGRESS,
        }),
      })
    })
  })

  test('handles API error gracefully', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    } as Response)

    render(<JobStatusDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const inProgressOption = screen.getByText('กำลังดำเนินการ')
      fireEvent.click(inProgressOption)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('เปลี่ยนสถานะ')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  test('disables select when loading', async () => {
    const mockFetch = vi.mocked(fetch)
    // Mock a delayed response
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ status: JobStatus.IN_PROGRESS }),
              } as Response),
            100
          )
        )
    )

    render(<JobStatusDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const inProgressOption = screen.getByText('กำลังดำเนินการ')
      fireEvent.click(inProgressOption)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('เปลี่ยนสถานะ')
      fireEvent.click(confirmButton)
    })

    // Check that loading state is shown
    await waitFor(() => {
      expect(screen.getByText('กำลังอัปเดต...')).toBeInTheDocument()
    })
  })

  test('calls onStatusChange callback when provided', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: JobStatus.IN_PROGRESS }),
    } as Response)

    render(<JobStatusDropdown {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      const inProgressOption = screen.getByText('กำลังดำเนินการ')
      fireEvent.click(inProgressOption)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('เปลี่ยนสถานะ')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockProps.onStatusChange).toHaveBeenCalledWith(
        JobStatus.IN_PROGRESS
      )
    })
  })
})
