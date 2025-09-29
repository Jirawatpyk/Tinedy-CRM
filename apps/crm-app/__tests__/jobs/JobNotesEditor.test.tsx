import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobNotesEditor } from '@/components/shared/JobNotesEditor'

// Mock fetch
global.fetch = vi.fn()

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('JobNotesEditor', () => {
  const mockProps = {
    jobId: 'job-123',
    initialNotes: 'Initial notes content',
    onNotesChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.useRealTimers()
  })

  test('renders with initial notes', () => {
    render(<JobNotesEditor {...mockProps} />)

    expect(screen.getByText('หมายเหตุเพิ่มเติม')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('Initial notes content')
    ).toBeInTheDocument()
    expect(screen.getByText('เหลือ 1978 ตัวอักษร')).toBeInTheDocument()
  })

  test('renders with empty notes', () => {
    const propsWithEmptyNotes = {
      ...mockProps,
      initialNotes: '',
    }

    render(<JobNotesEditor {...propsWithEmptyNotes} />)

    expect(
      screen.getByPlaceholderText('เพิ่มหมายเหตุสำหรับงานนี้...')
    ).toBeInTheDocument()
    expect(screen.getByText('เหลือ 2000 ตัวอักษร')).toBeInTheDocument()
  })

  test('updates character counter when typing', () => {
    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'New content' } })

    expect(screen.getByText('เหลือ 1989 ตัวอักษร')).toBeInTheDocument()
  })

  test('shows unsaved changes badge when content changes', () => {
    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Modified content' } })

    expect(
      screen.getByText('มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก')
    ).toBeInTheDocument()
  })

  test('enables save button when there are unsaved changes', () => {
    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Modified content' } })

    const saveButton = screen.getByText('บันทึกหมายเหตุ')
    expect(saveButton).not.toBeDisabled()
  })

  test('disables save button when over character limit', () => {
    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    const longText = 'a'.repeat(2001) // Over the 2000 character limit
    fireEvent.change(textarea, { target: { value: longText } })

    expect(screen.getByText('เกินจำนวนตัวอักษร 1 ตัว')).toBeInTheDocument()
    expect(screen.getByText('บันทึกหมายเหตุ')).toBeDisabled()
  })

  test('shows warning when approaching character limit', () => {
    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    const longText = 'a'.repeat(1950) // Close to limit
    fireEvent.change(textarea, { target: { value: longText } })

    const characterCounter = screen.getByText('เหลือ 50 ตัวอักษร')
    expect(characterCounter).toHaveClass('text-orange-500')
  })

  test('successfully saves notes via API', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notes: 'Updated notes' }),
    } as Response)

    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Updated notes' } })

    const saveButton = screen.getByText('บันทึกหมายเหตุ')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Updated notes',
        }),
      })
    })
  })

  test('auto-saves after delay', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notes: 'Auto-saved notes' }),
    } as Response)

    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Auto-saved notes' } })

    // Fast-forward time to trigger auto-save
    vi.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Auto-saved notes',
        }),
      })
    })
  })

  test('shows discard changes dialog when clicking discard', () => {
    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Modified content' } })

    const discardButton = screen.getByText('ยกเลิกการเปลี่ยนแปลง')
    fireEvent.click(discardButton)

    expect(
      screen.getByText('ยืนยันการยกเลิกการเปลี่ยนแปลง')
    ).toBeInTheDocument()
    expect(screen.getByText(/ยังไม่ได้บันทึก/)).toBeInTheDocument()
  })

  test('discards changes and reverts to original content', () => {
    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Modified content' } })

    const discardButton = screen.getByText('ยกเลิกการเปลี่ยนแปลง')
    fireEvent.click(discardButton)

    const confirmDiscardButton = screen.getByText('ยกเลิกการเปลี่ยนแปลง')
    fireEvent.click(confirmDiscardButton)

    expect(
      screen.getByDisplayValue('Initial notes content')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก')
    ).not.toBeInTheDocument()
  })

  test('handles API error gracefully', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Save failed' }),
    } as Response)

    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Updated notes' } })

    const saveButton = screen.getByText('บันทึกหมายเหตุ')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  test('shows loading state when saving', async () => {
    const mockFetch = vi.mocked(fetch)
    // Mock a delayed response
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ notes: 'Updated notes' }),
              } as Response),
            100
          )
        )
    )

    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Updated notes' } })

    const saveButton = screen.getByText('บันทึกหมายเหตุ')
    fireEvent.click(saveButton)

    expect(screen.getByText('กำลังบันทึก...')).toBeInTheDocument()
  })

  test('updates last saved time after successful save', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notes: 'Updated notes' }),
    } as Response)

    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Updated notes' } })

    const saveButton = screen.getByText('บันทึกหมายเหตุ')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/บันทึกล่าสุด:/)).toBeInTheDocument()
    })
  })

  test('calls onNotesChange callback when provided', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notes: 'Updated notes' }),
    } as Response)

    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: 'Updated notes' } })

    const saveButton = screen.getByText('บันทึกหมายเหตุ')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockProps.onNotesChange).toHaveBeenCalledWith('Updated notes')
    })
  })

  test('trims whitespace before saving', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notes: 'Trimmed notes' }),
    } as Response)

    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: '  Trimmed notes  ' } })

    const saveButton = screen.getByText('บันทึกหมายเหตุ')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Trimmed notes',
        }),
      })
    })
  })

  test('sends null for empty notes', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notes: null }),
    } as Response)

    render(<JobNotesEditor {...mockProps} />)

    const textarea = screen.getByDisplayValue('Initial notes content')
    fireEvent.change(textarea, { target: { value: '   ' } }) // Only whitespace

    const saveButton = screen.getByText('บันทึกหมายเหตุ')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/job-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: null,
        }),
      })
    })
  })
})
