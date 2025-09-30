import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobStatusDropdown } from '@/components/shared/JobStatusDropdown'
import { JobStatus } from '@/lib/db'
import '@testing-library/jest-dom'

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

describe('JobStatusDropdown', () => {
  const mockProps = {
    jobId: 'job-123',
    currentStatus: JobStatus.NEW,
    onStatusChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
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
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
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
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
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
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
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
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
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

// ========================================
// Story 2.6: Filtered Status Options Tests
// ========================================
describe('JobStatusDropdown - Filtered Options (Story 2.6)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('NEW status dropdown shows only ASSIGNED and CANCELLED options', async () => {
    render(
      <JobStatusDropdown
        jobId="job-123"
        currentStatus={JobStatus.NEW}
        onStatusChange={jest.fn()}
      />
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    // Should show current status + valid next statuses
    await waitFor(() => {
      expect(screen.getByText('งานใหม่')).toBeInTheDocument() // Current status
      expect(screen.getByText('ได้รับมอบหมาย')).toBeInTheDocument() // ASSIGNED
      expect(screen.getByText('ยกเลิก')).toBeInTheDocument() // CANCELLED
    })

    // Should NOT show invalid transitions
    expect(screen.queryByText('กำลังดำเนินการ')).not.toBeInTheDocument() // IN_PROGRESS
    expect(screen.queryByText('เสร็จแล้ว')).not.toBeInTheDocument() // COMPLETED/DONE
    expect(screen.queryByText('หยุดชั่วคราว')).not.toBeInTheDocument() // ON_HOLD
  })

  test('ASSIGNED status dropdown shows only IN_PROGRESS and CANCELLED options', async () => {
    render(
      <JobStatusDropdown
        jobId="job-123"
        currentStatus={JobStatus.ASSIGNED}
        onStatusChange={jest.fn()}
      />
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('ได้รับมอบหมาย')).toBeInTheDocument() // Current status
      expect(screen.getByText('กำลังดำเนินการ')).toBeInTheDocument() // IN_PROGRESS
      expect(screen.getByText('ยกเลิก')).toBeInTheDocument() // CANCELLED
    })

    // Should NOT show invalid transitions
    expect(screen.queryByText('งานใหม่')).not.toBeInTheDocument() // NEW
    expect(screen.queryByText('เสร็จแล้ว')).not.toBeInTheDocument() // COMPLETED/DONE
    expect(screen.queryByText('หยุดชั่วคราว')).not.toBeInTheDocument() // ON_HOLD
  })

  test('IN_PROGRESS status dropdown shows COMPLETED, ON_HOLD, and CANCELLED options', async () => {
    render(
      <JobStatusDropdown
        jobId="job-123"
        currentStatus={JobStatus.IN_PROGRESS}
        onStatusChange={jest.fn()}
      />
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('กำลังดำเนินการ')).toBeInTheDocument() // Current status
      expect(screen.getByText('เสร็จแล้ว')).toBeInTheDocument() // COMPLETED/DONE
      expect(screen.getByText('หยุดชั่วคราว')).toBeInTheDocument() // ON_HOLD
      expect(screen.getByText('ยกเลิก')).toBeInTheDocument() // CANCELLED
    })

    // Should NOT show invalid transitions
    expect(screen.queryByText('งานใหม่')).not.toBeInTheDocument() // NEW
    expect(screen.queryByText('ได้รับมอบหมาย')).not.toBeInTheDocument() // ASSIGNED
  })

  test('ON_HOLD status dropdown shows only IN_PROGRESS and CANCELLED options', async () => {
    render(
      <JobStatusDropdown
        jobId="job-123"
        currentStatus={JobStatus.ON_HOLD}
        onStatusChange={jest.fn()}
      />
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('หยุดชั่วคราว')).toBeInTheDocument() // Current status
      expect(screen.getByText('กำลังดำเนินการ')).toBeInTheDocument() // IN_PROGRESS (resume)
      expect(screen.getByText('ยกเลิก')).toBeInTheDocument() // CANCELLED
    })

    // Should NOT show invalid transitions
    expect(screen.queryByText('งานใหม่')).not.toBeInTheDocument() // NEW
    expect(screen.queryByText('ได้รับมอบหมาย')).not.toBeInTheDocument() // ASSIGNED
    expect(screen.queryByText('เสร็จแล้ว')).not.toBeInTheDocument() // COMPLETED/DONE
  })

  test('COMPLETED terminal status dropdown shows only current status (no transitions)', async () => {
    render(
      <JobStatusDropdown
        jobId="job-123"
        currentStatus={JobStatus.COMPLETED}
        onStatusChange={jest.fn()}
      />
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Should only show current status (terminal state)
      expect(screen.getByText('เสร็จแล้ว')).toBeInTheDocument() // COMPLETED
    })

    // Should NOT show any other statuses (terminal state)
    expect(screen.queryByText('งานใหม่')).not.toBeInTheDocument()
    expect(screen.queryByText('ได้รับมอบหมาย')).not.toBeInTheDocument()
    expect(screen.queryByText('กำลังดำเนินการ')).not.toBeInTheDocument()
    expect(screen.queryByText('หยุดชั่วคราว')).not.toBeInTheDocument()
    expect(screen.queryByText('ยกเลิก')).not.toBeInTheDocument()
  })

  test('CANCELLED terminal status dropdown shows only current status (no transitions)', async () => {
    render(
      <JobStatusDropdown
        jobId="job-123"
        currentStatus={JobStatus.CANCELLED}
        onStatusChange={jest.fn()}
      />
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('ยกเลิก')).toBeInTheDocument() // CANCELLED
    })

    // Should NOT show any other statuses (terminal state)
    expect(screen.queryByText('งานใหม่')).not.toBeInTheDocument()
    expect(screen.queryByText('ได้รับมอบหมาย')).not.toBeInTheDocument()
    expect(screen.queryByText('กำลังดำเนินการ')).not.toBeInTheDocument()
    expect(screen.queryByText('เสร็จแล้ว')).not.toBeInTheDocument()
    expect(screen.queryByText('หยุดชั่วคราว')).not.toBeInTheDocument()
  })

  test('dropdown options update when currentStatus prop changes', async () => {
    const { rerender } = render(
      <JobStatusDropdown
        jobId="job-123"
        currentStatus={JobStatus.NEW}
        onStatusChange={jest.fn()}
      />
    )

    let trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    // Initial state - NEW status
    await waitFor(() => {
      expect(screen.getByText('ได้รับมอบหมาย')).toBeInTheDocument() // ASSIGNED
    })

    // Close dropdown
    fireEvent.click(trigger)

    // Rerender with different status
    rerender(
      <JobStatusDropdown
        jobId="job-123"
        currentStatus={JobStatus.IN_PROGRESS}
        onStatusChange={jest.fn()}
      />
    )

    trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    // Updated state - IN_PROGRESS status
    await waitFor(() => {
      expect(screen.getByText('เสร็จแล้ว')).toBeInTheDocument() // COMPLETED
      expect(screen.getByText('หยุดชั่วคราว')).toBeInTheDocument() // ON_HOLD
    })

    // Options from NEW status should not appear
    expect(screen.queryByText('ได้รับมอบหมาย')).not.toBeInTheDocument()
  })
})
