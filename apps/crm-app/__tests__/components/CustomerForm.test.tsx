import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { Customer } from '@prisma/client'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: mockRefresh,
  }),
}))

// Mock window.location.reload
delete (window as any).location
;(window as any).location = { reload: jest.fn() }

// Mock fetch
global.fetch = jest.fn()

const mockCustomer: Customer = {
  id: '1',
  name: 'John Doe',
  phone: '0812345678',
  address: '123 Test Street',
  contactChannel: 'LINE',
  status: 'ACTIVE',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
}

describe('CustomerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
    ;(fetch as jest.Mock).mockReset()
    mockPush.mockClear()
    mockBack.mockClear()
    mockRefresh.mockClear()
  })

  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      render(<CustomerForm mode="create" />)

      expect(screen.getByText('เพิ่มลูกค้าใหม่')).toBeInTheDocument()
      expect(screen.getByLabelText('ชื่อลูกค้า *')).toHaveValue('')
      expect(screen.getByLabelText('เบอร์โทรศัพท์ *')).toHaveValue('')
      expect(screen.getByLabelText('ช่องทางติดต่อ *')).toHaveValue('')
      expect(screen.getByLabelText('ที่อยู่')).toHaveValue('')
      expect(screen.getByText('สร้างลูกค้า')).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      render(<CustomerForm mode="create" />)

      fireEvent.click(screen.getByText('สร้างลูกค้า'))

      await waitFor(() => {
        expect(screen.getByText('กรุณาระบุชื่อลูกค้า')).toBeInTheDocument()
        expect(screen.getByText('กรุณาระบุเบอร์โทรศัพท์')).toBeInTheDocument()
        expect(screen.getByText('กรุณาระบุช่องทางติดต่อ')).toBeInTheDocument()
      })
    })

    it('should submit valid data and redirect on success', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomer,
      })

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('ชื่อลูกค้า *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('เบอร์โทรศัพท์ *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('ช่องทางติดต่อ *'), {
        target: { value: 'LINE' },
      })
      fireEvent.change(screen.getByLabelText('ที่อยู่'), {
        target: { value: '123 Test Street' },
      })

      fireEvent.click(screen.getByText('สร้างลูกค้า'))

      await waitFor(
        () => {
          expect(fetch).toHaveBeenCalledWith('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'John Doe',
              phone: '0812345678',
              address: '123 Test Street',
              contactChannel: 'LINE',
            }),
          })
        },
        { timeout: 3000 }
      )

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/customers')
        },
        { timeout: 3000 }
      )
    })

    it('should display server validation errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation failed',
          errors: {
            phone: 'Phone number already exists',
          },
        }),
      })

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('ชื่อลูกค้า *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('เบอร์โทรศัพท์ *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('ช่องทางติดต่อ *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('สร้างลูกค้า'))

      await waitFor(() => {
        expect(
          screen.getByText('Phone number already exists')
        ).toBeInTheDocument()
      })
    })

    it('should display general error messages', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error',
        }),
      })

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('ชื่อลูกค้า *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('เบอร์โทรศัพท์ *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('ช่องทางติดต่อ *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('สร้างลูกค้า'))

      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument()
      })
    })
  })

  describe('Edit Mode', () => {
    it('should render edit form with pre-populated fields', () => {
      render(<CustomerForm mode="edit" customer={mockCustomer} />)

      expect(screen.getByText('แก้ไขข้อมูลลูกค้า')).toBeInTheDocument()
      expect(screen.getByLabelText('ชื่อลูกค้า *')).toHaveValue('John Doe')
      expect(screen.getByLabelText('เบอร์โทรศัพท์ *')).toHaveValue('0812345678')
      expect(screen.getByLabelText('ช่องทางติดต่อ *')).toHaveValue('LINE')
      expect(screen.getByLabelText('ที่อยู่')).toHaveValue('123 Test Street')
      expect(screen.getByText('บันทึกข้อมูล')).toBeInTheDocument()
    })

    it('should submit updated data', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockCustomer, name: 'Jane Doe' }),
      })

      render(<CustomerForm mode="edit" customer={mockCustomer} />)

      fireEvent.change(screen.getByLabelText('ชื่อลูกค้า *'), {
        target: { value: 'Jane Doe' },
      })

      fireEvent.click(screen.getByText('บันทึกข้อมูล'))

      await waitFor(
        () => {
          expect(fetch).toHaveBeenCalledWith('/api/customers/1', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Jane Doe',
              phone: '0812345678',
              address: '123 Test Street',
              contactChannel: 'LINE',
            }),
          })
        },
        { timeout: 3000 }
      )
    })

    it('should handle edit validation errors', async () => {
      render(<CustomerForm mode="edit" customer={mockCustomer} />)

      // Clear the name field - this will trigger client-side validation
      const nameInput = screen.getByLabelText('ชื่อลูกค้า *')
      fireEvent.change(nameInput, {
        target: { value: '' },
      })

      fireEvent.click(screen.getByText('บันทึกข้อมูล'))

      // Should show client-side validation error (Thai text)
      await waitFor(
        () => {
          expect(screen.getByText('กรุณาระบุชื่อลูกค้า')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      // Verify fetch was not called due to client-side validation failure
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('Form Interaction', () => {
    it('should show loading state during submission', async () => {
      let resolvePromise: (value: any) => void
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(fetch as jest.Mock).mockImplementation(() => fetchPromise)

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('ชื่อลูกค้า *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('เบอร์โทรศัพท์ *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('ช่องทางติดต่อ *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('สร้างลูกค้า'))

      // Loading state should appear immediately
      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
        expect(screen.getByText('สร้างลูกค้า')).toBeDisabled()
        expect(screen.getByText('ยกเลิก')).toBeDisabled()
      })

      // Resolve the fetch promise
      resolvePromise!({ ok: true, json: async () => mockCustomer })

      // Wait for submission to complete
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/customers')
        },
        { timeout: 3000 }
      )
    })

    it('should cancel and go back', () => {
      render(<CustomerForm mode="create" />)

      fireEvent.click(screen.getByText('ยกเลิก'))

      expect(mockBack).toHaveBeenCalled()
    })

    it('should call onSuccess callback when provided', async () => {
      const mockOnSuccess = jest.fn()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomer,
      })

      render(<CustomerForm mode="create" onSuccess={mockOnSuccess} />)

      fireEvent.change(screen.getByLabelText('ชื่อลูกค้า *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('เบอร์โทรศัพท์ *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('ช่องทางติดต่อ *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('สร้างลูกค้า'))

      await waitFor(
        () => {
          expect(mockOnSuccess).toHaveBeenCalled()
          expect(mockPush).not.toHaveBeenCalled()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Network Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('ชื่อลูกค้า *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('เบอร์โทรศัพท์ *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('ช่องทางติดต่อ *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('สร้างลูกค้า'))

      await waitFor(
        () => {
          expect(screen.getByText('Network error')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })
})
